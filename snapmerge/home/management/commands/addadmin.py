from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError
import getpass


class Command(BaseCommand):
    help = "Create a new admin user."

    def handle(self, *args, **options):
        email = input("Enter email: ")
        username = input("Enter username: ")
        for i in range(3):
            password = getpass.getpass(prompt="Enter password: ")
            passwordAgain = getpass.getpass(prompt="Enter password again: ")
            if i == 2 and password != passwordAgain:
                raise CommandError("Passwords do not match 3 times. Restart!")
            if password == passwordAgain:
                break

        try:
            user = User.objects.create_user(
                username, email, password, is_superuser=True, is_staff=True
            )
            self.stdout.write(
                self.style.SUCCESS(f"User '{username}' created successfully")
            )

        except Exception as e:
            raise CommandError(f"Error creating user: {e}")
