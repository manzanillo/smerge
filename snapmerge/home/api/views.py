from rest_framework import viewsets, status, request
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.http import HttpResponseBadRequest
from rest_framework.authtoken.views import ObtainAuthToken
from shutil import copyfile
from uuid import uuid4
from django.conf import settings

from ..models import File, SnapFile, Project, MergeConflict, SchoolClass
from .serializers import SnapFileSerializer, ProjectSerializer, ProjectColorSerializer, RegistrationSerializer, SchoolClassSerializer
from django.shortcuts import get_object_or_404, get_list_or_404
from django_eventstream import send_event
from django.db.models import Q
from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator

from ..views import check_password, generate_unique_PIN, hashPassword


# class ListSnapFilesView(generics.ListAPIView):
#     """
#     API endpoint that obtains a list of files that correspond to a given project.
#     """
#     queryset = SnapFile.objects.all().filter(id="")
#     serializer_class = SnapFileSerializer
#     lookup_field = 'project'
#     permission_classes = [permissions.AllowAny]


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
            if User.objects.get(username = registration_serializer.getUsername(request.data)):
                return Response ({
                        "error": "Username already exists!",
                        "status": f"{status.HTTP_400_BAD_REQUEST} BAD REQUEST"
                        })
            user = registration_serializer.save()
            token = Token.objects.create(user=user)

            return Response(
                {
                    "user": {
                        "id": registration_serializer.data["id"],
                        "username": registration_serializer.data["username"],
                        "email": registration_serializer.data["email"],
                        "is_active": registration_serializer.data["is_active"],
                        "is_staff": registration_serializer.data["is_staff"],
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

class SchoolClassesView(generics.CreateAPIView):

    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    queryset = SchoolClass.objects.all()
    serializer_class = SchoolClassSerializer

    def get_serializer_context(self):
        context =  super().get_serializer_context()
        context['request'] = self.request
        return context

    def post(self, request, *args, **kwargs):
        #serializer = SchoolClassSerializer(data=request.data)
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

    #def get_serializer_context(self):
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
        context =  super().get_serializer_context()
        context['request'] = self.request
        return context

    def post(self, request, *args, **kwargs):
        projectId = kwargs.get('id')
        originalProject = get_object_or_404(Project, id=projectId)
        duplicateProject = Project.objects.create(name=originalProject.name, description=originalProject.description, picture=originalProject.picture, schoolclass=originalProject.schoolclass, password=originalProject.password, pin=generate_unique_PIN())
        Project.save(duplicateProject)
        originalFiles = SnapFile.objects.filter(project=originalProject)
        duplicateFiles = []
        if originalFiles:
            for ogfile in originalFiles:
                filepath_seperated = ogfile.get_media_path().split('.')
                copy_filepath = filepath_seperated[0] + '_copy.' + filepath_seperated[1]
                copyfile(settings.BASE_DIR + ogfile.get_media_path(), settings.BASE_DIR + copy_filepath)
                duplicateFile = SnapFile.create_and_save(project=duplicateProject, description=ogfile.description, file=copy_filepath.split('/')[-1])
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
        context =  super().get_serializer_context()
        context['request'] = self.request
        return context

    def post(self, request, *args, **kwargs):
        projectPin = generate_unique_PIN()
        projectdata = {**request.data, 'pin': projectPin}
        serializer = self.get_serializer(data=projectdata, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        proj_instance = Project.objects.get(pin=projectPin)
        snap_description = "blank project"
        snap_file = SnapFile.create_and_save(
            project=proj_instance, description=snap_description, file=""
        )
        snap_file.file = str(uuid4()) + ".xml"
        copyfile(
            settings.BASE_DIR + "/static/snap/blank_proj.xml",
            settings.BASE_DIR + snap_file.get_media_path(),
        )
        snap_file.save()
        return Response(serializer.data)


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

        if instance.password is not None and not check_password(
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
        if instance.password == None or check_password(
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
