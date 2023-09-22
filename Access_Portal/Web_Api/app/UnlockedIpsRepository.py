from app import app, db
from app.models import UnlockedIps
from datetime import datetime, timedelta


def getAllUnlockedIps():
    return UnlockedIps.query.all()

def getUnlockedIpsForUser(name):
    return UnlockedIps.query.filter(UnlockedIps.username == name)

def getUnlockedIpById(id):
    return UnlockedIps.query.get(id)


def addUnlockedIp(username, ip, timeSpan):
    # try:
    uip = UnlockedIps(username, ip, datetime.utcnow() + timedelta(seconds=timeSpan))
    db.session.add(uip)
    db.session.commit()
    return uip
    # except e:
    #     return e
    
def getIpIsUnlocked(ip):
        res = UnlockedIps.query.filter(UnlockedIps.ip_address == ip)
        current_time = datetime.utcnow()
        
        activeIps = [cip for cip in res if current_time < cip.expire_date]
        if len(activeIps) > 0:
            return activeIps
        else:
            return None
            
    
# def hashPassword(password):
#     salt = bcrypt.gensalt()
#     hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
#     return hashed_password.decode("utf-8")
    
# def addUserPrivate(user):
#     db.session.add(user)
#     db.session.commit()
    
# def check_password(username, password_hashed):
#     user = getUser(username)
#     if not user:
#         return "False"
    
#     if bcrypt.checkpw(password_hashed.encode("utf-8"), user.password.encode("utf-8")):
#         if not user.activated:
#             return "Please wait till account is activated."
#         return "True"
#     else:
#         return "False"

# def generateToken(username):
#     user = getUser(username)
#     payload = {
#     'name': username,
#     'isAdmin': user.isAdmin,
#     'exp': datetime.utcnow() + timedelta(hours=1)  # Expiration time 1 hour from now
#     }
#     print(app.config['SECRET_KEY'])
#     token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
#     return token