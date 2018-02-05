from django.shortcuts import render, redirect
from django.views.generic import View
from django.http import Http404, HttpResponseRedirect, HttpResponse
from django.urls import reverse
from . import models
from .models import ProjectForm, SnapFileForm, SnapFile, Project
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
        print(files[0]['ancestors'])
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
            proj_instance = proj_form.save()
            SnapFile.create_and_save(file=request.FILES['file'], project=proj_instance)
            #TODO: validate well formed xml
            return redirect('proj', proj_id=proj_instance.id)
