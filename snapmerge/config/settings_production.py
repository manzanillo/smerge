from .settings_base import *
import json

URL = 'https://smerge.org'

SECRET_PATH = '/var/secrets/secrets.smerge.json'

#with  open(SECRET_PATH).read() as secrets_file:
#    secrets = json.loads(secrets_file)
#    SECRET_KEY = secrets["SECRET_KEY"]

SECRET_KEY = '3s!+bjs7d(n^p#8-2^015h$mb=yb^7_o2%35ggw8z3vcfcg%n*'

DEBUG = True
ALLOWED_HOSTS = ['127.0.0.1', 'faui20s.cs.fau.de', 'faui20s.informatik.uni-erlangen.de', 'smerge.org']


SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
X_FRAME_OPTIONS = 'DENY'
