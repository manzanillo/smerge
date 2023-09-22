from app import app, db
from app.models import Settings


def upsertSetting(name, value, desc):
    # Check if a record with the same name exists
    ret = 0
    existing_record = Settings.query.filter(Settings.name == name).first()

    if existing_record:
        # If the record exists, update its value
        ret = 1
        existing_record.value = value
        existing_record.desc = desc
    else:
        # If the record doesn't exist, create a new one
        new_record = Settings(name=name, value=value, desc=desc)
        db.session.add(new_record)

    # Commit the transaction
    db.session.commit()
    return ret
    
def getSetting(name):
    return Settings.query.filter(Settings.name == name).first()

def getAllSettings():
    return Settings.query.all()
    
    

# def getAllUnlockedIps():
#     return UnlockedIps.query.all()

# def getUnlockedIpsForUser(name):
#     return UnlockedIps.query.filter(UnlockedIps.username == name)

# def getUnlockedIpById(id):
#     return UnlockedIps.query.get(id)


# def addUnlockedIp(username, ip):
#     # try:
#     uip = UnlockedIps(username, ip, datetime.utcnow() + timedelta(minutes=10))
#     db.session.add(uip)
#     db.session.commit()
#     return uip
#     # except e:
#     #     return e
    
# def getIpIsUnlocked(ip):
#         res = UnlockedIps.query.filter(UnlockedIps.ip_address == ip)
#         current_time = datetime.utcnow()
        
#         activeIps = [cip for cip in res if current_time < cip.expire_date]
#         if len(activeIps) > 0:
#             return activeIps
#         else:
#             return None