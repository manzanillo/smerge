from app import app, db
from app.models import User
import bcrypt
import jwt
from datetime import datetime, timedelta


def getAllUser():
    return User.query.all()

def getUser(name):
    return User.query.filter(User.username == name).first()


def addUser(username, password):
    hashed_pw = hashPassword(password)
    try:
        addUserPrivate(User(username, hashed_pw))
        return True
    except:
        return False
    
def hashPassword(password):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode("utf-8")
    
def addUserPrivate(user):
    db.session.add(user)
    db.session.commit()
    
def check_password(username, password_hashed):
    user = getUser(username)
    if not user:
        return "False"
    
    if bcrypt.checkpw(password_hashed.encode("utf-8"), user.password.encode("utf-8")):
        if not user.activated:
            return "Please wait till account is activated."
        return "True"
    else:
        return "False"

def generateToken(username):
    user = getUser(username)
    payload = {
    'name': username,
    'isAdmin': user.isAdmin,
    'exp': datetime.utcnow() + timedelta(hours=1)  # Expiration time 1 hour from now
    }
    print(app.config['SECRET_KEY'])
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    return token