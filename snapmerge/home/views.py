from django.shortcuts import render, redirect
from django.views.generic import View
from django.http import Http404, HttpResponseRedirect, HttpResponse, JsonResponse
from django.utils.translation import ugettext as _
from .models import ProjectForm, SnapFileForm, SnapFile, Project
from .forms import OpenProjectForm
from xml.etree import ElementTree as ET
import json
from .xmltools import merge, include_sync_button
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings


# Create your views here.

class HomeView(View):
    def get(self, request):
        context = {
        }
        return render(request, 'home.html', context)


class ProjectView(View):
    def get(self, request, proj_id):
        proj = Project.objects.filter(id=proj_id).first()
        if proj is None:
            raise Http404
        files = [obj.as_dict() for obj in SnapFile.objects.filter(project = proj_id)]
        context = {
            'proj_id': proj_id,
            'files': files
        }
        return render(request, 'proj.html', context)


class MergeView(View):
    def get(self, request, proj_id):
        file_ids = request.GET.getlist('file')
        proj = Project.objects.get(id=proj_id)
        files = list(SnapFile.objects.filter(id__in=file_ids, project=proj_id))
        if len(files)>1:

            new_file = SnapFile.create_and_save(project=proj, ancestors=file_ids, file='')
            new_file.file = str(new_file.id) + '.xml'
            new_file.save()

            try:
                merge(files.pop().get_media_path(), files.pop().get_media_path(),  new_file.get_media_path())
                for file in files:
                    merge(new_file.get_media_path(), file.get_media_path(), new_file.get_media_path())
                return JsonResponse(new_file.as_dict())

            except Exception:
                new_file.delete()
                return JsonResponse({'message': _('Something went wrong')})

        else:
            return JsonResponse({'message': _('Something went wrong')})



class SyncView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(SyncView, self).dispatch(request, *args, **kwargs)

    def post(self, request, proj_id):
        ancestor_id = request.GET.get('ancestor')
        commit_message = str(request.GET.get('message'))
        proj = Project.objects.get(id=proj_id)
        ancestor = list(SnapFile.objects.filter(id=ancestor_id, project=proj_id))


        data = request.body

        new_file = SnapFile.create_and_save(project=proj, ancestors=ancestor, file='', description=commit_message)
        with open(settings.MEDIA_ROOT + '/'  + str(new_file.id) + '.xml', 'wb') as f:
        	f.write(data)
        new_file.file = str(new_file.id) + '.xml'
        new_file.save()

        include_sync_button(new_file.get_media_path(), proj.id, me=new_file.id)

        new_url = 'https://faui20q.cs.fau.de/smerge/sync/'+str(proj.id) + '?ancestor='+str(new_file.id)

        return JsonResponse({'message': _('OK'), 'url': new_url})







class CreateProjectView(View):

    def get(self, request):
        file_form = SnapFileForm()
        proj_form = ProjectForm()
        context = {
            'file_form' : file_form,
            'proj_form' : proj_form

        }
        return render(request, 'create_proj.html', context)

    def post(self, request):
        snap_form = SnapFileForm(request.POST, request.FILES)
        proj_form = ProjectForm(request.POST, request.FILES)
        print(request.FILES)
        if snap_form.is_valid() and proj_form.is_valid():
            # verify xml
            file = request.FILES['file']
            try:
                ET.fromstring(file.read())

            except ET.ParseError:
                # TODO: error message
                return HttpResponse('invalid xml', status=501)

            proj_instance = proj_form.save()
            file = SnapFile.create_and_save(file=file, project=proj_instance, description=request.POST['description'])

            include_sync_button(file.get_media_path(), proj_instance.id, me= file.id)

            return redirect('proj', proj_id=proj_instance.id)

        else:
            # TODO: error message
            return HttpResponse('invalid data', status=501)


class OpenProjectView(View):
    def get(self, request):
        form = OpenProjectForm()
        context = {
            'form' : form
        }
        return render(request, 'open_proj.html', context)

    def post(self, request):
        form = OpenProjectForm(request.POST)
        if form.is_valid():
            proj_id = request.POST['project']
            if(Project.objects.filter(id = proj_id)):
                return redirect('proj', proj_id=proj_id)
            else:
                #TODO: error message
                return HttpResponse('no such project', status=501)
        else:
            # TODO: error message
            return HttpResponse('invalid data ', status=501)
