from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer
import json


class SmergeConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['proj_id']
        self.room_group_name = 'session_%s' % self.room_name

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        new_node = text_data_json['node']

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'upload_message',
                'node': new_node
            }
        )

    # Receive message from room group
    def upload_message(self, event):
        new_node = event['node']

        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'node': new_node
        }))
