from rest_framework import viewsets, status, request
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.http import HttpResponseBadRequest, JsonResponse
from rest_framework.authtoken.views import ObtainAuthToken
from shutil import copyfile
from uuid import uuid4
from django.conf import settings
from django.core.files.uploadedfile import UploadedFile
from django.utils.translation import gettext as _
import xml.etree.ElementTree as ET
import secrets
import base64
import logging

from ..models import File, SnapFile, Project, MergeConflict, SchoolClass, PasswordResetToken
from ..xmltools import analyze_file
from .serializers import SnapFileSerializer, ProjectSerializer, ProjectColorSerializer, RegistrationSerializer, SchoolClassSerializer
from django.shortcuts import get_object_or_404, get_list_or_404
from django_eventstream import send_event
from django.db.models import Q
from django.views.decorators.csrf import ensure_csrf_cookie
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator

from ..views import check_password, generate_unique_PIN, hashPassword


def sanitize_token(token):
    # Ensure token is valid URL-safe base64 to prevent token injection edge cases.
    try:
        sanitized_token = (
            base64.urlsafe_b64encode(base64.urlsafe_b64decode(token + "=="))
            .strip(b"=")
            .decode("utf-8")
        )
        if str(sanitized_token) != token:
            logging.log(
                logging.WARNING, f"Received token is not base64 encoded: {token}"
            )
            return None
    except Exception as e:
        logging.log(logging.INFO, f"Invalid token: {e}")
        return None
    return sanitized_token


def _validate_uploaded_snap_xml(uploaded_file):
    if not isinstance(uploaded_file, UploadedFile):
        raise ValueError(_("No valid xml."))
    try:
        ET.fromstring(uploaded_file.read())
        uploaded_file.seek(0)
    except ET.ParseError as exc:
        raise ValueError(_("No valid xml.")) from exc


def _create_initial_snap_file(project, uploaded_file, start_description):
    if uploaded_file:
        _validate_uploaded_snap_xml(uploaded_file)
        snap_file = SnapFile.create_and_save(
            file=uploaded_file,
            project=project,
            description=start_description or uploaded_file.name,
        )
    else:
        snap_file = SnapFile.create_and_save(
            project=project,
            description="blank project",
            file="",
        )
        snap_file.file = str(uuid4()) + ".xml"
        copyfile(
            settings.BASE_DIR + "/static/snap/blank_proj.xml",
            _get_snap_file_abs_path(snap_file),
        )
        snap_file.save()

    snap_file.xml_job()
    return snap_file


def _get_snap_file_abs_path(snap_file):
    return settings.BASE_DIR + snap_file.get_media_path()


def _update_snap_file_stats(snap_file):
    stats = analyze_file(snap_file.get_media_path())
    snap_file.number_scripts = stats[0]
    snap_file.number_sprites = stats[1]
    snap_file.save(update_fields=["number_scripts", "number_sprites"])

# Response mit gesetztem CSRF-Cookie
def _response_with_csrf_cookie(request, data, status_code):
    get_token(request)
    return Response(data, status=status_code)

# class ListSnapFilesView(generics.ListAPIView):
#     """
#     API endpoint that obtains a list of files that correspond to a given project.
#     """
#     queryset = SnapFile.objects.all().filter(id="")
#     serializer_class = SnapFileSerializer
#     lookup_field = 'project'
#     permission_classes = [permissions.AllowAny]

@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfCookieView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        return _response_with_csrf_cookie(request, {"detail": "CSRF cookie set"}, 200)

class CustomAuthToken(ObtainAuthToken):

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})

        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email
        })

class RegisterTeacherView(APIView):
    """Registration View"""

    def post(self, request, *args, **kwargs):
        """Handles post request logic"""
        registration_serializer = RegistrationSerializer(data=request.data)
        print("register endpoint")
        # Generate tokens for all existing users if none yet present
        for user in User.objects.all():
            if not user:
                break
            else:
                try:
                    Token.objects.get(user_id=user.id)
                except Token.DoesNotExist:
                    Token.objects.create(user=user)
        if registration_serializer.is_valid():
            if User.objects.filter(username=registration_serializer.getUsername(request.data)).exists():
                return Response({
                    "error": "Username already exists!",
                    "status": f"{status.HTTP_400_BAD_REQUEST} BAD REQUEST"
                })
            user = registration_serializer.create(request.data)
            token = Token.objects.create(user=user)

            return Response(
                {
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "is_active": user.is_active,
                        "is_staff": user.is_staff,
                    },
                    "status": {
                        "message": "User created",
                        "code": f"{status.HTTP_200_OK} OK",
                    },
                    "token": token.key,
                }
            )
        return Response(
            {
                "error": registration_serializer.errors,
                "status": f"{status.HTTP_203_NON_AUTHORITATIVE_INFORMATION} NON AUTHORITATIVE INFORMATION"
            }
        )


class TeacherTutorialStatusView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({"completed_tutorial": request.user.completed_tutorial}, status=200)

    def patch(self, request, *args, **kwargs):
        completed_tutorial = request.data.get("completed_tutorial")
        if not isinstance(completed_tutorial, bool):
            return Response(
                {"detail": "completed_tutorial must be a boolean."},
                status=400,
            )

        request.user.completed_tutorial = completed_tutorial
        request.user.save(update_fields=["completed_tutorial"])
        return Response({"completed_tutorial": request.user.completed_tutorial}, status=200)


class SchoolClassesView(generics.CreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = SchoolClass.objects.all()
    serializer_class = SchoolClassSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def post(self, request, *args, **kwargs):
        # serializer = SchoolClassSerializer(data=request.data)
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data)


class SchoolClassesForTeacherView(generics.ListAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    serializer_class = SchoolClassSerializer
    lookup_field = "id"
    queryset = SchoolClass.objects.all()

    # def get_serializer_context(self):
    #    context =  super().get_serializer_context()
    #    context['request'] = self.request
    #    return context

    def get_queryset(self):
        user = self.request.user
        return SchoolClass.objects.filter(teacher=user)

    def get(self, request, *args, **kwargs):
        teacher_id = self.kwargs.get(self.lookup_field)
        return self.list(request, *args, **kwargs)


class ProjectsForSchoolClassesView(generics.ListAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    serializer_class = ProjectSerializer
    lookup_field = "id"
    queryset = Project.objects.all()

    def get_queryset(self, **kwargs):
        schoolclass_id = self.kwargs.get(self.lookup_field)
        return Project.objects.filter(schoolclass=schoolclass_id)

def findDuplicateFromOriginal(og, duplicateList): #util function for duplication below, determines which file from the duplicateList is the duplicate of the og
    filepath_seperated = og.get_media_path().split('.')
    copy_filepath = filepath_seperated[0] + '_copy.' + filepath_seperated[1]
    duplicateFilepath = copy_filepath.split('/')[-1]
    for file in duplicateList:
        if (file.file == duplicateFilepath) and (file.description == og.description):
            return file
    return None


class DuplicateProject(generics.CreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    serializer_class = ProjectSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def post(self, request, *args, **kwargs):
        projectId = kwargs.get('id')
        originalProject = get_object_or_404(Project, id=projectId)
        newName = originalProject.name + " Kopie"
        duplicateProject = Project.objects.create(name=newName, description=originalProject.description,
                                                  picture=originalProject.picture,
                                                  schoolclass=originalProject.schoolclass,
                                                  password=originalProject.password, pin=generate_unique_PIN(),
                                                  kanban_board=originalProject.kanban_board)
        Project.save(duplicateProject)
        originalFiles = SnapFile.objects.filter(project=originalProject)
        duplicateFiles = []
        if originalFiles:
            for ogfile in originalFiles:
                filepath_seperated = ogfile.get_media_path().split('.')
                copy_filepath = filepath_seperated[0] + '_copy.' + filepath_seperated[1]
                copyfile(_get_snap_file_abs_path(ogfile), settings.BASE_DIR + copy_filepath)
                duplicateFile = SnapFile.create_and_save(project=duplicateProject, description=ogfile.description,
                                                         file=copy_filepath.split('/')[-1])
                duplicateFiles.append(duplicateFile)
            for ogfile in originalFiles:
                duplicateChild = findDuplicateFromOriginal(ogfile, duplicateFiles)
                for ancestor in ogfile.ancestors.all():
                    duplicateAncestor = findDuplicateFromOriginal(ancestor, duplicateFiles)
                    duplicateChild.ancestors.add(duplicateAncestor)
                SnapFile.save(duplicateChild)
        return Response(status="201", data=self.get_serializer(duplicateProject).data)


class ProjectCreationFromTeacherView(generics.CreateAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    serializer_class = ProjectSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def post(self, request, *args, **kwargs):
        name = (request.data.get("name") or "").strip()
        description = request.data.get("description") or ""
        start_description = request.data.get("start_description") or ""
        schoolclassId = request.data.get("schoolclass")
        schoolclass = get_object_or_404(SchoolClass, id=schoolclassId)

        if not name:
            return Response({"detail": _("Project name is required.")}, status=400)

        project_pin = generate_unique_PIN()

        project = Project.objects.create(
            name=name,
            description=description,
            pin=project_pin,
            schoolclass=schoolclass
        )

        try:
            _create_initial_snap_file(
                project,
                request.FILES.get("file"),
                start_description,
            )
        except ValueError as exc:
            project.delete()
            return Response({"detail": str(exc)}, status=400)

        serializer = self.get_serializer(project)
        return Response(serializer.data, status=201)


class ListSnapFilesView(generics.ListAPIView):
    """
    API endpoint that obtains a list of files that correspond to a given project.
    """

    serializer_class = SnapFileSerializer
    lookup_field = "id"
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """
        This view returns a list of all the SnapFiles for
        the project as determined by the project portion of the URL.
        """
        project_id = self.kwargs.get(self.lookup_field)
        project = get_object_or_404(Project, id=project_id)
        return SnapFile.objects.filter(project=project, hidden=False)


class ProjectDetailView(generics.RetrieveAPIView):
    """
    API endpoint that allows projects to be viewed.
    """

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = "id"
    permission_classes = [permissions.AllowAny]


class ProjectRetrieverWithPin(generics.RetrieveAPIView):
    """
    API endpoint that allows projects to be viewed when only knowing their pin.
    """

    serializer_class = ProjectSerializer
    lookup_field = "id"
    queryset = Project.objects.all()

    def get(self, request, **kwargs):
        project = Project.objects.get(pin=kwargs["id"])
        return Response(self.get_serializer(project).data)


class ProjectDetailUpdateView(generics.UpdateAPIView):
    """
    API endpoint that allows projects to be viewed.
    """

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = "id"
    permission_classes = [permissions.AllowAny]

    def put(self, request, *args, **kwargs):
        instance = self.get_object()

        cleanData = {"pin": instance.pin}
        if "description" in request.data.keys():
            cleanData["description"] = request.data["description"]
        if "name" in request.data.keys():
            cleanData["name"] = request.data["name"]
        if "kanban_board" in request.data.keys():
            cleanData["kanban_board"] = request.data["kanban_board"]
        if "schoolclass" in request.data.keys():
            cleanData["schoolclass"] = request.data["schoolclass"]
        if "password" not in request.data.keys():
            request.data["password"] = ""

        if instance.password is not None and instance.password is not '' and not check_password(
                request.data["password"], instance.password
        ):
            return Response(data="Wrong Password!", status=403)
        partial = kwargs.pop("partial", False)

        serializer = self.get_serializer(instance, data=cleanData, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        send_event(str(instance.id), "message", {"text": "projectChange"})
        return Response(data=serializer.data, status=200)


class ProjectImportUpdateView(generics.UpdateAPIView):
    """
    API endpoint that allows projects to be imported to a new Schoolclass.
    """

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = "id"
    permission_classes = [permissions.AllowAny]

    def put(self, request, *args, **kwargs):
        instance = self.get_object()

        cleanData = {"pin": instance.pin}
        if "description" in request.data.keys():
            cleanData["description"] = request.data["description"]
        if "name" in request.data.keys():
            cleanData["name"] = request.data["name"]
        if "kanban_board" in request.data.keys():
            cleanData["kanban_board"] = request.data["kanban_board"]
        if "schoolclass" in request.data.keys():
            cleanData["schoolclass"] = request.data["schoolclass"]
        if "password" not in request.data.keys():
            request.data["password"] = ""
        partial = kwargs.pop("partial", False)

        serializer = self.get_serializer(instance, data=cleanData, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        send_event(str(instance.id), "message", {"text": "projectChange"})
        return Response(data=serializer.data, status=200)


class ProjectUpdateKanbanView(generics.UpdateAPIView):
    """
    API endpoint to update the Kanban board.
    """

    queryset = Project.objects.all()
    lookup_field = "id"
    permission_classes = [permissions.AllowAny]
    serializer_class = ProjectSerializer

    def put(self, request, *args, **kwargs):
        project = self.get_object()

        if "kanban_board" in request.data.keys():
            project.kanban_board = request.data["kanban_board"]

        project.save()
        # Notify everyone to update the board
        send_event(str(project.id), "message", {"text": "projectChange_KanbanBoard"})
        return Response(data="Updated Kanbanboard.", status=200)


class SnapFileDetailView(generics.RetrieveAPIView):
    """
    API endpoint that allows file details to be viewed.
    """

    queryset = SnapFile.objects.all()
    serializer_class = SnapFileSerializer
    lookup_field = "id"
    permission_classes = [permissions.AllowAny]


class SnapFilePositionView(generics.UpdateAPIView):
    """
    API endpoint that allows for the position of a file to be updated.
    """

    serializer_class = SnapFileSerializer
    lookup_field = "id"
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        file_id = self.kwargs["id"]
        return SnapFile.objects.get(id=file_id)

    def put(self, request, *args, **kwargs):
        snap_file = self.get_object()
        snap_file.xPosition = request.data["x"]
        snap_file.yPosition = request.data["y"]
        snap_file.save()

        print(str(snap_file.project_id))
        send_event(str(snap_file.project_id), "message", {"text": "Update"})

        return Response(status=status.HTTP_200_OK)


class SnapFilePositionsView(generics.UpdateAPIView):
    """
    API endpoint that allows for the position of a file to be updated.
    """

    serializer_class = SnapFileSerializer
    lookup_field = "id"
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        file_id = self.kwargs["id"]
        project_id = SnapFile.objects.get(id=file_id).project.id
        return SnapFile.objects.filter(project=project_id)

    def put(self, request, *args, **kwargs):
        snap_files = self.get_queryset()
        for data in request.data:
            snap_file = snap_files.get(id=data["id"])
            # handle collapsed node movement
            if snap_file.collapsed:
                x_diff = data["position"]["x"] - snap_file.xPosition
                y_diff = data["position"]["y"] - snap_file.yPosition
                # get all children with project and parent id
                relevant_children = snap_files.filter(collapsed_under=snap_file).all()
                moveNodesRelative(relevant_children, x_diff, y_diff)
            snap_file.xPosition = data["position"]["x"]
            snap_file.yPosition = data["position"]["y"]
            snap_file.save()

        send_event(
            str(snap_files[0].project_id),
            "message",
            {"text": "Update_savedLayout"},
        )
        return Response(status=status.HTTP_200_OK)


def moveNodesRelative(nodes, x_diff, y_diff, level=0):
    # prevent to deep nesting...
    if level > 20:
        return
    for rc in nodes:
        rc.xPosition += x_diff
        rc.yPosition += y_diff
        if rc.collapsed:
            relevant_children = SnapFile.objects.filter(collapsed_under=rc).all()
            moveNodesRelative(relevant_children, x_diff, y_diff, level + 1)
    SnapFile.objects.bulk_update(nodes, ["xPosition", "yPosition"])


class ProjectChangePasswordView(generics.UpdateAPIView):
    """
    API endpoint that allows for the position of a file to be updated.
    """

    queryset = Project.objects.all()
    lookup_field = "id"
    permission_classes = [permissions.AllowAny]

    def put(self, request, *args, **kwargs):
        instance = self.get_object()

        if (
                "old-password" not in request.data.keys()
                or "new-password" not in request.data.keys()
        ):
            return Response(data="Missing Values!", status=400)

        if instance.password is None or check_password(
                request.data["old-password"], instance.password
        ):
            if request.data["new-password"] == "":
                instance.password = None
            else:
                instance.password = hashPassword(request.data["new-password"])
            instance.save()
            return Response(data="Password changed.", status=200)
        else:
            return Response(data="Wrong Password!", status=403)


class ProjectDeleteView(generics.DestroyAPIView):
    queryset = Project.objects.all()
    lookup_field = "id"
    permission_classes = [permissions.AllowAny]

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if "password" not in request.data.keys():
            return Response(data="Missing Password!", status=400)
        if instance.password is None or instance.password == "" or check_password(
                request.data["password"], instance.password
        ):
            instance.delete()
            return Response(data="Project Deleted!", status=300)
        else:
            return Response(data="Wrong Password!", status=403)
        return self.destroy(request, *args, **kwargs)


class MergeConflictDeleteView(generics.DestroyAPIView):
    queryset = MergeConflict.objects.all()
    lookup_field = "id"
    permission_classes = [permissions.AllowAny]

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        return self.destroy(request, *args, **kwargs)


class ProjectColorUpdateView(generics.UpdateAPIView):
    """
    API endpoint that allows for the position of a file to be updated.
    """

    queryset = Project.objects.all()
    lookup_field = "id"
    permission_classes = [permissions.AllowAny]

    def put(self, request, *args, **kwargs):
        project = self.get_object()
        old_default = project.default_color
        old_favor = project.favor_color
        old_conflict = project.conflict_color

        default_nodes = list(
            SnapFile.objects.filter(project=project, color=old_default)
        )
        favor_nodes = list(SnapFile.objects.filter(project=project, color=old_favor))
        conflict_nodes = list(
            SnapFile.objects.filter(project=project, color=old_conflict)
        )

        if "default_color" in request.data.keys():
            project.default_color = request.data["default_color"]
            for node in default_nodes:
                node.color = request.data["default_color"]
                node.save()

        if "favor_color" in request.data.keys():
            project.favor_color = request.data["favor_color"]
            for node in favor_nodes:
                node.color = request.data["favor_color"]
                node.save()

        if "conflict_color" in request.data.keys():
            project.conflict_color = request.data["conflict_color"]
            for node in conflict_nodes:
                node.color = request.data["conflict_color"]
                node.save()

        project.save()
        print(project.id)
        # notify room
        send_event(str(project.id), "message", {"text": "projectChange_color"})
        return Response(data="Updated Colors.", status=200)


class NodeLabelUpdateView(generics.UpdateAPIView):
    """
    API endpoint that allows for the description of a file to be updated.
    """

    queryset = SnapFile.objects.all()
    lookup_field = "id"
    permission_classes = [permissions.AllowAny]

    def put(self, request, *args, **kwargs):
        snap_file = self.get_object()

        if "label" in request.data.keys():
            snap_file.description = request.data["label"]
            snap_file.save()

            send_event(str(snap_file.project_id), "message", {"text": "Update_added"})
            return Response(data="Updated Description.", status=200)
        else:
            return Response(data="Missing label value!", status=400)


class UnhideAllView(generics.GenericAPIView):
    """
    API endpoint to unhide / decollapse all files in a project.
    """

    queryset = SnapFile.objects.all()
    lookup_field = "id"
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        project = Project.objects.get(id=self.kwargs["id"])
        snap_files = SnapFile.objects.filter(project=project)
        for snap_file in snap_files:
            snap_file.hidden = False
            snap_file.collapsed = False
            snap_file.collapsed_under = None
        SnapFile.objects.bulk_update(
            snap_files, ["hidden", "collapsed", "collapsed_under"]
        )
        send_event(str(project.id), "message", {"text": "Update_added_resize"})
        return Response(data="Unhide / uncollapsed all nodes", status=200)


class SchoolClassUpdateView(generics.UpdateAPIView):
    """
    PUT /schoolclasses/<id>/
    DELETE /schoolclasses/<id>/
    """

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = SchoolClass.objects.all()
    serializer_class = SchoolClassSerializer
    lookup_field = "id"

    def put(self, request, *args, **kwargs):
        instance = self.get_object()

        # Check if user owns this schoolclass
        if instance.teacher != request.user:
            return Response(data="Unauthorized", status=403)

        cleanData = {}
        if "name" in request.data.keys():
            cleanData["name"] = request.data["name"]

        if not cleanData:
            return Response(data="No data to update", status=400)

        partial = kwargs.pop("partial", False)
        serializer = self.get_serializer(instance, data=cleanData, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(data=serializer.data, status=200)

    def delete(self, request, *args, **kwargs):

        instance = self.get_object()

        # Check if user owns this schoolclass
        if instance.teacher != request.user:
            return Response(data="Unauthorized", status=403)

        # Delete all projects in this schoolclass
        projects = Project.objects.filter(schoolclass=instance)
        for project in projects:
            project.delete()

        instance.delete()
        return Response(data="Schoolclass deleted", status=200)


class PublicProjectOpenView(APIView):
    """Open project by PIN and optional password for public (non-teacher) flow."""

    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        pin = request.data.get("pin", "").strip()
        password = request.data.get("password", "")

        if not pin:
            return Response({"detail": _("PIN is required.")}, status=400)

        try:
            project = Project.objects.get(pin=pin)
        except Project.DoesNotExist:
            return Response({"detail": _("No such project or wrong password")}, status=403)

        if project.password and not check_password(password, project.password):
            return _response_with_csrf_cookie(request, {"detail": _("No such project or wrong password")}, 403)

        return _response_with_csrf_cookie(request, {"project_id": str(project.id)}, 200)


class PublicProjectCreateView(APIView):
    """Create public project with optional starting Snap file."""

    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        name = (request.data.get("name") or "").strip()
        description = request.data.get("description") or ""
        password_plain = request.data.get("password") or ""
        email = request.data.get("email") or ""
        start_description = request.data.get("start_description") or ""

        if not name:
            return Response({"detail": _("Project name is required.")}, status=400)

        project = Project.objects.create(
            name=name,
            description=description,
            email=email,
            pin=generate_unique_PIN(),
            password=hashPassword(password_plain) if password_plain else "",
        )

        try:
            _create_initial_snap_file(
                project,
                request.FILES.get("file"),
                start_description,
            )
        except ValueError as exc:
            project.delete()
            return _response_with_csrf_cookie(request, {"detail": str(exc)}, 400)

        return _response_with_csrf_cookie(
            request,
            {
                "project_id": str(project.id),
                "pin": project.pin,
                "password": password_plain,
            },
            201,
        )


class PublicRestoreInfoView(APIView):
    """Request password/PIN restore email for public users."""

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email", "").strip()

        if not email:
            return Response({"detail": _("Email is required.")}, status=400)

        try:
            from email_validator import validate_email, EmailNotValidError
            emailinfo = validate_email(email, check_deliverability=False)
            email = emailinfo.normalized
        except EmailNotValidError as e:
            return Response({"detail": _("Invalid Email.") + " " + str(e)}, status=400)

        projects = Project.objects.filter(email=email)

        if not projects.exists():
            # Don't reveal whether email exists - return success anyway
            return Response({"detail": _("Mail sent")}, status=200)

        base_url = request.scheme + "://" + request.get_host()

        for project in projects:
            token = secrets.token_urlsafe(None)
            PasswordResetToken.objects.create(project=project, token=token)
            project.reset_url = base_url + "/reset_password/" + token

        from django.template.loader import render_to_string
        from django.core.mail import send_mail

        content_text = render_to_string("mail/mail.txt", {"projects": projects})
        content_html = render_to_string("mail/mail.html", {"projects": projects})

        try:
            send_mail(
                _("Your smerge.org projects"),
                content_text,
                settings.EMAIL_SENDER,
                [email],
                fail_silently=False,
                html_message=content_html,
            )
        except Exception as e:
            print(e)
            return Response(
                {"detail": _("Something went wrong, please try again or contact us")},
                status=500,
            )

        return Response({"detail": _("Mail sent")}, status=200)

class PublicResetPasswordView(APIView):
    """Reset project password via API token."""

    permission_classes = [permissions.AllowAny]

    def get(self, request, token, *args, **kwargs):
        sanitized_token = sanitize_token(token)
        if sanitized_token is None:
            return Response({"detail": _("Invalid token")}, status=400)

        exists = PasswordResetToken.objects.filter(token=sanitized_token).exists()
        if not exists:
            return Response(
                {"detail": _("Invalid token, token does not exist please request a new one!")},
                status=404,
            )

        return Response({"detail": _("Valid token")}, status=200)

    def post(self, request, token, *args, **kwargs):
        sanitized_token = sanitize_token(token)
        if sanitized_token is None:
            return Response({"detail": _("Invalid token")}, status=400)

        new_password = request.data.get("new_password")
        new_password_repeated = request.data.get("new_password_repeated")

        if not new_password or not new_password_repeated:
            return Response({"detail": _("Please fill in both fields")}, status=400)

        if new_password != new_password_repeated:
            return Response({"detail": _("Passwords do not match")}, status=400)

        try:
            token_object = PasswordResetToken.objects.get(token=sanitized_token)
        except PasswordResetToken.DoesNotExist:
            return Response(
                {"detail": _("Invalid token, token does not exist please request a new one!")},
                status=404,
            )
        except Exception as e:
            logging.log(logging.WARNING, f"Something went wrong retrieving token: {e}")
            return Response({"detail": _("Something went wrong.")}, status=500)

        project = token_object.project
        token_object.delete()
        project.password = hashPassword(new_password)
        project.save()

        return Response(
            {"detail": _("Password changed"), "project_id": str(project.id)},
            status=200,
        )

# Tutorial Project Creation
class CreateTutorialProjectView(APIView):

    authentication_classes = []

    def post(self, request):
        try:
            project = Project()
            project.name = "Smerge Tutorial"
            project.description = "Interaktives Smerge Tutorial"
            project.pin = generate_unique_PIN()
            project.password = ""
            project.email = None
            project.is_tutorial = True
            project.save()

            # Create initial snap file from template
            snap_description = "Tutorial Start"
            snap_file = SnapFile.create_and_save(
                project=project,
                description=snap_description,
                file=""
            )
            snap_file.file = str(uuid4()) + ".xml"

            copyfile(
                settings.BASE_DIR + "/static/snap/tutorial_base.xml",
                _get_snap_file_abs_path(snap_file)
                )
            _update_snap_file_stats(snap_file)
            snap_file.save()
            snap_file.xml_job()

            return _response_with_csrf_cookie(request, {
                "project_id": str(project.id),
                "pin": project.pin,
                "file_id": snap_file.id,
                "success": True
            }, 200)

        except Exception as e:
            return JsonResponse({
                "success": False,
                "error": str(e)
            }, status=500)

# Tutorial: Neunen Knoten hinzufügen damit Merge geübt werden kann
class AddTutorialMergeNodeView(APIView):

    def post(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id)

            if not project.is_tutorial:
                return JsonResponse({
                    "success": False,
                    "error": "Not a tutorial project"
                }, status=400)

            # Root-Node des Projekts: initialer Knoten ohne Parents/Ancestors.
            project_root = (
                SnapFile.objects.filter(project=project, ancestors__isnull=True)
                .order_by("timestamp")
                .first()
            )

            if not project_root:
                return JsonResponse({
                    "success": False,
                    "error": "No initial file found"
                }, status=400)

            # Student version als Basis des Merges
            merge_base = (
                SnapFile.objects.filter(project=project, children__isnull=True)
                .order_by("-timestamp", "-id")
                .first()
            )

            # Merge Root = Ursprungsknoten der Student Changes und Ancestor des neuen erstellten Knotens.
            merge_root = (
                SnapFile.objects.filter(project=project, children__isnull=False)
                .order_by("-timestamp")
                .first()
            )

            # Falls der Lernende noch keine eigene Änderung erzeugt hat,
            # legen wir eine Kopie als Kind des Root-Files an, damit zwei Branches zum Mergen da sind.
            if merge_base.id == project_root.id and not project_root.children.exists():
                student_copy = SnapFile.create_and_save(
                    project=project,
                    description="Tutorial Student Branch",
                    file="",
                    ancestors=[project_root]
                )
                student_copy.file = str(uuid4()) + ".xml"
                student_copy.save(update_fields=["file"])
                copyfile(
                    _get_snap_file_abs_path(project_root),
                    _get_snap_file_abs_path(student_copy),
                )
                _update_snap_file_stats(student_copy)
                merge_root = project_root

            # Zweiter Knoten (automatische Änderung für Merge)
            merge_file = SnapFile.create_and_save(
                project=project,
                description="Tutorial Merge",
                file="",
                ancestors=[merge_root],
            )
            merge_file.file = str(uuid4()) + ".xml"
            merge_file.save(update_fields=["file"])

            copyfile(
                _get_snap_file_abs_path(merge_base),
                _get_snap_file_abs_path(merge_file)
            )

            _update_snap_file_stats(merge_file)

            # Neue nodes im client anzeigen
            send_event(str(project.id), "message", {"text": "projectChange resize added"})

            return JsonResponse({
                "success": True,
                "file_id": merge_file.id,
                "project_id": str(project.id)
            })

        except Project.DoesNotExist:
            return JsonResponse({
                "success": False,
                "error": "Project not found"
            }, status=404)
        except Exception as e:
            return JsonResponse({
                "success": False,
                "error": str(e)
            }, status=500)

# Tutorial: Projekt nach Abschluss löschen
class CleanupTutorialProjectView(APIView):

    def post(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id)

            if not project.is_tutorial:
                return JsonResponse({
                    "success": False,
                    "error": "Not a tutorial project"
                }, status=400)

            project.delete()

            return JsonResponse({"success": True})

        except Project.DoesNotExist:
            return JsonResponse({
                "success": False,
                "error": "Project not found"
            }, status=404)
        except Exception as e:
            return JsonResponse({
                "success": False,
                "error": str(e)
            }, status=500)

# isBeta und devAdd aus den settings an den Client weitergeben
class SettingsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        dev_add = " (DEV)" if settings.DEBUG else " (BETA)" if settings.BETA else ""
        return Response({
            "inBeta": settings.BETA,
            "devAdd": dev_add,
        })

