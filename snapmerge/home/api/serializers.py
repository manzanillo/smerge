from rest_framework import serializers
from snapmerge.home.models import Project, SnapFile, File


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'name', 'description', 'created_at', 'updated_at')


class SnapFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SnapFile
        fields = ('id', 'name', 'description', 'project', 'created_at', 'updated_at', 'ancestors', 'file_url', 'timestamp', 'number_scripts', 'number_sprites', 'color')


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ('id', 'name', 'path', 'project', 'created_at', 'updated_at')
