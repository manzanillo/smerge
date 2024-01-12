from app import app, db
from app.models import UnlockedIps
from datetime import datetime, timedelta
from app.SettingsRepository import getSetting


def getAllUnlockedIps():
    return UnlockedIps.query.all()

def getAllActiveUnlockedIps():
    return UnlockedIps.query.filter(UnlockedIps.expire_date > datetime.utcnow())

def getUnlockedIpsForUser(name):
    return UnlockedIps.query.filter(UnlockedIps.username == name)

def getUnlockedIpsForIp(ip):
    return UnlockedIps.query.filter(UnlockedIps.ip_address == ip)

def setIpsLockedForUser(name):
    timeout = int(getSetting("timeout").value)
    res = getUnlockedIpsForUser(name)
    ret = 0
    current_time = datetime.utcnow()
    for re in res:
        if current_time < re.expire_date:
            re.expire_date = datetime.utcnow() - timedelta(seconds=timeout+60)
            ret+=1
    db.session.commit()
    return ret

def setIpsLockedForIp(ip):
    timeout = int(getSetting("timeout").value)
    res = getUnlockedIpsForIp(ip)
    ret = 0
    current_time = datetime.utcnow()
    for re in res:
        if current_time < re.expire_date:
            re.expire_date = datetime.utcnow() - timedelta(seconds=timeout+60)
            ret+=1
    db.session.commit()
    return ret

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