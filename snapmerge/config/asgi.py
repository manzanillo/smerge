# SSEs try
import os
import django
from django.core.asgi import get_asgi_application
from django.urls import path, re_path
from channels.routing import ProtocolTypeRouter, URLRouter
from django_eventstream import routing, consumers
from .CustomRoomIdMiddleware import CustomRoomIdMiddlewareStack

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")


application = ProtocolTypeRouter({
    'http': URLRouter([
        path('events/<str:id>/', CustomRoomIdMiddlewareStack(
            URLRouter(routing.urlpatterns)
        )),
        re_path(r'', get_asgi_application()),
    ]),
})


# websocket v2
# import os

# from channels.auth import AuthMiddlewareStack
# from channels.routing import ProtocolTypeRouter, URLRouter
# from django.core.asgi import get_asgi_application

# import home.routing

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# application = ProtocolTypeRouter({
#   "http": get_asgi_application(),
#   "websocket": AuthMiddlewareStack(
#     URLRouter(
#       home.routing.websocket_urlpatterns
#     )
#   )
# })