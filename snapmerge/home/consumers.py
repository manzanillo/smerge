# import json

# from channels.generic.websocket import AsyncWebsocketConsumer # The class we're using

# class EventStreamConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.room_id = self.scope['url_route']['kwargs']['room_id']
#         self.room_group_name = self.room_id

#         # Join room group
#         await self.channel_layer.group_add(
#             self.room_group_name,
#             self.channel_name
#         )

#         await self.accept()

#     async def disconnect(self, close_code):
#         # Leave room group
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )
            
            
from channels.generic.http import AsyncHttpConsumer
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django_eventstream import send_event
import asyncio

class EventStreamConsumer(AsyncHttpConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = self.room_id

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
    async def disconnect(self):
        # Your existing disconnect logic goes here
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # async def handle(self, body):
    #     room_id = self.scope['url_route']['kwargs']['room_id']
    #     await self.send_headers(headers=[
    #         (b"Content-Type", b"text/event-stream"),
    #         (b"Cache-Control", b"no-cache"),
    #         (b"Connection", b"keep-alive"),
    #     ])


            
            
            
            
    # # Receive message from WebSocket
    # async def receive(self, text_data):
    #     data = json.loads(text_data)
    #     message = data['message']
    #     username = data['username']
    #     room = data['room']

    #     # Send message to room group
    #     await self.channel_layer.group_send(
    #         self.room_group_name,
    #         {
    #         'type': 'chat_message',
    #         'message': message,
    #         'username': username
    #         }
    #     )

    # # Receive message from room group
    # async def chat_message(self, event):
    #     message = event['message']

    #     # Send message to WebSocket
    #     await self.send(text_data=json.dumps({
    #         'message': message
    #     }))


# from asgiref.sync import async_to_sync
# from channels.generic.websocket import WebsocketConsumer
# import json


# class SmergeConsumer(WebsocketConsumer):
#     def connect(self):
#         self.room_name = self.scope['url_route']['kwargs']['proj_id']
#         self.room_group_name = 'session_%s' % self.room_name

#         # Join room group
#         async_to_sync(self.channel_layer.group_add)(
#             self.room_group_name,
#             self.channel_name
#         )

#         self.accept()

#     def disconnect(self, close_code):
#         # Leave room group
#         async_to_sync(self.channel_layer.group_discard)(
#             self.room_group_name,
#             self.channel_name
#         )

#     # Receive message from WebSocket
#     def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         new_node = text_data_json['node']

#         # Send message to room group
#         async_to_sync(self.channel_layer.group_send)(
#             self.room_group_name,
#             {
#                 'type': 'upload_message',
#                 'node': new_node
#             }
#         )

#     # Receive message from room group
#     def upload_message(self, event):
#         new_node = event['node']
#         event_type = event['event']


#         # Send message to WebSocket
#         self.send(text_data=json.dumps({
#             'event': event_type,
#             'node': new_node
#         }))
