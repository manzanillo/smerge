#!/bin/bash

# Check if both branch and commit hash are provided as arguments
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <branch> <commit_hash>"
    exit 1
fi

# Extract the branch and commit hash from the arguments
branch="$1"
commit_hash="$2"

cd ~/Desktop/Smerge-Private

local_branch="${branch/origin\//}"
#echo "Switching to: $local_branch"
git switch -f "$local_branch"
# Reset to the given commit hash
git reset --hard "$commit_hash"

#echo "Git switch and reset completed successfully."

