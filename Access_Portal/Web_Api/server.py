from flask import Flask, request, jsonify
import sqlite3 as sl
import bcrypt
from flask_sqlalchemy import SQLAlchemy

from dbCommands import check_password, add_user, delete_user, user_exists, get_user, update_user, get_token


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////home/rs-kubuntu/Desktop/Access_Portal/Web_Api/local.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


from Models.User import User



@app.route("/acapi/test/<name>")
def test(name):
    #test_data = db.session.execute("SELECT username, password, isAdmin FROM user").mappings().all()
    test_data = User.query.first()
    print(test_data.username)
    #usr = User(name, 'test'.encode("utf-8"), False)
    #db.session.add(usr)
    #db.session.commit()
    
    return "OK", 200
    #return test_data, 200
    #return jsonify(test_data), 200

@app.route("/acapi/login", methods=['GET'])
def login():
    username = request.args.get("username")
    password = request.args.get("password")
    
    if username is None and password is None:
        return "No username and password given!", 400
    if username is None:
        return "No username given!", 400
    if password is None:
        return "No password given!", 400
    
    token = get_token(cur, con, username, password)
    if token == "":
        return "Wrong username or password.", 401
    else:
        return token, 200

if __name__ == "__main__":
    #db.session.add(User(username="Test2", password="1234", isAdmin=False))
    #print(db.session.execute(db.select(User).order_by(User.username)).scalars())
    
    with app.app_context():  
        db.create_all()
        app.run(debug=True)
    
    #add_user(cur, con, "Test2", "1234", False)
    #delete_user(cur,con,"Test2")
    #print(user_exists(cur, "Test"))
    #update_user(cur, con, "Test", "isAdmin", 0)
    #print(get_token(cur, con, "Test", "123"))
    #print(check_password(cur, con, "Test", "123"))
    cur.close()
    
