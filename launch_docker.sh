#!/bin/sh

echo "Public SSH key for git:"
cat /root/.ssh/id_rsa.pub

# Store the current directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Change directory to your Flask app's directory
cd "$SCRIPT_DIR/Access_Portal/Web_Api"

python run.py 2>&1 &

nginx -g "daemon off;" 2>&1 &

# Start the Vite server
cd "$SCRIPT_DIR/Access_Portal/access_portal"
npx vite --port=4000 2>&1 &


cd "$SCRIPT_DIR"
python ./snapmerge/manage.py runserver --settings=config.settings_test 2>&1 &

# Change directory to your Vite app's directory
cd "$SCRIPT_DIR/react_extension"

# Start the Vite server
npx vite