#!/bin/bash

# Get the currently selected branch
current_path=$(dirname $0)
cd $current_path/../../..
current_branch=$(git symbolic-ref --short HEAD)

# Get a list of remote branches
remote_branches=$(git branch -r | grep -v "origin/HEAD")

# Create a JSON object with the branch information
json="{"
json+="\"current_branch\":\"$current_branch\","
json+="\"remote_branches\":["
for branch in $remote_branches; do
    json+="\"$branch\","
done
# Remove the trailing comma
json="${json%,}"
json+="]}"
echo $json