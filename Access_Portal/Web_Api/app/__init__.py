from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from config import Config
from gitWorker.gitWorker import gitWorker

app = Flask(__name__)
app.config.from_object(Config)

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

gW = gitWorker()

db = SQLAlchemy(app)

from app import routes