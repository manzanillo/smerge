from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
from config import Config
from gitWorker.gitWorker import gitWorker
from gitWorker.whitelister import whiteLister
from apscheduler.schedulers.background import BackgroundScheduler


app = Flask(__name__)
app.config.from_object(Config)


cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

gW = gitWorker()

db = SQLAlchemy(app)
    
def generateWhitelist():
    from datetime import datetime
    from app.models import UnlockedIps
    
    with app.app_context():
            # Define the output file name
        output_file = os.path.dirname(os.path.abspath(__file__)) + "/gitWorker/active_ips.txt"

        # Get the current date and time
        current_datetime = datetime.utcnow()

        try:
            # Query the database for active IP addresses using the UnlockedIps model
            active_ips = UnlockedIps.query.filter(UnlockedIps.expire_date > current_datetime).all()
            # Write the active IP addresses to the output file
            with open(output_file, "w") as file:
                if active_ips:
                    for ip_entry in active_ips:
                        file.write(f"allow {ip_entry.ip_address};\n")
                file.write("deny all;")
        except Exception as e:
            print(e)
            return e


scheduler = BackgroundScheduler()

# Configure the scheduler to use the Flask app's context
scheduler.start()
# fires twice, no idea why... but still works...
scheduler.add_job(func=generateWhitelist, trigger="cron", minute="*")#"*")


from app import routes