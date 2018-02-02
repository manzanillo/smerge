from django.shortcuts import render, redirect
from django.views.generic import View
from django.http import Http404
from . import models

# Create your views here.

class HomeView(View):
    def get(self, request):
        context = {
        }
        return render(request, 'home.html', context)


class ProjectView(View):
    def get(self, request, proj_id):
        proj = models.Project.objects.filter(id=proj_id).first()
        if proj is None:
            raise Http404
        context = {
            'proj_id' : proj_id
        }
        return render(request, 'proj.html', context)
