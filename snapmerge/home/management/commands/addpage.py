from django.contrib.sites.models import Site
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create a new site entry"

    def handle(self, *args, **options):
        domain = input("Enter domain: ")

        domain = domain.strip().replace("http://", "").replace("https://", "")

        try:
            site = Site.objects.create(domain=domain, name=domain)
            self.stdout.write(
                self.style.SUCCESS(f"Site '{domain}' created successfully")
            )

        except Exception as e:
            raise CommandError(f"Error creating site: {e}")
