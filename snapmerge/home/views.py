from django.shortcuts import render, redirect
from django.views.generic import View
from django.http import Http404, HttpResponseRedirect, HttpResponse, JsonResponse
from django.utils.translation import ugettext as _
from .models import ProjectForm, SnapFileForm, SnapFile, Project
from .forms import OpenProjectForm
from xml.etree import ElementTree as ET
import json
from .xmltools import merge
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
from django.contrib import messages
from django.urls import reverse
from shutil import copyfile
import random, string


def generate_unique_PIN():
    size = 6
    pin = ''.join(random.choice(string.digits) for _ in range(size))
    if Project.objects.filter(pin=pin):
        return generate_unique_PIN()
    return pin


# Create your views here.
class HomeView(View):
    def get(self, request):
        context = {
        }
        return render(request, 'home.html', context)


class ProjectView(View):
    def get(self, request, proj_id):
        try:
            proj = Project.objects.get(id=proj_id)
        except Project.DoesNotExist:
            raise Http404
        files = [obj.as_dict() for obj in SnapFile.objects.filter(project = proj_id)]
        context = {
            'proj_name': proj.name,
            'proj_description': proj.description,
            'proj_id' : proj.id,
            'proj_pin' : proj.pin,
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
                file1 = files.pop()
                file2 = files.pop()
                merge(file1= file1.get_media_path(),
                      file2= file2.get_media_path(),
                      output= new_file.get_media_path(),
                      file1_description= file1.description,
                      file2_description= file2.description)
                for file in files:
                    merge(file1= new_file.get_media_path(),
                          file2= file.get_media_path(),
                          output= new_file.get_media_path(),
                          file1_description= file1.description,
                          file2_description= file2.description
                         )
                new_file.xml_job()
                return JsonResponse(new_file.as_dict())

            except Exception as e:
                print (e)
                new_file.delete()
                return HttpResponse('invalid data ', status=400)

        else:
            return HttpResponse('invalid data ', status=400)


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

        new_file.xml_job()

        new_url = settings.URL + '/sync/'+str(proj.id) + '?ancestor='+str(new_file.id)
        return JsonResponse({'message': _('OK'), 'url': new_url})


class CreateProjectView(View):

    def get(self, request):
        file_form = SnapFileForm(prefix='snap_form')
        proj_form = ProjectForm(prefix='proj_form')
        context = {
            'file_form' : file_form,
            'proj_form' : proj_form

        }
        return render(request, 'create_proj.html', context)

    def post(self, request):
        snap_form = SnapFileForm(request.POST, request.FILES, prefix='snap_form')
        proj_form = ProjectForm(request.POST, request.FILES, prefix='proj_form')
        print(request.POST)
        if snap_form.is_valid() and proj_form.is_valid():

            proj_instance = proj_form.save(commit=False)
            proj_instance.pin = generate_unique_PIN()
            proj_instance.save()

            # verify xml if a snap file is given, else insert blank snap file
            if request.FILES:

                snap_file = request.FILES['snap_form-file']
                snap_description = request.POST['snap_form-description']

                try:
                    ET.fromstring(snap_file.read())

                except ET.ParseError:
                    messages.warning(request, _('No valid xml.'))
                    return HttpResponseRedirect(reverse('create_proj'))

                snap_file = SnapFile.create_and_save(file=snap_file, project=proj_instance,
                                                     description=snap_description)

            # blank snap file
            else:
                snap_description = 'blank project'
                snap_file = SnapFile.create_and_save(project=proj_instance, description=snap_description, file='')
                snap_file.file = str(snap_file.id) + '.xml'
                copyfile(settings.BASE_DIR + '/static/snap/blank_proj.xml', settings.BASE_DIR + snap_file.get_media_path())
                snap_file.save()

            snap_file.xml_job()


            return redirect('info', proj_id=proj_instance.id)

        else:
            messages.warning(request, _('Invalid Data.'))
            return HttpResponseRedirect(reverse('create_proj'))



class InfoView(View):
    def get(self, request, proj_id):
        try:
            proj = Project.objects.get(id=proj_id)
        except Project.DoesNotExist:
            raise Http404
        context = {
            'proj_pin': proj.pin,
            'proj_password': proj.password,
            'proj_id': proj.id
        }
        return render(request, 'info_proj.html', context)


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
            proj_pin = request.POST['pin']
            proj_password = request.POST['password']

            try:
                proj = Project.objects.get(pin=proj_pin)

            except Project.DoesNotExist:
                messages.warning(request, _('No such project or wrong password'))
                return HttpResponseRedirect(reverse('open_proj'))

            if proj.password and proj.password != proj_password:
                messages.warning(request, _('No such project or wrong password'))
            else:
                return redirect('proj', proj_id=proj.id)
        else:
            messages.warning(request, _('Invalid Data.'))

        return HttpResponseRedirect(reverse('open_proj'))



class AddFileToProjectView(View):

    def post(self, request, proj_id):
        proj = Project.objects.get(id=proj_id)

        # verify xml if a snap file is given
        if request.FILES:
            snap_file = request.FILES['file']
            snap_description = ''
            print(snap_file)

            try:
                ET.fromstring(snap_file.read())

            except ET.ParseError:
                 messages.warning(request, _('No valid xml.'))
                 return JsonResponse({'message': _('no valid xml')})

            snap_file = SnapFile.create_and_save(file=snap_file, project=proj, description=snap_description)
            snap_file.xml_job()

            return JsonResponse(snap_file.as_dict())
        else:
            return JsonResponse({'message': _('no valid xml')})


class ChangePasswordView(View):

    def post(self, request, proj_id):

        old_password = request.POST.get('old-password', None)
        new_password = request.POST.get('new-password', None)

        if new_password != None:
            try:
                proj = Project.objects.get(id=proj_id)
                actual_password = proj.password

            except Project.DoesNotExist:
                messages.warning(request, _('No such project or wrong password'))
                return HttpResponseRedirect(reverse('open_proj'))

            if (actual_password and actual_password == old_password) or actual_password == None:
                proj.password = new_password
                proj.save()
                messages.success(request, _('Password changed'))
                return redirect('proj', proj_id=proj.id) #JsonResponse({'message': _('Password changed')})

            else:
                messages.warning(request, _('Wrong password'))
                return redirect('proj', proj_id=proj.id) #JsonResponse({'message': _('Something went wrong')})

        return JsonResponse({'message': _('something went wrong')})




class DeleteProjectView(View):

    def post(self, request, proj_id):

        password = request.POST.get('password', None)

        if password != None:
            try:
                proj = Project.objects.get(id=proj_id)
                actual_password = proj.password

            except Project.DoesNotExist:
                messages.warning(request, _('No such project or wrong password'))
                return HttpResponseRedirect(reverse('open_proj'))

            if (actual_password and actual_password == password) or actual_password == None:
                proj.delete()
                messages.success(request, _('Project deleted'))
                return redirect('home') #JsonResponse({'message': _('Password changed')})

            else:
                messages.warning(request, _('Wrong password'))
                return redirect('proj', proj_id=proj.id) #JsonResponse({'message': _('Something went wrong')})

        return JsonResponse({'message': _('something went wrong')})