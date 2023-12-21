# """
# ASGI entrypoint. Configures Django and then runs the application
# defined in the ASGI_APPLICATION setting.
# """

# import os
# import django
# from django.core.asgi import get_asgi_application
# from django.urls import path, re_path
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# import django_eventstream

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")

# application = ProtocolTypeRouter({
#     'http': URLRouter([
#         path('events/', AuthMiddlewareStack(
#             URLRouter(django_eventstream.routing.urlpatterns)
#         ), { 'channels': ['test'] }),
#         re_path(r'', get_asgi_application()),
#     ]),
# })

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

import home.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

application = ProtocolTypeRouter({
  "http": get_asgi_application(),
  "websocket": AuthMiddlewareStack(
    URLRouter(
      home.routing.websocket_urlpatterns
    )
  )
})