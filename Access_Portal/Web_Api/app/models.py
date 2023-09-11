from flask_sqlalchemy import SQLAlchemy
from app import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True)
    password = db.Column(db.String(60))
    isAdmin = db.Column(db.Boolean(1))
    activated = db.Column(db.Boolean(1))

    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.isAdmin = False
        self.activated = False
    
    def as_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}