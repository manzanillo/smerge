#!/bin/bash

# Collect static files
#echo "compress"
npm install && python ./snapmerge/manage.py compress --settings=config.settings_docker


# Apply database migrations
echo "Apply database migrations"
python ./snapmerge/manage.py migrate --settings=config.settings_docker

