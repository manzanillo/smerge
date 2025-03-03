from .settings_base import *
import json

# internal url the server listens on
URL = "http://0.0.0.0:8000"

# url used in snap blocks to find the server
POST_BACK_URL = "https://<your-domain>"

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"


SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = "DENY"

COMPRESS_OFFLINE = True

# invalidate csrf token after 12 hours
# ("force" login via the main page and not a direct url)
# extreme naive version to ensure password check without real login
CSRF_COOKIE_AGE = 43200

# allow cross for testing...
# CORS_ALLOW_ALL_ORIGINS = True
# CORS_ORIGIN_ALLOW_ALL = True
# SECURE_REFERRER_POLICY = "unsafe-url"
# CORS_ALLOW_HEADERS = "*"

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True

ASGI_APPLICATION = "routing.application"

CORS_ORIGIN_WHITELIST = CORS_ORIGIN_WHITELIST + [
    "https://<your-domain>",
]

CSRF_TRUSTED_ORIGINS = CSRF_TRUSTED_ORIGINS + [
    "https://<your-domain>",
]

ALLOWED_HOSTS = [
    "127.0.0.1",
    "faui20s.cs.fau.de",
    "faui20s.informatik.uni-erlangen.de",
    "smerge.org",
    "<your-domain>",
]

DEBUG = False
BETA = True

SECRET_PATH = "../secrets/smerge/secrets.smerge.json"
secret_file = open(SECRET_PATH).read()
secrets = json.loads(secret_file)
SECRET_KEY = secrets["SECRET_KEY"]
EMAIL_HOST_PASSWORD = secrets["EMAIL_HOST_PASSWORD"]
EMAIL_SENDER = "<your-mailrelay-sender>"

EMAIL_HOST = "in-v3.mailjet.com"
EMAIL_PORT = 587
EMAIL_HOST_USER = secrets["EMAIL_API_KEY"]

EMAIL_USE_TLS = True
