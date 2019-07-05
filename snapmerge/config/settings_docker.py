from .settings_base import *

URL = 'http://127.0.0.1:80'

SECRET_KEY = '()fvd?-m+=quyxz*_3v+gjg!d)8n0(wbo*k)(0kwtwuryr4nil'
DEBUG = True
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

COMPRESS_OFFLINE = True

ASGI_APPLICATION = "routing.application"
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("redis", 6379)],
        },
    },
}
