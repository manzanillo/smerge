from django.apps import AppConfig
from django.conf import settings


class HomeConfig(AppConfig):
    name = 'home'

    def ready(self):
        print('DEBUG:', settings.DEBUG)
        print('CORS:', settings.CORS_ALLOW_ALL_ORIGINS)
        print('Installed Apps:', settings.INSTALLED_APPS)
        print('Middleware:', settings.MIDDLEWARE)
