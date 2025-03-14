# Generated by Django 5.0.2 on 2024-03-16 07:36

from django.db import migrations
from ..views import hashPassword


def hash_passwords(apps, schema_editor):
    Project = apps.get_model("home", "Project")
    projects = Project.objects.all()
    for project in projects:
        project.password = (
            hashPassword(project.password) if project.password is not None else None
        )
    Project.objects.bulk_update(projects, ["password"])


class Migration(migrations.Migration):

    dependencies = [
        ("home", "0028_alter_project_password"),
    ]

    operations = [
        migrations.RunPython(hash_passwords),
    ]
