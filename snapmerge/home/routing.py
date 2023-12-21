# from django.conf.urls import url
from django.urls import path

from . import consumers

websocket_urlpatterns = [
    path('ws/<str:room_name>/', consumers.ChatConsumer.as_asgi()),
]
# websocket_urlpatterns = [
#     re_path(r'^ws/(?P<proj_id>[-\w]+)', consumers.SmergeConsumer),
# ]
