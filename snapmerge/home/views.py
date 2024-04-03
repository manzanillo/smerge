import base64
import logging

from django.shortcuts import render, redirect
from django.views.generic import View
from django.http import (
    Http404,
    HttpResponseRedirect,
    HttpResponse,
    JsonResponse,
    HttpResponseBadRequest,
)
from django.utils.translation import gettext_lazy as _

from . import models
from .models import (
    ProjectForm,
    SnapFileForm,
    SnapFile,
    Project,
    PasswordResetToken,
    default_color,
    default_conflict_color,
    default_favor_color,
    MergeConflict,
    Hunk,
    NodeTypes,
    Settings,
    SettingsObjectTypes,
)
from .forms import OpenProjectForm, RestoreInfoForm, ResetPasswordForm
from xml.etree import ElementTree as ET
from django.template.loader import render_to_string
from .xmltools import merge as mergeOld, create_dummy_file
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
from django.contrib import messages
from django.urls import reverse
from django.core.mail import send_mail
from email_validator import validate_email, EmailNotValidError
from shutil import copyfile
import random
import string
import os
from .ancestors import gca
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .Merger_Two_ElectricBoogaloo.merger import (
    merge,
    Conflict,
    Resolution,
    Step,
    ConflictTypes,
)
from uuid import uuid4
from django_eventstream import send_event

import bcrypt
import secrets


def generate_unique_PIN():
    size = 6
    pin = "".join(random.choice(string.digits) for _ in range(size))
    if Project.objects.filter(pin=pin):
        return generate_unique_PIN()
    return pin


def notify_room(proj_id, new_node, event_type="commit"):
    layer = get_channel_layer()
    try:
        async_to_sync(layer.group_send)(
            "session_%s" % proj_id,
            {"type": "upload_message", "event": event_type, "node": new_node},
        )
    except:
        print("redis not available")


def hashPassword(password):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed_password.decode("utf-8")


def check_password(blank_password, password_hashed):
    return bcrypt.checkpw(
        blank_password.encode("utf-8"), password_hashed.encode("utf-8")
    )


baseContext = {
    "devAdd": " (DEV)" if settings.DEBUG else " (BETA)" if settings.BETA else "",
    "inBeta": settings.BETA,
}


# Create your views here.
class HomeView(View):
    def get(self, request):
        context = {
            **baseContext,
            "notification_visible": Settings.objects.get(
                name="info_header_visible"
            ).value
            == "true",
            "notification_text": Settings.objects.get(name="info_header_text").value,
        }
        return render(request, "home.html", context)


class NavView(View):
    def get(self, request):
        context = {
            **baseContext,
        }
        return render(request, "nav.html", context)


class HowToView(View):
    def get(self, request):
        context = {
            **baseContext,
        }
        return render(request, "how_to.html", context)


class ImpressumView(View):
    def get(self, request):
        context = {
            **baseContext,
        }
        return render(request, "impressum.html", context)


class ProjectView(View):
    def get(self, request, proj_id):
        try:
            proj = Project.objects.get(id=proj_id)
        except Project.DoesNotExist:
            raise Http404
        files = [obj.as_dict() for obj in SnapFile.objects.filter(project=proj_id)]
        context = {
            **baseContext,
            "proj_name": proj.name,
            "proj_description": proj.description,
            "proj_id": proj.id,
            "proj_pin": proj.pin,
            "files": files,
        }
        return render(request, "proj.html", context)


class MergeView(View):
    def get(self, request, proj_id):
        file_ids = request.GET.getlist("file")
        proj = Project.objects.get(id=proj_id)
        files = list(SnapFile.objects.filter(id__in=file_ids, project=proj_id))
        all_files = list(SnapFile.objects.filter(project=proj_id))
        parents = {
            all_files[i].id: [anc.id for anc in list(all_files[i].ancestors.all())]
            for i in range(len(all_files))
        }

        if len(files) > 1:

            new_file = SnapFile.create_and_save(
                project=proj, ancestors=file_ids, file=""
            )
            new_file.file = str(uuid4()) + ".xml"
            new_file.save()

            try:
                file1 = files.pop()
                file2 = files.pop()
                ancestor_id = gca(file1.id, file2.id, parents=parents)
                ancestor = None
                if ancestor_id != None:
                    ancestor = SnapFile.objects.get(id=ancestor_id).get_media_path()

                mergeOld(
                    file1=file1.get_media_path(),
                    file2=file2.get_media_path(),
                    output=new_file.get_media_path(),
                    file1_description=file1.description,
                    file2_description=file2.description,
                    ancestor=ancestor,
                )
                for file in files:
                    ancestor_id = gca(ancestor_id, file.id, parents=parents)
                    ancestor = None
                    if ancestor_id != None:
                        ancestor = SnapFile.objects.get(id=ancestor_id).get_media_path()

                    mergeOld(
                        file1=new_file.get_media_path(),
                        file2=file.get_media_path(),
                        output=new_file.get_media_path(),
                        file1_description=file1.description,
                        file2_description=file2.description,
                        ancestor=ancestor,
                    )
                new_file.xml_job()
                # notify_room(proj.id, new_file.as_dict(), "merge")
                send_event(str(proj_id), "message", {"text": "Update_added_resize"})
                return JsonResponse(new_file.as_dict())

            except Exception as e:
                print(e)
                new_file.delete()
                return HttpResponse("invalid data ", status=400)

        else:
            return HttpResponse("invalid data ", status=400)


class SyncView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(SyncView, self).dispatch(request, *args, **kwargs)

    def post(self, request, proj_id):
        ancestor_id = request.GET.get("ancestor")
        commit_message = str(request.GET.get("message"))
        proj = Project.objects.get(id=proj_id)
        ancestor = list(SnapFile.objects.filter(id=ancestor_id, project=proj_id))

        data = request.body

        new_file = SnapFile.create_and_save(
            project=proj, ancestors=ancestor, file="", description=commit_message
        )
        uuid = str(uuid4())
        with open(settings.MEDIA_ROOT + "/" + uuid + ".xml", "wb") as f:
            f.write(data)
        new_file.file = uuid + ".xml"
        new_file.save()

        new_file.xml_job()

        # notify_room(proj.id, new_file.as_dict(), "commit")
        send_event(str(proj_id), "message", {"text": "Update_added_resize"})

        new_url = (
            settings.POST_BACK_URL
            + "/sync/"
            + str(proj.id)
            + "?ancestor="
            + str(new_file.id)
        )
        return JsonResponse({"message": _("OK"), "url": new_url})


class CreateProjectView(View):

    def get(self, request):
        file_form = SnapFileForm(prefix="snap_form")
        proj_form = ProjectForm(prefix="proj_form")
        context = {
            **baseContext,
            "file_form": file_form,
            "proj_form": proj_form,
        }
        return render(request, "create_proj.html", context)

    def post(self, request):
        snap_form = SnapFileForm(request.POST, request.FILES, prefix="snap_form")
        proj_form = ProjectForm(request.POST, request.FILES, prefix="proj_form")

        if snap_form.is_valid() and proj_form.is_valid():

            proj_instance = proj_form.save(commit=False)
            proj_instance.pin = generate_unique_PIN()

            proj_instance.password = hashPassword(proj_instance.password)

            proj_instance.save()

            # verify xml if a snap file is given, else insert blank snap file
            if request.FILES:

                snap_file = request.FILES["snap_form-file"]
                snap_description = request.POST["snap_form-description"]

                try:
                    ET.fromstring(snap_file.read())

                except ET.ParseError:
                    messages.warning(request, _("No valid xml."))
                    return HttpResponseRedirect(reverse("create_proj"))

                snap_file = SnapFile.create_and_save(
                    file=snap_file, project=proj_instance, description=snap_description
                )

            # blank snap file
            else:
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

            snap_file.xml_job()

            return redirect("info", proj_id=proj_instance.id)

        else:
            messages.warning(request, _("Invalid Data."))
            return HttpResponseRedirect(reverse("create_proj"))


class InfoView(View):
    def get(self, request, proj_id):
        try:
            proj = Project.objects.get(id=proj_id)
        except Project.DoesNotExist:
            raise Http404
        context = {
            **baseContext,
            "proj_pin": proj.pin,
            "proj_password": "***",
            "proj_id": proj.id,
        }
        return render(request, "info_proj.html", context)


class OpenProjectView(View):
    def get(self, request):
        form = OpenProjectForm()
        context = {
            **baseContext,
            "form": form,
        }
        return render(request, "open_proj.html", context)

    def post(self, request):
        form = OpenProjectForm(request.POST)
        if form.is_valid():
            proj_pin = request.POST["pin"]
            proj_password = request.POST["password"]

            try:
                proj = Project.objects.get(pin=proj_pin)

            except Project.DoesNotExist:
                messages.warning(request, _("No such project or wrong password"))
                return HttpResponseRedirect(reverse("open_proj"))

            if proj.password and not check_password(proj_password, proj.password):
                messages.warning(request, _("No such project or wrong password"))
            else:
                return redirect(f"/ext/project_view/{proj.id}")
        else:
            messages.warning(request, _("Invalid Data."))

        return HttpResponseRedirect(reverse("open_proj"))


class RestoreInfoView(View):
    def get(self, request):
        form = RestoreInfoForm()
        context = {
            **baseContext,
            "form": form,
        }
        return render(request, "restore_info.html", context)

    def post(self, request):

        base_url = request.scheme + "://" + request.get_host()

        form = RestoreInfoForm(request.POST)
        email = request.POST["email"]

        try:
            emailinfo = validate_email(email, check_deliverability=False)
            email = emailinfo.normalized

        except EmailNotValidError as e:
            messages.warning(request, _("Invalid Email." + str(e)))
            return HttpResponseRedirect(reverse("restore_info"))

        if form.is_valid():
            projects = Project.objects.filter(email=email)

            for project in projects:
                token = secrets.token_urlsafe(None)
                # create Passwortreset token for each project
                PasswordResetToken.objects.create(project=project, token=token)
                project.reset_url = base_url + "/reset_password/" + token

            content_text = render_to_string("mail/mail.txt", {"projects": projects})
            content_html = render_to_string("mail/mail.html", {"projects": projects})

            try:
                send_mail(
                    _("Your smerge.org projects"),
                    content_text,
                    # 'noreply@smerge.org',
                    settings.EMAIL_SENDER,
                    [email],
                    fail_silently=False,
                    html_message=content_html,
                )

            except Exception as e:
                print(e)
                messages.warning(
                    request, _("Something went wrong, please try again or contact us")
                )
                return HttpResponseRedirect(reverse("restore_info"))

            messages.success(request, _("Mail sent"))
            return HttpResponseRedirect(reverse("open_proj"))

        else:
            messages.warning(request, _("Invalid Data."))

        return HttpResponseRedirect(reverse("restore_info"))


class AddFileToProjectView(View):

    def post(self, request, proj_id):
        proj = Project.objects.get(id=proj_id)

        # verify xml if a snap file is given
        if request.FILES:
            snap_file = request.FILES["file"]
            snap_description = os.path.splitext(snap_file.name)[0]

            try:
                ET.fromstring(snap_file.read())

            except ET.ParseError:
                return HttpResponseBadRequest({"message": _("no valid xml")})

            snap_file = SnapFile.create_and_save(
                file=snap_file, project=proj, description=snap_description
            )
            snap_file.xml_job()

            return JsonResponse(snap_file.as_dict())
        else:
            return HttpResponseBadRequest({"message": _("no valid xml")})


class ChangeNameView(View):

    def post(self, request, proj_id):

        name = request.POST.get("name", None)

        if name != None:

            try:
                proj = Project.objects.get(id=proj_id)
                proj.name = name
                proj.save()

            except:
                messages.warning(request, _("Invalid Data."))
                return HttpResponseRedirect(reverse("proj"))

            messages.success(request, _("Project Name changed"))
            return redirect("proj", proj_id=proj.id)

        else:
            messages.warning(request, _("Invalid Data."))
            return HttpResponseRedirect(reverse("proj"))


class ChangeDescriptionView(View):

    def post(self, request, proj_id):

        descr = request.POST.get("descr", None)

        if descr != None:

            try:
                proj = Project.objects.get(id=proj_id)
                proj.description = descr
                proj.save()

            except:
                messages.warning(request, _("Invalid Data."))
                return HttpResponseRedirect(reverse("proj"))

            messages.success(request, _("Description changed"))
            # JsonResponse({'message': _('Password changed')})
            return redirect("proj", proj_id=proj.id)

        else:
            messages.warning(request, _("Invalid Data."))
            return HttpResponseRedirect(reverse("proj"))


class DeleteProjectView(View):

    def post(self, request, proj_id):

        password = request.POST.get("password", None)
        print(password)

        if password is not None:
            try:
                proj = Project.objects.get(id=proj_id)
                actual_password = proj.password

            except Project.DoesNotExist:
                messages.warning(request, _("No such project or wrong password"))
                return HttpResponseRedirect(reverse("open_proj"))

            if (
                actual_password and check_password(password, actual_password)
            ) or actual_password is None:
                proj.delete()
                messages.success(request, _("Project deleted"))
                return redirect("home")

            else:
                messages.warning(request, _("Wrong password"))
                return redirect("proj", proj_id=proj.id)

        return HttpResponseBadRequest(
            {"message": _("Something went wrong. Please try again!")}
        )


class ToggleColorView(View):
    def get(self, request, proj_id, file_id):
        file = SnapFile.objects.get(id=file_id, project=proj_id)
        if file.type == "conflict":
            return HttpResponse("Conflict color can't be changed!")
        project = Project.objects.get(id=proj_id)
        if file.color == project.default_color:
            new_color = project.favor_color
        else:
            new_color = project.default_color
        file.color = new_color
        file.save()
        send_event(proj_id, "message", {"text": "update"})
        return HttpResponse(new_color)


class ReactMergeView(View):
    def get(self, request):
        context = {
            **baseContext,
        }
        return render(request, "merge_react.html", context)


class TmpView(View):

    def get(self, request, proj_id):
        # proj = Project.objects.get(id=proj_id)

        # left = models.SnapFile.create_and_save(project=proj,
        #                                        file="1.xml")
        # right = models.SnapFile.create_and_save(project=proj,
        #                                         file="2.xml")

        # merge_conflict = models.MergeConflict(left=left, right=right)
        # merge_conflict.save()
        # ret:MergeConflict = MergeConflict.objects.get(id=1)
        # print(ret.left)
        # print(ret.right)
        # fileToDel = SnapFile.objects.get(id=proj_id)
        # if fileToDel:
        #     fileToDel.delete()
        print(proj_id)
        mc = MergeConflict.objects.get(id=proj_id)
        hunks = Hunk.objects.filter(mergeConflict=mc)
        ret = {}
        for i in range(len(hunks)):
            ret[f"{i}"] = hunks[i].as_dict()
        return JsonResponse(
            {
                "hunks": [h.as_dict() for h in hunks],
                "projectId": mc.project.id,
                "leftId": mc.left.id,
                "rightId": mc.right.id,
            }
        )


class TmpTmpView(View):

    def get(self, request, proj_id):
        # proj = Project.objects.get(id=proj_id)

        # left = models.SnapFile.create_and_save(project=proj,
        #                                        file="1.xml")
        # right = models.SnapFile.create_and_save(project=proj,
        #                                         file="2.xml")

        # merge_conflict = models.MergeConflict(left=left, right=right)
        # merge_conflict.save()
        # ret:MergeConflict = MergeConflict.objects.get(id=1)
        # print(ret.left)
        # print(ret.right)
        # fileToDel = SnapFile.objects.get(id=proj_id)
        # if fileToDel:
        #     fileToDel.delete()

        file1 = SnapFile.objects.get(id=1)
        file2 = SnapFile.objects.get(id=2)
        proj = Project.objects.get(id="d7af4edb96b54e98a4625e8d288bf528")
        merge_conflict = models.MergeConflict(left=file1, right=file2, project=proj)
        merge_conflict.save()

        left1 = models.ConflictFile.create_and_save(
            project=proj, file=f"2a82a956-8052-44bd-a6e4-35e0dd9e7d86.txt"
        )
        left1.save()
        right2 = models.ConflictFile.create_and_save(
            project=proj, file=f"2bfd58cc-c658-4399-a0a3-ce71957186b7.txt"
        )
        right2.save()

        hunk = models.Hunk(left=left1, right=right2, mergeConflict=merge_conflict)
        hunk.save()

        left3 = models.ConflictFile.create_and_save(
            project=proj, file=f"4c36ae19-be0b-42b9-a5ee-392a8d190d6f.xml"
        )
        left3.save()
        right4 = models.ConflictFile.create_and_save(
            project=proj, file=f"5f16a298-4d09-4a57-ab29-127833edcd0e.xml"
        )
        right4.save()

        hunk = models.Hunk(left=left3, right=right4, mergeConflict=merge_conflict)
        hunk.save()

        return HttpResponse(merge_conflict.id, 200)


# todo remove or change later...
class JsRedirectView(View):
    def get(self, request, file_id):
        return ""


class GetBlockerXMLView(View):
    def get(self, request, file_name) -> HttpResponse:
        # dummy_file: str = create_dummy_file(file_name, f"{request.scheme}://{request.get_host()}")
        dummy_file: str = create_dummy_file(file_name, f"https://{request.get_host()}")
        return HttpResponse(dummy_file, content_type="application/xml")


class NewMergeView(View):
    def post(self, request, proj_id):
        resolutions = request.POST.get("resolutions")
        dict_list_string = f"[{resolutions}]"
        print(dict_list_string)
        resolutions_dict = json.loads(dict_list_string)
        resolutionsConverted = [
            Resolution(step=(Step.LEFT if (res["choice"] == "left") else Step.RIGHT))
            for res in resolutions_dict
        ]

        print("resolutions:")
        print(resolutionsConverted)
        [print(x.step) for x in resolutionsConverted]

        return mergeExt(request, proj_id, resolutionsConverted)
        # print(resolutions_dict)
        # return HttpResponse('Merge success', status=200)

    def get(self, request, proj_id):
        return mergeExt(request, proj_id, [])


from django.db.models import Q


def mergeExt(request, proj_id, resolutions):
    file_ids = request.GET.getlist("file")
    proj = Project.objects.get(id=proj_id)
    files = list(SnapFile.objects.filter(id__in=file_ids, project=proj_id))
    all_files = list(SnapFile.objects.filter(project=proj_id))
    parents = {
        all_files[i].id: [anc.id for anc in list(all_files[i].ancestors.all())]
        for i in range(len(all_files))
    }

    if len(files) > 1:
        fileIds = [file.id for file in files]
        # check if a conflict exists and the file can be overwritten
        result_conflict_query = MergeConflict.objects.filter(
            (Q(project_id=proj_id) & Q(left_id__in=fileIds))
            & (Q(project_id=proj_id) & Q(right_id__in=fileIds))
        )
        result_conflicts = result_conflict_query.all()
        if len(result_conflicts) > 0:
            new_file = result_conflicts[
                0
            ].connected_file  # SnapFile.objects.filter(id=result_conflicts[0].connected_file.id).first()
            new_file.type = "default"
            new_file.color = default_color()
            new_file.description = ""
        else:
            new_file = SnapFile.create_and_save(
                project=proj, ancestors=file_ids, file=""
            )

        if new_file == None:
            new_file = SnapFile.create_and_save(
                project=proj, ancestors=file_ids, file=""
            )
        new_file.file = str(uuid4()) + ".xml"
        new_file.save()

        try:
            for file in files:
                file.type = NodeTypes.MERGING.value
            file1 = files.pop()
            file2 = files.pop()
            ancestor_id = gca(file1.id, file2.id, parents=parents)
            ancestor = None
            if ancestor_id != None:
                ancestor = SnapFile.objects.get(id=ancestor_id).get_media_path()

            conflicts, result = merge(
                settings.BASE_DIR + file1.get_media_path(),
                settings.BASE_DIR + file2.get_media_path(),
                resolutions,
            )

            if conflicts == None:
                with open(settings.BASE_DIR + new_file.get_media_path(), "wb") as f:
                    f.write(result)
                    # result.write(f)
            else:
                # new_file.delete()

                # Create new conflict with both files
                merge_conflict = models.MergeConflict(
                    left=file1, right=file2, project=proj, connected_file=new_file
                )
                merge_conflict.save()

                for conf in conflicts:
                    match conf.conflictType:
                        case "Text":
                            ending = ".txt"
                        case "Image":
                            ending = ".base64"
                        case ConflictTypes.AUDIO.value:
                            ending = ".abase64"
                        case _:
                            ending = ".xml"
                    if conf.conflictType == ConflictTypes.AUDIO.value:
                        left = models.ConflictFile.create_and_save(
                            project=proj,
                            file=f"{uuid4()}{ending}",
                            cx=0,
                            cy=0,
                            name=conf.cxl,
                        )
                        left.save()
                        right = models.ConflictFile.create_and_save(
                            project=proj,
                            file=f"{uuid4()}{ending}",
                            cx=0,
                            cy=0,
                            name=conf.cxr,
                        )
                        right.save()
                    else:
                        left = models.ConflictFile.create_and_save(
                            project=proj,
                            file=f"{uuid4()}{ending}",
                            cx=conf.cxl,
                            cy=conf.cyl,
                        )
                        left.save()
                        right = models.ConflictFile.create_and_save(
                            project=proj,
                            file=f"{uuid4()}{ending}",
                            cx=conf.cxr,
                            cy=conf.cyr,
                        )
                        right.save()

                    conf.toFile(
                        settings.BASE_DIR + left.get_media_path(),
                        settings.BASE_DIR + right.get_media_path(),
                    )

                    hunk = Hunk.create_and_save(
                        left=left,
                        right=right,
                        mergeConflict=merge_conflict,
                        parentPath=conf.parentPath,
                        parentImage=f"{uuid4()}.base64",
                    )
                    # set image...
                    with open(settings.BASE_DIR + hunk.get_media_path(), "w") as f:
                        f.write(conf.parentImage)
                    hunk.save()

                    # ret:MergeConflict = MergeConflict.objects.get(id=1)
                    # print(ret.left)
                    # print(ret.right)

                print(conflicts)
                new_file.file = str(merge_conflict.id) + ".conflict"
                new_file.type = "conflict"
                new_file.description = "Active Conflict"
                new_file.color = default_conflict_color()
                new_file.save()

                send_event(str(proj_id), "message", {"text": "Update_added_resize"})
                # response = HttpResponseRedirect(f"http://127.0.0.1/ext/merge/{merge_conflict.id}")
                # response.status_code = 303
                # return response
                return HttpResponse(
                    f"{request._current_scheme_host}/ext/merge/{merge_conflict.id}",
                    status=303,
                )
                # return HttpResponseRedirect(f'/ext/merge/{merge_conflict.id}')
                # return redirect(f"http://127.0.0.1/ext/merge/{merge_conflict.id}")

            new_file.xml_job()
            print(new_file.as_dict())
            # delete old conflict on resolved
            if len(result_conflicts) > 0:
                # conf_id = result_conflicts[0].id
                # connected_hunks = Hunk.objects.filter(mergeConflict=conf_id)
                connected_hunks = result_conflicts[0].hunk_set.all()
                for hun in connected_hunks:
                    # cleanup local files and db
                    files = [hun.left.file, hun.right.file]
                    for file in files:
                        if os.path.exists(file.path):
                            os.remove(file.path)
                    if os.path.exists(hun.parentImage.path):
                        os.remove(hun.parentImage.path)
                    hun.left.delete()
                    hun.right.delete()
                    hun.delete()
                    # hun.save()
                result_conflicts[0].delete()
                # result_conflicts[0].save()

            # notify_room(proj.id, new_file.as_dict(), "merge")
            send_event(str(proj_id), "message", {"text": "Update_added_resize"})
            return JsonResponse(new_file.as_dict())

        except Exception as e:
            print(e)
            new_file.delete()
            return HttpResponse("invalid data ", status=400)

    else:
        return HttpResponse("invalid data ", status=400)


import json


# { hunkId: <id>, choice: "left|right" }
class ResolveHunkView(View):
    def post(self, request, proj_id):
        try:
            j = json.loads(request.body.decode("utf-8"))
            hunkId = j["hunkId"]

            if hunkId != None:
                choice = j["choice"]
                if choice != None:
                    if choice == "right" or choice == "left":

                        hunk = Hunk.objects.get(id=hunkId)

                        if hunk:
                            hunk.choice = choice
                            hunk.save()
                            return HttpResponse("Choice accepted", status=200)
                        else:
                            return HttpResponse("Hunk not found", status=400)
                    else:
                        return HttpResponse("This choice is not allowed.", status=400)
                else:
                    return HttpResponse("invalid data ", status=400)
            return HttpResponse("invalid data ", status=400)
        except:
            return HttpResponse("Hunk not found", status=400)


class ToggleCollapseView(View):
    def get(self, request, node_id):
        try:
            snap_file = SnapFile.objects.get(id=node_id)
            singleConnected = getSingleChildNodes(snap_file)
            toSet = not snap_file.collapsed
            for sc in singleConnected:
                sc.hidden = toSet
                sc.save()
            snap_file.collapsed = toSet
            snap_file.save()
            send_event(str(snap_file.project_id), "message", {"text": "Update_added"})
            return HttpResponse("Node collapsed", status=200)
        except:
            return HttpResponse("File not found", status=400)


def getSingleChildNodes(snap_file: SnapFile):
    allProjectFiles_query = SnapFile.objects.filter(project=snap_file.project)
    allProjectFiles = allProjectFiles_query.all()
    baseNode = allProjectFiles_query.filter(ancestors=None).first()
    connected = []
    prev = []
    for c in range(0, len(allProjectFiles)):
        if c != 0 and fileArrayEqual(prev, connected):
            print(c)
            break
        prev = [x for x in connected]
        for file in allProjectFiles:
            if file.id == baseNode.id:
                continue
            if allInside(file.ancestors.all(), ([snap_file] + connected)):
                if file not in connected:
                    connected.append(file)
    return connected


# returns if e1 is a subset of e2
def allInside(e1, e2):
    if e1 == []:
        return False
    e2_ids = [e.id for e in e2]
    for i in range(0, len(e1)):
        if e1[i].id not in e2_ids:
            return False
    return True


def fileArrayEqual(e1, e2):
    if len(e1) != len(e2):
        return False
    e1_ids = [e.id for e in e1]
    e2_ids = [e.id for e in e2]
    for i in range(0, len(e1_ids)):
        if e1_ids[i] != e2_ids[i]:
            return False
    return True


from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


def send_message_to_group(message):
    # Get the channel layer
    channel_layer = get_channel_layer()

    # Send a message to the group
    async_to_sync(channel_layer.group_send)(
        "test",  # The name of the group
        {
            "type": "chat_message",  # The type of the message
            "message": message,  # The message
        },
    )


@method_decorator(csrf_exempt, name="dispatch")
class SendEventPing(View):
    def post(self, request):
        try:
            j = json.loads(request.body.decode("utf-8"))
            roomId = j["roomId"]

            if roomId != None:
                msg = j["msg"]
                if msg != None:
                    send_event(roomId, "message", {"text": msg})
                    # send_message_to_group('update')
                    return HttpResponse("Ping sent.", status=200)
                else:
                    return HttpResponse("Missing msg!", status=400)
            return HttpResponse("Missing roomId!", status=400)
        except:
            return HttpResponse("Something went wrong!", status=400)


# import asyncio

# from django.http import StreamingHttpResponse
# import time


# async def sse_stream(request):
#     """
#     Sends server-sent events to the client.
#     """
#     async def event_stream():
#         print("Events")
#         emojis = ["🚀", "🐎", "🌅", "🦾", "🍇"]
#         i = 0
#         while True:
#             yield f'data: {random.choice(emojis)} {i}\n\n'
#             i += 1
#             print("jeet")
#             time.sleep(1)
#             # await asyncio.sleep(1)

#     return StreamingHttpResponse(event_stream(), content_type='text/event-stream')


def index(request):
    return render(request, "sse.html")


def sanitize_token(token):
    # check if token was really base64 encoded to prevent injections
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


class ResetPasswordView(View):
    def get(self, request, token):
        # check if token was really base64 encoded to prevent injections
        sanitized_token = sanitize_token(token)
        if sanitized_token is None:
            return HttpResponseBadRequest("Invalid token")

        form = ResetPasswordForm()
        context = {**baseContext, "form": form, "token": sanitized_token}
        return render(request, "reset_password.html", context)

    def post(self, request, token):
        base_url = request.scheme + "://" + request.get_host()

        sanitized_token = sanitize_token(token)
        if sanitized_token is None:
            messages.warning(request, _("Invalid token"))
            return HttpResponseRedirect(reverse("reset_passwd", args=[token]))
        if not request.POST.get("new_password") or not request.POST.get(
            "new_password_repeated"
        ):
            messages.warning(request, _("Please fill in both fields"))
            return HttpResponseRedirect(reverse("reset_passwd", args=[token]))

        if request.POST.get("new_password") != request.POST.get(
            "new_password_repeated"
        ):
            messages.warning(request, _("Passwords do not match"))
            return HttpResponseRedirect(reverse("reset_passwd", args=[token]))

        try:
            token_object = PasswordResetToken.objects.get(token=sanitized_token)
        except PasswordResetToken.DoesNotExist:
            messages.warning(
                request,
                _("Invalid token, token does not exist please request a new one!"),
            )
            return HttpResponseRedirect("/restore_info/")
        except Exception as e:
            messages.warning(request, _("Something went wrong."))
            logging.log(logging.WARNING, f"Something went wrong retrieving token: {e}")
            return HttpResponseRedirect(reverse("reset_passwd", args=token))

        proj = token_object.project
        token_object.delete()
        proj.password = hashPassword(request.POST.get("new_password"))
        proj.save()
        messages.success(request, _("Password changed"))
        return HttpResponseRedirect(f"/ext/project_view/{proj.id}")
