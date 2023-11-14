from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework import permissions
from snapmerge.home.models import Project, SnapFile, File
from snapmerge.api.serializers import ProjectSerializer, SnapFileSerializer, FileSerializer

class SnapFileView():
    """
    API endpoint that allows files to be viewed or edited.
    """
    queryset = SnapFile.objects.filter()
    serializer_class = SnapFileSerializer
    permission_classes = [permissions.AllowAny]

