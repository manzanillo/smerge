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
    
def getUserToActivate():
    return User.query.filter(User.activated == False)
    
def hashPassword(password):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed_password.decode("utf-8")
    
def addUserPrivate(user):
    db.session.add(user)
    db.session.commit()
    
# switches the users activation status
def activateUser(userName):
    toActivate = User.query.filter(User.username == userName).first()
    if toActivate:
        toActivate.activated = not toActivate.activated
        db.session.commit()
        return "Switched"
    return "No user found."

def setAdminState(userName, state):
    toSet = User.query.filter(User.username == userName).first()
    if toSet:
        toSet.isAdmin = state
        db.session.commit()
        if state:
            return f"{userName} is now an admin."
        else:
            return f"{userName} is no longer an admin!"
    return f'No user named "{userName}" found.'
    
    
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