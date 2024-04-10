# from django.conf.urls import url
from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path("ws/<str:room_name>/", consumers.EventStreamConsumer.as_asgi()),
]
