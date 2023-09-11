from flask import Flask, request, jsonify, make_response
from app import app, db, gW as gitWorker
from app.models import User
import json
from flask_cors import CORS, cross_origin
from app.UserRepository import *
from functools import wraps
import jwt
import re

def token_required(func):
    # decorator factory which invoks update_wrapper() method and passes decorated function as an argument
    @wraps(func)
    def decorated(*args, **kwargs):
        token = request.args.get('bearer')
        if not token:
            return jsonify({'Alert!': 'Token is missing!'}), 401

        try:

            data = jwt.decode(token, app.config['SECRET_KEY'])
        # You can use the JWT errors in exception
        # except jwt.InvalidTokenError:
        #     return 'Invalid token. Please log in again.'
        except:
            return jsonify({'Message': 'Invalid token'}), 403
        return func(*args, **kwargs)
    return decorated

# decode token and return pair with valid 1, expired 0 or invalid -1 and a object of claims if valid
def decodeJWT(token):
    try:
        result = jwt.decode(token, app.config['SECRET_KEY'], algorithms='HS256')
        return (1, result)
    except jwt.ExpiredSignatureError:
        return (0, {})
    except:
        return (-1, {})
    

@app.get('/api')
@cross_origin()
def index():
    #user = User.query.first()
    user = getUser("test")
    if not user:
        return "No entry found.",404
    user_dict = [x.as_dict() for x in user]
    return jsonify(user_dict), 200
#render_template('index.html', users=users)

@app.get('/api/available/<name>')
@cross_origin()
def checkUsernameAvailable(name):
    #user = User.query.first()
    user = getUser(name)
    if not user:
        return "True",200
    return "False", 200

@app.post('/api/add')
@cross_origin()
def add():
    username = None
    password = None
    request_data = request.get_json()
    if request_data:
        if 'username' in request_data.keys():
            username = request_data['username']
        if 'password' in request_data.keys():
            password = request_data['password']
    if username and password:
        res = addUser(username, password)
        if res:
            return "User Created.", 200 
        else:
            return "User creation filed!", 400
    else:
        if not username and not password:
            return make_response('Username and password are missing!', 403, {'WWW-Authenticate': 'Basic realm: "Authentication Failed "'})
            #return "Username and password are missing!", 403
        if not username:
            return make_response('Username is missing!', 403, {'WWW-Authenticate': 'Basic realm: "Authentication Failed "'})
            #return "Username is missing!", 403
        else:
            return make_response('Password is missing!', 403, {'WWW-Authenticate': 'Basic realm: "Authentication Failed "'})
            #return "Password is missing!", 403


@app.post('/api/login')
@cross_origin()
def login():
    username = None
    password = None
    request_data = request.get_json()
    if request_data:
        if 'username' in request_data.keys():
            username = request_data['username']
        if 'password' in request_data.keys():
            password = request_data['password']
    if username and password:
        checked = check_password(username, password)
        if checked != "True":
            if "Please wait" in checked:
                return make_response(checked, 401, {'WWW-Authenticate': 'Basic realm: "Authentication Failed "'})
            return make_response('Wrong username or password!', 401, {'WWW-Authenticate': 'Basic realm: "Authentication Failed "'})
            #return "Wrong username or password!", 401
    
        token = generateToken(username)
        if token == "":
            return "Wupsi",404
        return token, 200
    
    else:
        if not username and not password:
            return make_response('Username and password are missing!', 403, {'WWW-Authenticate': 'Basic realm: "Authentication Failed "'})
            #return "Username and password are missing!", 403
        if not username:
            return make_response('Username is missing!', 403, {'WWW-Authenticate': 'Basic realm: "Authentication Failed "'})
            #return "Username is missing!", 403
        else:
            return make_response('Password is missing!', 403, {'WWW-Authenticate': 'Basic realm: "Authentication Failed "'})
            #return "Password is missing!", 403
        
        
@app.get('/api/token/valid')
@cross_origin()
def validatePing():
    if request.authorization:
        token = f"{request.authorization}".replace("Bearer ", "").replace("bearer ", "")
        validation_result = decodeJWT(token)
        status = validation_result[0]
        claims = validation_result[1]
        if status == 1:
            return make_response(claims, 200)
            #return f"{claims}", 200
        if status == 0:
            return "Token is Expired!", 401
        return "Token is Invalid!", 401
    else:
        return "No token!", 400
    
    
@app.get('/api/git/branches')
@cross_origin()
def getBranchList():
    return make_response(gitWorker.getBranches(), 200)

@app.post('/api/git/commits')
@cross_origin()
def getCommits():
    try:
        request_data = request.get_json()
        if request_data["path"]:
            try:
                res = gitWorker.getCommitsByGitPath(request_data["path"])
                return make_response(res, 200)
            except KeyError:
                return make_response("Branch not found!", 404)
            
        else:
            print("Fallback Default")
            return make_response(gitWorker.getCommitsByGitPath("origin/master"), 200)
    except KeyError:
                return make_response("Malformed input (make sure json contains \"path\")!", 404)
    except:
        return "No or malformed json!", 404
    
@app.post('/api/git/switch')
@cross_origin()
def switchBranchAndCommit():
    try:
        request_data = request.get_json()
        if request_data["branch"]:
            branch = request_data["branch"]
        else:
            return make_response("Branch is missing!", 404)
            
        if request_data["commit_hash"]:
            commitHash = request_data["commit_hash"]
        else:
            return make_response("Commit hash is missing!", 404)
        
        
        # check if branch exists
        try:
            commitsJson = gitWorker.getCommitsByGitPath(branch)
        except:
            return make_response("Branch not found in local files!", 404)
        
        # check if commit exists
        try:
            hash_exists = next((commit for commit in commitsJson["commit"] if commit["hash"] == commitHash), None)
            
            if hash_exists is None:
                return make_response("Commit not found in the given branch!", 404)
        except:
            return make_response("Branch not found in local files!", 404)

        res = gitWorker.switchToBranchAndCommit(branch, commitHash)
        
        date = hash_exists['date']
        if(res):
            return make_response(f"Switching to commit '{hash_exists['msg']}' by '{hash_exists['author']}' from '{date}'successful.", 200)
        else:
            return make_response(f"Switching to commit '{hash_exists['msg']}' by '{hash_exists['author']}' from '{hash_exists['date']}'failed :(", 400)
    except KeyError:
                return make_response("Malformed input (make sure json contains \"branch\" and \"commit_hash\")!", 404)
    except:
        return "No or malformed json!", 404
    
# mockup for now... fix later
@app.get('/api/git/icons')
@cross_origin()
def getIconList():
    ret = {
        
    }
    return make_response(ret, 200)

@app.post('/api/git')
@cross_origin()
def handleWebHook():
    return "OK", 200
    