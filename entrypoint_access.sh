#!/bin/bash

# Collect static files
#echo "compress"

npm install && python ./snapmerge/manage.py compress --settings=config.settings_access


# Apply database migrations
echo "Apply database migrations"
python ./snapmerge/manage.py migrate --settings=config.settings_access