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
    
    def as_save_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns if column.name != "password"}
    
class UnlockedIps(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), nullable=False)
    ip_address = db.Column(db.String(15), nullable=False)
    expire_date = db.Column(db.DateTime, nullable=False)

    def __init__(self, username, ip_address, expire_date):
        self.username = username
        self.ip_address = ip_address
        self.expire_date = expire_date
    
    def as_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}
    
class Settings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False, unique=True)
    value = db.Column(db.String(64), nullable=False)
    desc = db.Column(db.String(255))

    def __init__(self, name, value, desc):
        self.name = name
        self.value = value
        self.desc = desc
    
    def as_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}