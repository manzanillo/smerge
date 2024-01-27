#!/bin/sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$SCRIPT_DIR/snapmerge"
daphne -p 8000 -b 0.0.0.0 config.asgi:application
# python manage.py runserver 8000 --settings=config.settings_daphne