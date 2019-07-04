from channels.generic.websocket import WebsocketConsumer
import json


class SmergeConsumer(WebsocketConsumer):
    def connect(self):
        #TODO: in Liste eintragen
        self.accept()

    def disconnect(self, close_code):
        #TODO: aus Liste austragen
        pass

    def receive(self, text_data):
        #TODO: an alle weiterverbreiten
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        self.send(text_data=json.dumps({
            'message': message
        }))
