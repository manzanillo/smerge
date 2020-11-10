from .settings_base import *
import json

#URL = 'http://127.0.0.1:80'
URL = 'https://smerge.org'

SECRET_PATH = './secrets/smerge/secrets.smerge.json'

secret_file = open(SECRET_PATH).read()
secrets = json.loads(secret_file)
SECRET_KEY = secrets["SECRET_KEY"]
EMAIL_HOST_PASSWORD = secrets["EMAIL_HOST_PASSWORD"]

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

COMPRESS_OFFLINE = True

ALLOWED_HOSTS = ['127.0.0.1', 'faui20s.cs.fau.de', 'faui20s.informatik.uni-erlangen.de', 'smerge.org']

ASGI_APPLICATION = "routing.application"
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("redis", 6379)],
        },
    },
}



SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = 'DENY'
