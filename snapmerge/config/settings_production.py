from .settings_base import *
import json

URL = 'https://smerge.org'

SECRET_PATH = '/var/secrets/secrets.smerge.json'

secret_file = open(SECRET_PATH).read()
secrets = json.loads(secret_file)
SECRET_KEY = secrets["SECRET_KEY"]
EMAIL_HOST_PASSWORD = secrets["EMAIL_HOST_PASSWORD"]

ALLOWED_HOSTS = ['127.0.0.1', 'faui20s.cs.fau.de', 'faui20s.informatik.uni-erlangen.de', 'smerge.org']


SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
X_FRAME_OPTIONS = 'DENY'


COMPRESS_OFFLINE = True