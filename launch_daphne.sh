#!/bin/sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/snapmerge"

# Function to gracefully stop Daphne
graceful_shutdown() {
    echo "Received SIGTERM, gracefully shutting down Daphne..."
    kill -TERM "$PID"
    wait "$PID"
    echo "Daphne gracefully stopped."
    exit 0
}

# Trap SIGTERM signal and call graceful_shutdown function
trap 'graceful_shutdown' SIGTERM

# compress files
echo "Compressing files..."
python manage.py compress --settings=config.settings_daphne

# Run migrations
echo "Apply migrations..."
python manage.py migrate --settings=config.settings_daphne 

# Start Daphne
export DJANGO_SETTINGS_MODULE=config.settings_daphne

daphne -p 8000 -b 0.0.0.0 config.asgi:application &
PID=$!

# Wait for PID to exit
wait "$PID"
