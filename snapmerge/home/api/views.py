from rest_framework import viewsets, status
from rest_framework import generics
from rest_framework import permissions
from rest_framework.response import Response

from ..models import SnapFile, Project
from .serializers import SnapFileSerializer, ProjectSerializer
from django.shortcuts import get_object_or_404
from django_eventstream import send_event


# class ListSnapFilesView(generics.ListAPIView):
#     """
#     API endpoint that obtains a list of files that correspond to a given project.
#     """
#     queryset = SnapFile.objects.all().filter(id="")
#     serializer_class = SnapFileSerializer
#     lookup_field = 'project'
#     permission_classes = [permissions.AllowAny]

class ListSnapFilesView(generics.ListAPIView):
    """
    API endpoint that obtains a list of files that correspond to a given project.
    """
    serializer_class = SnapFileSerializer
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """
        This view returns a list of all the SnapFiles for
        the project as determined by the project portion of the URL.
        """
        project_id = self.kwargs.get(self.lookup_field)
        project = get_object_or_404(Project, id=project_id)
        return SnapFile.objects.filter(project=project)


class ProjectDetailView(generics.RetrieveAPIView):
    """
    API endpoint that allows projects to be viewed.
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]
    
class ProjectDetailUpdateView(generics.UpdateAPIView):
    """
    API endpoint that allows projects to be viewed.
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]
    
    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        
        cleanData = {"pin": instance.pin}
        if 'description' in request.data.keys():
            cleanData['description'] = request.data['description']
        if 'name' in request.data.keys():
            cleanData['name'] = request.data['name']
            
        if 'password' not in request.data.keys():
            request.data['password'] = ""
            
        if instance.password != None and instance.password != request.data["password"]:
            return Response(data="Wrong Password!", status=403)
        partial = kwargs.pop('partial', False)
        
        serializer = self.get_serializer(instance, data=cleanData, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(data=serializer.data, status=200)
    
    # def get_object(self):
    #     file_id = self.kwargs['id']
    #     return SnapFile.objects.get(id=file_id)

    # def put(self, request, *args, **kwargs):
    #     snap_file = self.get_object()
    #     snap_file.xPosition = request.data['x']
    #     snap_file.yPosition = request.data['y']
    #     snap_file.save()

    #     print(str(snap_file.project_id))
    #     send_event(str(snap_file.project_id), 'message', {'text': 'Update'})

    #     return Response(status=status.HTTP_200_OK)



class SnapFileDetailView(generics.RetrieveAPIView):
    """
    API endpoint that allows file details to be viewed.
    """
    queryset = SnapFile.objects.all()
    serializer_class = SnapFileSerializer
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]


class SnapFilePositionView(generics.UpdateAPIView):
    """
    API endpoint that allows for the position of a file to be updated.
    """
    serializer_class = SnapFileSerializer
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]
    
    def get_object(self):
        file_id = self.kwargs['id']
        return SnapFile.objects.get(id=file_id)

    def put(self, request, *args, **kwargs):
        snap_file = self.get_object()
        snap_file.xPosition = request.data['x']
        snap_file.yPosition = request.data['y']
        snap_file.save()

        print(str(snap_file.project_id))
        send_event(str(snap_file.project_id), 'message', {'text': 'Update'})

        return Response(status=status.HTTP_200_OK)


class SnapFilePositionsView(generics.UpdateAPIView):
    """
    API endpoint that allows for the position of a file to be updated.
    """
    serializer_class = SnapFileSerializer
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        file_id = self.kwargs['id']
        project_id = SnapFile.objects.get(id=file_id).project.id
        return SnapFile.objects.filter(project=project_id)

    def put(self, request, *args, **kwargs):
        snap_files = self.get_queryset()
        for data in request.data:
            snap_file = snap_files.get(id=data['id'])
            snap_file.xPosition = data['position']['x']
            snap_file.yPosition = data['position']['y']
            snap_file.save()

        send_event(str(snap_files[0].project_id), 'message', {'text': 'Update_resize_savedLayout'})
        return Response(status=status.HTTP_200_OK)


class ProjectChangePasswordView(generics.UpdateAPIView):
    """
    API endpoint that allows for the position of a file to be updated.
    """
    queryset = Project.objects.all()
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        
        if 'old-password' not in request.data.keys() or 'new-password' not in request.data.keys():
            return Response(data="Missing Values!", status=400)
        
        if instance.password == None or instance.password == request.data["old-password"]:
            if request.data["new-password"] == "":
                instance.password = None
            else:
                instance.password = request.data["new-password"]
            instance.save()
            return Response(data="Password changed.", status=200)
        else:
            return Response(data='Wrong Password!', status=403)
        
        
class ProjectDeleteView(generics.DestroyAPIView):
    queryset = Project.objects.all()
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]
    
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        if 'password' not in request.data.keys():
            return Response(data="Missing Password!", status=400)
        if instance.password == None or instance.password == request.data["password"]:
            #instance.delete()
            return Response(data="Project Deleted!", status=300)
        else:
            return Response(data='Wrong Password!', status=403)
        return self.destroy(request, *args, **kwargs)

# class ProjectDetailView(generics.RetrieveAPIView):
#     """
#     API endpoint that allows file details to be viewed.
#     """
#     permission_classes = [permissions.AllowAny]
    
#     def get_queryset(self):
#         file_id = self.kwargs['id']
#         projects = Project.objects.get(id=file_id)
#         return projects
    
#     def get(self, request, *args, **kwargs):
#         projects = self.get_queryset()
#         if len(projects) != 1:
#             return HttpResponse('invalid id', status=400)
#         else:
#             return HttpResponse(projects[0].pin, status=400)
