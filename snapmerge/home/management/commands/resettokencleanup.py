from django.core.management.base import BaseCommand, CommandError
from argparse import RawTextHelpFormatter
from ...models import PasswordResetToken
from django.utils import timezone


class Command(BaseCommand):
    help = ("Invalidates all password reset tokens that are older than the specified amount of time.\n"
            "By default without any argument all tokens of the database get deleted!\n\n\n"
            "Example usage:\n\n"
            "python manage.py resettokencleanup -W 1\n"
            "(Deletes all tokens that are older than 1 week.)\n")

    def add_arguments(self, parser):
        parser.add_argument('-S', type=int, help="seconds", nargs='?', required=False, default=0)
        parser.add_argument('-M', type=int, help="minutes", nargs='?', required=False, default=0)
        parser.add_argument('-H', type=int, help="hours", nargs='?', required=False, default=0)
        parser.add_argument('-D', type=int, help="days", nargs='?', required=False, default=0)
        parser.add_argument('-W', type=int, help="weeks", nargs='?', required=False, default=0)
        parser.add_argument('-Y', type=int, help="years", nargs='?', required=False, default=0)

    def handle(self, *args, **options):

        seconds = options['S']
        minutes = options['M']
        hours = options['H']
        days = options['D'] + options['W'] + options['Y'] * 365

        if options['W'] < 0:
            raise CommandError("Weeks must be greater or equal than 0")

        if options['Y'] < 0:
            raise CommandError("Years must be greater or equal than 0")

        if options['D'] < 0:
            raise CommandError("Days must be greater or equal than 0")

        if seconds < 0 or seconds > 59:
            raise CommandError("Seconds must be between 0 and 59")

        if minutes < 0 or minutes > 59:
            raise CommandError("Minutes must be between 0 and 59")

        if hours < 0 or hours > 23:
            raise CommandError("Hours must be between 0 and 23")

        tokens = PasswordResetToken.objects.all()
        current_time = timezone.now()
        time_diff = current_time - timezone.timedelta(seconds=seconds, minutes=minutes, hours=hours, days=days)
        self.stdout.write(self.style.SUCCESS(f"Current time: {current_time}"))
        self.stdout.write(self.style.SUCCESS(f"Time difference: {time_diff}"))
        count_deleted = 0
        for token in tokens:
            if token.timestamp < time_diff:
                token.delete()
                self.stdout.write(self.style.SUCCESS(f"Token {token.token} has been deleted."))
                count_deleted += 1

        self.stdout.write(self.style.SUCCESS(f"Deleted {count_deleted} tokens."))

    def create_parser(self, *args, **kwargs):
        parser = super(Command, self).create_parser(*args, **kwargs)
        parser.formatter_class = RawTextHelpFormatter
        return parser
