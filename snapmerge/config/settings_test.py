from .settings_base import *

URL = 'https://idpsmerge.duckdns.org'

SECRET_KEY = '()fvd?-m+=quyxz*_3v+gjg!d)8n0(wbo*k)(0kwtwuryr4nil'
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

COMPRESS_OFFLINE = False

# allow cross for testing...
CORS_ALLOW_ALL_ORIGINS = True
CORS_ORIGIN_ALLOW_ALL = True
SECURE_REFERRER_POLICY = 'unsafe-url'
CORS_ALLOW_HEADERS = "*"

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