from .settings_base import *
import json

URL = "https://thorstest.hopto.org"
POST_BACK_URL = "https://thorstest.hopto.org"

SECRET_KEY = "()fvd?-m+=quyxz*_3v+gjg!902ß5wbo*k)(0kwtwuryr4nil"
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

COMPRESS_OFFLINE = False

# allow cross for testing...
# CORS_ALLOW_ALL_ORIGINS = True
CORS_ORIGIN_ALLOW_ALL = True
SECURE_REFERRER_POLICY = "unsafe-url"
CORS_ALLOW_HEADERS = "*"

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True


# ASGI_APPLICATION = "routing.application"
# CHANNEL_LAYERS = {
#     "default": {
#         "BACKEND": "channels_redis.core.RedisChannelLayer",
#         "CONFIG": {
#             "hosts": [("localhost", 6379)],
#         },
#     },
# }

CORS_ORIGIN_WHITELIST = CORS_ORIGIN_WHITELIST + [
    "https://rs-kubuntu.local",
    "https://air.local",
    "https://idpsmerge.duckdns.org",
    "https://thorstest.hopto.org",
]

CSRF_TRUSTED_ORIGINS = CSRF_TRUSTED_ORIGINS + [
    "https://rs-kubuntu.local",
    "https://idpsmerge.duckdns.org",
    "https://air.local",
    "https://thorstest.hopto.org",
]

ALLOWED_HOSTS = [
    "127.0.0.1",
    "faui20s.cs.fau.de",
    "faui20s.informatik.uni-erlangen.de",
    "smerge.org",
    "idpsmerge.duckdns.org",
    "smerge_server",
    "rs-kubuntu.local",
    "air.local",
    "thorstest.hopto.org",
]

DEBUG = True

SECRET_PATH = "secrets/smerge/secrets.smerge.json"
secret_file = open(SECRET_PATH).read()
secrets = json.loads(secret_file)
EMAIL_HOST_PASSWORD = secrets["EMAIL_HOST_PASSWORD"]
EMAIL_SENDER = "idppi@idpsmerge.duckdns.org"

EMAIL_HOST = "in-v3.mailjet.com"
EMAIL_PORT = 587
EMAIL_HOST_USER = secrets["EMAIL_API_KEY"]

EMAIL_USE_TLS = True
