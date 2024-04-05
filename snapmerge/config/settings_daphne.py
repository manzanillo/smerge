from .settings_base import *
import json

# internal url the server listens on
URL = "http://0.0.0.0:8000"
# POST_BACK_URL = 'https://rs-kubuntu.local'
# POST_BACK_URL = 'https://idpsmerge.duckdns.org'

# url used in snap blocks to find the server
POST_BACK_URL = "https://thorstest.hopto.org"

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"


SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
X_FRAME_OPTIONS = "DENY"

COMPRESS_OFFLINE = True


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

# CSRF_TRUSTED_ORIGINS = (
#     CSRF_TRUSTED_ORIGINS
#     + [
#         "https://rs-kubuntu.local",
#         "https://idpsmerge.duckdns.org",
#         "https://thorstest.hopto.org",
#     ]
#     + ["https://air.local"]
# )

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

DEBUG = False
BETA = True

SECRET_PATH = "../secrets/smerge/secrets.smerge.json"
secret_file = open(SECRET_PATH).read()
secrets = json.loads(secret_file)
EMAIL_HOST_PASSWORD = secrets["EMAIL_HOST_PASSWORD"]
EMAIL_SENDER = "idppi@idpsmerge.duckdns.org"

EMAIL_HOST = "in-v3.mailjet.com"
EMAIL_PORT = 587
EMAIL_HOST_USER = secrets["EMAIL_API_KEY"]

EMAIL_USE_TLS = True
