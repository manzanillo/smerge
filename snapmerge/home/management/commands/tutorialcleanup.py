from django.core.management.base import BaseCommand
from ...models import Project
from django.utils import timezone
from datetime import timedelta


class Command(BaseCommand):
    help = "Deletes all tutorial projects that are older than 24 hours."

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):

        hours = 24
        seconds = hours * 360

        cutoff_time = timezone.now() - timedelta(seconds=seconds)

        old_tutorial_projects = Project.objects.filter(
            is_tutorial=True,
            created_at__lt=cutoff_time
        )

        count = old_tutorial_projects.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS(
                f'No tutorial projects found older than {hours}h.'
            ))
            return

        for project in old_tutorial_projects:
            project.delete()

        self.stdout.write(self.style.SUCCESS(
            f'Successfully deleted {count} tutorial project(s) older than {hours}h.'
        ))


