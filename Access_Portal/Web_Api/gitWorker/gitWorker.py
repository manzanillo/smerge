# Get list of branches
# https://api.github.com/repos/IDP-Smerge/Smerge-Private/branches

# Get commits for branch
# https://api.github.com/repos/IDP-Smerge/Smerge-Private/commits?sha=d7779594f26d41ccf49fdddddfc9f52c2e6b6389
# sha: -- commit branch id
# commit: ->
#           author: ->
#                       name
#                       date
#d7779594f26d41ccf49fdddddfc9f52c2e6b6389
# e999311560ac8d4b26fbed0e53c409f19340a8b9


#git switch -f master
#git reset --hard e999311560ac8d4b26fbed0e53c409f19340a8b9

import os
import subprocess
import json

current_directory = os.path.dirname(os.path.abspath(__file__))
bash_script_path = current_directory + "/getAllCommits.sh"
switch_script_path = current_directory + "/switchToBranchAndCommit.sh"
folder_path = current_directory + "/data/"

class gitWorker:
    json_data = {}
    
    def loadData(self):
        # Loop through all files in the folder
        for filename in os.listdir(folder_path):
            if filename.endswith(".json"):  # Check if the file is a JSON file
                file_path = os.path.join(folder_path, filename)
                with open(file_path, "r") as json_file:
                    try:
                        data = json.load(json_file)
                        self.json_data[filename.replace(".json","")] = data
                    except json.JSONDecodeError as e:
                        print(f"Error parsing JSON in {filename}: {e}")

        #with open(folder_path+"bigD.json", "w") as f:
        #    f.write(json.dumps(self.json_data, ensure_ascii=False))
            
        # Now, json_data contains JSON data with filenames as keys
        #for filename, data in self.json_data.items():
        #    print(f"Data from {filename}: {data}")

    def rebuildCommits(self):
        try:
            with open(os.devnull, 'w') as null_file:
                subprocess.run(["/bin/bash", bash_script_path], stdout=null_file, stderr=subprocess.STDOUT, check=True)
            #print("Bash script executed successfully with suppressed output.")
        except subprocess.CalledProcessError as e:
            print(f"Error running Bash script: {e}")
            
    def getCommitsByGitPath(self, path):
        return self.json_data[path.replace("/","_")]
    
    def getBranches(self):
        return self.json_data["all_branches"]
    
    @staticmethod
    def convertJsonToString(j):
        return json.dumps(j, indent=2)
    
    @staticmethod
    def sizeof_fmt(num, suffix="B"):
        for unit in ("", "Ki", "Mi", "Gi", "Ti", "Pi", "Ei", "Zi"):
            if abs(num) < 1024.0:
                return f"{num:3.1f}{unit}{suffix}"
            num /= 1024.0
        return f"{num:.1f}Yi{suffix}"
    
    @staticmethod
    def switchToBranchAndCommit(branch, commitHash):
        try:
            print(f"Branch is: {branch}")
            
            subprocess.run(["/bin/bash", switch_script_path, branch, commitHash], check=True)
            return True
        except subprocess.CalledProcessError as e:
            print(f"Error running Bash script: {e}")
            return False
            
    def __init__(self):
        # Avg for on run: 0.26405089194000086 seconds
        self.rebuildCommits()
        # Avg for on run: 0.005947719179994237 seconds
        self.loadData()
        
        

# import timeit

# def create_git_worker_object():
#     worker = gitWorker()

# runs = 50
# time_taken = timeit.timeit(create_git_worker_object, number=runs)
# average_time = time_taken / runs
# print(f"Time taken to create {runs} gitWorker objects: {time_taken} seconds")
# print(f"Avg for on run: {average_time} seconds")

#worker = gitWorker()
#print(gitWorker.sizeof_fmt(len(gitWorker.convertJsonToString(worker.getCommitsByGitPath("origin/dependabot/npm_and_yarn/y18n-3.2.2".replace("/","_"))))))