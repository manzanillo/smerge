from rest_framework import serializers

from ..models import SnapFile, Project


class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializes a project without credential information
    """

    class Meta:
        model = Project
        fields = ('id', 'name', 'description', 'pin','default_color', 'favor_color', 'conflict_color',
            'kanban_board')


class SnapFileSerializer(serializers.ModelSerializer):
    """
    Serializes a snapfile
    """

    file_url = serializers.CharField(source='get_media_path', read_only=True)

    class Meta:
        model = SnapFile
        fields = ('id', 'file_url', 'description', 'project', 'ancestors', 'timestamp', 'number_scripts',
                  'number_sprites', 'color', 'xPosition', 'yPosition', 'collapsed', 'hidden', 'type')

class ProjectColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('default_color', 'favor_color', 'conflict_color')
