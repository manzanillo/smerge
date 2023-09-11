#!/bin/bash

# Function to start the Flask server
start_django() {
    /home/rs-kubuntu/miniconda3/envs/smerge/bin/python ./snapmerge/manage.py runserver --settings=config.settings_local > /tmp/django_output 2>&1
}

# Function to stop all processes gracefully
stopall() {
  echo "Stopping Django server..."
  pkill -P $$  # Kill all child processes (including Flask)
  pkill -g 0 -f "python ./snapmerge/manage.py runserver"
  wait "$django_pid"
  echo "Django server stopped."
  rm /tmp/django_output  # Remove the temporary output file
  exit 0
}

# Trap the "q" key press to stop all processes and exit the script
trap 'stopall' SIGINT

# Start the Flask server in the background
start_django &
# Store the Flask server's PID in a variable
django_pid=$!


# Function to read and print the Flask output
read_django_output() {
  while true; do
    if [ -s /tmp/django_output ]; then
      #cat /tmp/django_output | sed 's/^/Flask: /'
      sed 's/^/Django: /' /tmp/django_output
      > /tmp/django_output  # Clear the temporary output file
    fi
    sleep 0.5
  done
}

# Start the input handler function in the background
read_django_output &

# Change directory to your Vite app's directory
cd "react_extension"

# Start the Vite server
npx vite

stopall