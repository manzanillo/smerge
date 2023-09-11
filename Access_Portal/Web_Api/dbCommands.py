import sqlite3 as sl
import bcrypt
import jwt
from datetime import datetime, timedelta


key = "!wz56TjHPpGkS^G#@4MY4c58hU#68b^PLMsithamL#QHFoc8f^jX$AudSDprhN&E*BHLUSyF#hfLjApGVcn6JKidEw*p3yRK4t!tg9^2FJ@aJy3za&ZUaSoZXP#5N!*D"

def add_user(cur, con, username, password, isAdmin):
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt)
    #print(hashed_password)
    
    insert_query = "INSERT INTO user VALUES (?,?,?)"
    cur.execute(insert_query, (isAdmin, username, hashed_password))

    cur.commit()
    
def delete_user(cur, con, username):
    cur.execute(f'delete from user where username IS "{username}";')
    con.commit()
    
def get_user(cur, column, value):
    res = cur.execute(f"SELECT * FROM user WHERE {column} = '{value}';")
    return res.fetchone()

def check_password(cur, con, username, password):
    res = get_user(cur, "username", username)
    if res is None:
        return False
    return bcrypt.checkpw(password.encode("utf-8"), res[2])

def get_token(cur, con, username, password):
    if not check_password(cur, con, username, password):
        return ""
    
    res = get_user(cur, "username", username)
    payload = {
    'name': username,
    'isAdmin': res[0],
    'exp': datetime.utcnow() + timedelta(hours=1)  # Expiration time 1 hour from now
    }

    token = jwt.encode(payload, key, algorithm='HS256')

    return token


def update_user(cur, con, username, column, value):
    cur.execute(f"UPDATE user set {column} = '{value}' where username='{username}'")
    con.commit()
    
def user_exists(cur, name):
    res = get_user(cur, "username", name)
    return res is not None