from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from config import Config
from gitWorker.gitWorker import gitWorker
from gitWorker.whitelister import whiteLister
from apscheduler.schedulers.background import BackgroundScheduler
import os
import subprocess
from datetime import datetime, timezone


app = Flask(__name__)
app.config.from_object(Config)


cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

app.config['LAST_START'] = datetime.now(timezone.utc).isoformat()

gW = gitWorker()

db = SQLAlchemy(app)
    
def generateWhitelist(forceNginxReload: bool = False):
    from datetime import datetime
    from app.models import UnlockedIps
    from app.SettingsRepository import getSettingIpLock
    
    with app.app_context():
            # Define the output file name
        output_file = "/etc/nginx/allowed_ips.conf"# = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/gitWorker/active_ips.txt"

        # Get the current date and time
        current_datetime = datetime.utcnow()

        try:
            # Query the database for active IP addresses using the UnlockedIps model
            active_ips = UnlockedIps.query.filter(UnlockedIps.expire_date > current_datetime).all()
            active_ips_set = list(set([ip_entry.ip_address for ip_entry in active_ips]))
        
            with open(output_file, "r") as f:
                orig_len = len(f.readlines())
                
            # only change if something needs to change
            if(len(active_ips_set) == 0 and orig_len == 1 and not forceNginxReload): return
            
            # Write the active IP addresses to the output file
            with open(output_file, "w") as file:
                if active_ips_set:
                    for ip_entry in active_ips_set:
                        file.write(f"allow {ip_entry};\n")
                if(getSettingIpLock()):
                    file.write("deny all;")
                else:
                    file.write("allow all;")
                    
            # restart nginx if file updated
            if(orig_len != (len(active_ips_set)) + 1 or forceNginxReload):
                restartNginx()
                
                
        except Exception as e:
            return e
        
# check if running in access portal and restart corresponding
def restartNginx():
    # since docker directory starts with /app, the first (second...) entry should be "app"
    if(__file__.__str__().split("/")[1] == "app"):
        subprocess.run(["nginx", "-s", "reload"])
    else:
        # to make reload callable with sudo rights from python, enter "sudo visudo" 
        # and add "ALL ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx" before "@includedir /etc/sudoers.d" at the end
        output = subprocess.check_output("sudo systemctl reload nginx", shell=True, stderr=subprocess.STDOUT)


scheduler = BackgroundScheduler()

# Configure the scheduler to use the Flask app's context
scheduler.start()
# fires twice, no idea why... but still works...
scheduler.add_job(func=generateWhitelist, trigger="cron", minute="*")#"*")


from app import routes