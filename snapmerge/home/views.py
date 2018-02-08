from django.shortcuts import render, redirect
from django.views.generic import View
from django.http import Http404, HttpResponseRedirect, HttpResponse
from .models import ProjectForm, SnapFileForm, SnapFile, Project
from .forms import OpenProjectForm
from xml.etree import ElementTree as ET
import json


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


class CreateProjectView(View):
    def get(self, request):
        forms = ProjectForm(), SnapFileForm()
        context = {
            'forms' : forms
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
            SnapFile.create_and_save(file=file, project=proj_instance)

            return redirect('proj', proj_id=proj_instance.id)

        else:
            # TODO: error message
            return HttpResponse('unvalid data', status=501)

class OpenProjectView(View):
    def get(self, request):
        form = OpenProjectForm()
        context = {
            'form' : form
        }
        return render(request, 'open_proj.html', context)

    def post(self, request):
        proj_id = request.POST['project']
        if(Project.objects.filter(id = proj_id)):
            return redirect('proj', proj_id=proj_id)
        else:
            #TODO: error message
            return HttpResponse('no such project', status=501)
