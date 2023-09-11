#!/bin/bash

current_path=$(pwd)
# Execute the script to generate JSON
json_branches=$(./getBranchJson.sh)

remote_branches=$(echo $json_branches | jq -r .remote_branches[])

cd ~/Desktop/Smerge-Private
export GIT_PAGER="cat"

# Loop through remote branches and run 'git log' for each one
for branch in $remote_branches; do
    save_name=$(echo "$branch" | sed 's/\//_/g')

    echo "Start gathering commit history for branch: $branch"
    git log $branch

    json=$(git --no-pager log --pretty=format:'%H;%an <%ae>;%ad;%s' $branch | awk -F ';' -v OFS=',' '{gsub(/["\\]/, "", $4); print "{" "\"hash\":\"" $1 "\",\"author\":\"" $2 "\",\"date\":\"" $3 "\",\"msg\":\"" $4 "\"}" }' | paste -sd ',' | { echo -n "{\"commit\":["; cat; echo "]}";})
    
    #json="${json%,}"

    echo $json > $current_path/data/$save_name.json
    echo "Finished gathering commit history and saved under: $save_name"
done
echo $json_branches > $current_path/data/all_branches.json
