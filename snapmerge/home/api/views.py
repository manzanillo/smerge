from rest_framework import viewsets
from rest_framework import generics
from rest_framework import permissions
from ..models import SnapFile, Project
from .serializers import SnapFileSerializer, ProjectSerializer

class ListSnapFilesView(generics.ListAPIView):
    """
    API endpoint that obtains a list of files that correspond to a given project.
    """
    queryset = SnapFile.objects.all()
    serializer_class = SnapFileSerializer
    lookup_field = 'project'
    permission_classes = [permissions.AllowAny]

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