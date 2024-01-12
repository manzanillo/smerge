# SSEs try
import os
import django
from django.core.asgi import get_asgi_application
from django.urls import path, re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from django_eventstream import routing, consumers
from .CustomRoomIdMiddleware import CustomRoomIdMiddlewareStack

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "snapmerge.config.settings_local")


application = ProtocolTypeRouter({
    'http': URLRouter([
        path('events/<str:id>/', CustomRoomIdMiddlewareStack(
            URLRouter(routing.urlpatterns)
        )),
        re_path(r'', get_asgi_application()),
    ]),
})

# dep mode?
#daphne snapmerge.config.asgi:application
