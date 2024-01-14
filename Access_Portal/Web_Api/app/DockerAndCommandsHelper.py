import re
import subprocess
import threading
import time

# if name of the docker container is changed in the compose file, update!!!
def getDockerName():
    output = subprocess.check_output(f'{"" if (__file__.__str__().split("/")[1] == "app") else "sudo "}docker ps -a', shell=True, stderr=subprocess.STDOUT, encoding="UTF-8").split("\n")
    output = [re.sub(' +', ' ', x) for x in output if x != ""]
    if (len(output) >= 2):
        nameIndex = getNameIndex(output[0])
        output = [x.split(" ") for x in output]
        for i in range(1, len(output)-1):
            if "smerge_server_access" in output[i][nameIndex]:
                return output[i][nameIndex]
        return ""
    return ""

def getNameIndex(li):
    for i,l in enumerate(li):
        if "NAMES" in l.upper():
            return i
    return -1

def restartDockerContainer(name):
    def command():
        time.sleep(1)  # Wait for 1 second
        cmd = [x for x in ["" if (__file__.__str__().split("/")[1] == "app") else "sudo ", "docker", "restart", name] if x != ""]
        subprocess.run(cmd)

    thread = threading.Thread(target=command)
    thread.start()
    
def runCommand(commandName):
    absolutePathParts = __file__.__str__().split("/")
    headPath = ""
    for i in range(0,len(absolutePathParts)-4):
        headPath += f"{absolutePathParts[i]}/"
    
    restartNeeded = False
    output = ""
    try:
        match (commandName):
            case ("restart"):
                restartNeeded = True
            case ("npx_i_a"):
                restartNeeded = True
                output = subprocess.check_output("npm install", cwd=headPath+"Access_Portal/access_portal", shell=True, stderr=subprocess.STDOUT, encoding="UTF-8")
            case ("npx_i_r"):
                restartNeeded = True
                output = subprocess.check_output("npm install", cwd=headPath+"react_extension", shell=True, stderr=subprocess.STDOUT, encoding="UTF-8")
            case ("npx_i_s"):
                restartNeeded = True
                output = subprocess.check_output("npm install", cwd=headPath, shell=True, stderr=subprocess.STDOUT, encoding="UTF-8")
            case ("pip_i_a"):
                restartNeeded = True
                output = subprocess.check_output("pip install -r requirements.txt", cwd=headPath+"Access_Portal/Web_Api", shell=True, stderr=subprocess.STDOUT, encoding="UTF-8")
            case ("pip_i_s"):
                restartNeeded = True
                output = subprocess.check_output("pip install -r requirements.txt", cwd=headPath, shell=True, stderr=subprocess.STDOUT, encoding="UTF-8")
            case ("migrate_s"):
                restartNeeded = True
                output = subprocess.check_output("python ./snapmerge/manage.py migrate --settings=config.settings_local", cwd=headPath, shell=True, stderr=subprocess.STDOUT, encoding="UTF-8")
            case (_):
                print(f"How could this be reached? (CommandName: '{commandName}')")
    except subprocess.CalledProcessError as e:
        output = e.output
    
    if(restartNeeded):
        name = getDockerName()
        restartDockerContainer(name)
        
    return output
    
def validateCommandName(commandName):
    return commandName in ["restart","npx_i_a", "npx_i_r", "npx_i_s", "pip_i_a", "pip_i_s","migrate_s"]

