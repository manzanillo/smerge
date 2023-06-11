from .settings_base import *

URL = 'http://127.0.0.1:8000'

SECRET_KEY = '()fvd?-m+=quyxz*_3v+gjg!d)8n0(wbo*k)(0kwtwuryr4nil'
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

COMPRESS_OFFLINE = False

ASGI_APPLICATION = "routing.application"
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("localhost", 6379)],
        },
    },
}

ALLOWED_HOSTS = ['127.0.0.1', 'faui20s.cs.fau.de', 'faui20s.informatik.uni-erlangen.de', 'smerge.org', 'idpsmerge.duckdns.org']

DEBUG = True