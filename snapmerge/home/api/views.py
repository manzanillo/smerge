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
    queryset = SnapFile.objects.all()
    serializer_class = SnapFileSerializer
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]

    def put(self, request, *args, **kwargs):
        snap_file = self.get_object()
        snap_file.xPosition = request.data['x']
        snap_file.yPosition = request.data['y']
        snap_file.save()

        send_event(str(snap_file.project_id), 'message', {'text': 'Update'})
        print("Update", str(snap_file.project_id))

        return Response(status=status.HTTP_200_OK)


class SnapFilePositionsView(generics.UpdateAPIView):
    """
    API endpoint that allows for the position of a file to be updated.
    """
    queryset = SnapFile.objects.all()
    serializer_class = SnapFileSerializer
    lookup_field = 'id'
    permission_classes = [permissions.AllowAny]

    def put(self, request, *args, **kwargs):
        snap_files = self.get_queryset()
        print(snap_files)
        for data in request.data:
            snap_file = snap_files.get(id=data['id'])
            snap_file.xPosition = data['position']['x']
            snap_file.yPosition = data['position']['y']
            snap_file.save()

        # for snap_file in snap_files:
        #     snap_file.xPosition = request.data['x']
        #     snap_file.yPosition = request.data['y']
        #     snap_file.save()

        send_event(str(snap_files[0].project_id), 'message', {'text': 'Update'})
        return Response(status=status.HTTP_200_OK)
