#!/bin/sh

# Store the current directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

nginx

cd "$SCRIPT_DIR"
python ./snapmerge/manage.py runserver --settings=config.settings_test 2>&1 &

# Change directory to your Vite app's directory
cd "$SCRIPT_DIR/react_extension"

# Start the Vite server
npx vite