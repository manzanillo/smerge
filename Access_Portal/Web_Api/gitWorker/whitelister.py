import sqlite3
from datetime import datetime

# from app.models import UnlockedIps

class whiteLister:
    def generateWhitelist():
        print("hello")
        # # Define the output file name
        # output_file = "/home/rs-kubuntu/Desktop/Smerge-Private/Access_Portal/Web_Api/gitWorker/active_ips.txt"

        # # Get the current date and time
        # current_datetime = datetime.utcnow()

        # try:
        #     # Query the database for active IP addresses using the UnlockedIps model
        #     active_ips = UnlockedIps.query.filter(UnlockedIps.expire_date > current_datetime).all()
        #     # Write the active IP addresses to the output file
        #     with open(output_file, "w") as file:
        #         if active_ips:
        #             for ip_entry in active_ips:
        #                 file.write(f"allow {ip_entry.ip_address};\n")
        #         else:
        #             print("No active IP addresses found in the database.")
        #         file.write("deny all;")
        # except Exception as e:
        #     print(e)
        #     return e