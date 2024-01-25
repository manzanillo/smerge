#!/bin/sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

cd "$SCRIPT_DIR/snapmerge"
ls -al
daphne -p 8001 config.asgi:application