from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework.fields import CurrentUserDefault

from ..models import SnapFile, Project, SchoolClass


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

class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", 
            "username", 
            "email", 
            "password", 
            "is_active"
        ]
        extra_kwargs = {"id": {"read_only": True}, "password": {"write_only": True}}

    def create(self, validated_data):

        username = validated_data["username"]
        email = validated_data["email"]
        password = validated_data["password"]

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        return user

class SchoolClassSerializer(serializers.ModelSerializer):
    teacher = serializers.PrimaryKeyRelatedField(read_only=True, source='schoolclass.teacher', default=serializers.CurrentUserDefault())

    class Meta:
        model = SchoolClass
        fields = [
            "id",
            "name",
            "teacher"
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        schoolClass = SchoolClass.objects.create(teacher=request.user, **validated_data)
        return schoolClass