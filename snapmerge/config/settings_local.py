from .settings_base import *

URL = 'http://127.0.0.1:8000'

SECRET_KEY = '()fvd?-m+=quyxz*_3v+gjg!d)8n0(wbo*k)(0kwtwuryr4nil'
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

COMPRESS_OFFLINE = False

# allow cross for testing...
#CORS_ALLOW_ALL_ORIGINS = True
CORS_ORIGIN_ALLOW_ALL = True
SECURE_REFERRER_POLICY = 'unsafe-url'
CORS_ALLOW_HEADERS = "*"

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True


# ASGI_APPLICATION = "routing.application"
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("localhost", 6379)],
        },
    },
}

CORS_ORIGIN_WHITELIST = CORS_ORIGIN_WHITELIST + [
    'https://rs-kubuntu.local', 'https://air.local'
]

CSRF_TRUSTED_ORIGINS = CSRF_TRUSTED_ORIGINS + ['https://rs-kubuntu.local'] + ['https://air.local']

ALLOWED_HOSTS = ['127.0.0.1', 'faui20s.cs.fau.de', 'faui20s.informatik.uni-erlangen.de', 'smerge.org', 'idpsmerge.duckdns.org', 'smerge_server', 'rs-kubuntu.local', 'air.local']

DEBUG = True