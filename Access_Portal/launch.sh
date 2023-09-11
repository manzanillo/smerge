#!/bin/bash

# This script is used to start the Vite server and the Flask backend at the same time.
# Bothe run on thair default ports on launch and will bundle both outputs inside the console
# with a tag at the front do find out where the output came from.

# Since Vite can be controlled from the terminal to some extend, every input after launching will 
# be pumped to the Vite process.

# Store the current directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Change directory to your Flask app's directory
cd "$SCRIPT_DIR/Web_Api"

# Function to start the Flask server
start_flask() {
    /home/rs-kubuntu/miniconda3/envs/access_portal_api/bin/python run.py > /tmp/flask_output 2>&1
}

# Function to stop all processes gracefully
stopall() {
  echo "Stopping Flask server..."
  pkill -P $$  # Kill all child processes (including Flask)
  pkill -g 0 -f "python run.py"
  wait "$flask_pid"
  echo "Flask server stopped."
  rm /tmp/flask_output  # Remove the temporary output file
  exit 0
}

# Trap the "q" key press to stop all processes and exit the script
trap 'stopall' SIGINT

# Start the Flask server in the background
start_flask &
# Store the Flask server's PID in a variable
flask_pid=$!


# Function to read and print the Flask output
read_flask_output() {
  while true; do
    if [ -s /tmp/flask_output ]; then
      #cat /tmp/flask_output | sed 's/^/Flask: /'
      sed 's/^/Flask: /' /tmp/flask_output
      > /tmp/flask_output  # Clear the temporary output file
    fi
    sleep 0.5
  done
}

# Start the input handler function in the background
read_flask_output &

# Change directory to your Vite app's directory
cd "$SCRIPT_DIR/access_portal"

# Start the Vite server
npx vite --port=4000

stopall