from rest_framework import viewsets
from rest_framework import generics
from rest_framework import permissions
from ..models import SnapFile, Project
from .serializers import SnapFileSerializer, ProjectSerializer
from django.shortcuts import get_object_or_404

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