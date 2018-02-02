from django.shortcuts import render
from django.views.generic import View

# Create your views here.

class HomeView(View):
    def get(self, request):
        context = {
        }
        return render(request, 'home.html', context)


class ProjectView(View):
    def get(self, request, proj_id):
        print(proj_id)
        context = {
            'proj_id' : proj_id
        }
        return render(request, 'proj.html', context)
