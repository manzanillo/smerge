from django.apps import AppConfig
from django.conf import settings
from home.dataImportHelper import generateDataImportXML, generateSyncBlockXML

from pathlib import Path
from django.utils import autoreload


class HomeConfig(AppConfig):
    name = "home"

    extra_reload_files = [
        Path(__file__).parent / ".env",
        Path(__file__).parent.parent / "static/snap/data_importer.js",
        Path(__file__).parent.parent / "static/snap/simple_sync_block.js",
    ]

    def add_extra_files(self, sender: autoreload.StatReloader, **kwargs):
        sender.extra_files.update(self.extra_reload_files)

    def ready(self):
        if settings.DEBUG:
            autoreload.autoreload_started.connect(self.add_extra_files)
        print("DEBUG:", settings.DEBUG)
        # print('CORS:', settings.CORS_ALLOW_ALL_ORIGINS)
        print("Installed Apps:", settings.INSTALLED_APPS)
        print("Middleware:", settings.MIDDLEWARE)
        print("Generating dynamic static data...")
        generateDataImportXML()
        generateSyncBlockXML()
        print("Generating finished.")
