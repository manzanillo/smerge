from .settings_base import *
import json

SECRET_PATH = '/var/secrets/secrets.smerge.json'

with  open(SECRET_PATH).read() as secrets_file:
    secrets = json.loads(secrets_file)
    SECRET_KEY = secrets["SECRET_KEY"]



DEBUG = False
ALLOWED_HOSTS = ['127.0.0.1', 'faui20q.cs.fau.de', 'faui20q.informatik.uni-erlangen.de']


SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
X_FRAME_OPTIONS = 'DENY'