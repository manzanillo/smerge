from flask_sqlalchemy import SQLAlchemy
from app import db, app
from sqlalchemy import event, DDL

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
    
    
from enum import Enum
class SettingsObjectTypes(Enum):
    """
    Enum Description: 
    Specify the settings object type (for display purposes...)
    [int, string, bool]
    """
    typeInt = "int"
    typeString = "string"
    typeBoolean = "boolean"
    
class Settings(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False, unique=True)
    value = db.Column(db.String(64), nullable=False)
    desc = db.Column(db.String(255))
    objectType = db.Column(db.String(255))

    def __init__(self, name, value, desc, objectType: SettingsObjectTypes = SettingsObjectTypes.typeString.value):
        self.name = name
        # cap value to 0 or 1 if boolean
        if(objectType == objectType.typeBoolean):
            try:
                self.value = str(max(0, min(int(value), 1)))
            except ValueError:
                self.value = "0"
        # ensure int
        elif(objectType == objectType.typeInt):
            try:
                self.value = str(int(value))
            except ValueError:
                self.value = "0"
        else:
            self.value = value
        self.desc = desc
        self.objectType = objectType.value
    
    def as_dict(self):
        return {column.name: getattr(self, column.name) for column in self.__table__.columns}
    


    
# init settings if not exist on flask start (called on start in run.py)
def seed_initial_values(*args, **kwargs):
    changes = 0
    if not Settings.query.filter_by(name='timeout').first():
        db.session.add(Settings(name='timeout', value='3600', desc='Sets how long a users ip should have access to the underlying server in seconds.', objectType=SettingsObjectTypes.typeInt))
        changes += 1
    if not Settings.query.filter_by(name='ipLock').first():
        db.session.add(Settings(name='ipLock', value='1', desc='Sets if ip locking should be active or not.', objectType=SettingsObjectTypes.typeBoolean))
        changes += 1
    if not Settings.query.filter_by(name='localEditOnly').first():
        db.session.add(Settings(name='localEditOnly', value='1', desc='Sets if settings should only be changeable from local ip.', objectType=SettingsObjectTypes.typeBoolean))
        changes += 1
    if changes > 0:
        print(f"Seeded {changes} values.")
        db.session.commit()