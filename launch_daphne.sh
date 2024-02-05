#!/bin/sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$SCRIPT_DIR/snapmerge"
python manage.py migrate --settings=config.settings_daphne 
daphne -p 8000 -b 0.0.0.0 config.asgi:application
# python manage.py runserver 8000 --settings=config.settings_daphne 
#-w 4 -t 4