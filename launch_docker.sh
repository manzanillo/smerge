#!/bin/sh

# Store the current directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Change directory to your Flask app's directory
cd "$SCRIPT_DIR/Access_Portal/Web_Api"

python run.py 2>&1 | tee /var/log/nginx/access.log &

nginx -g "daemon off;" 2>&1 | tee /var/log/nginx/access.log &

# Start the Vite server
cd "$SCRIPT_DIR/Access_Portal/access_portal"
npx vite --port=4000 2>&1 | tee /var/log/nginx/access.log &


cd "$SCRIPT_DIR"
python ./snapmerge/manage.py runserver --settings=config.settings_docker 2>&1 | tee /var/log/nginx/access.log &

# Change directory to your Vite app's directory
cd "$SCRIPT_DIR/react_extension"

# Start the Vite server
npx vite