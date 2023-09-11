import argparse
import sqlite3
from flask_migrate import Migrate

parser = argparse.ArgumentParser(description='Controls the whole api server')
parser.add_argument('--name', '-n', type=str, help='Activates the user with the given name.')
parser.add_argument('--admin', '-a', action='store_true', help='Make user also admin.')

con = sqlite3.connect("instance/local.sqlite3")
cur = con.cursor()

def update_user(username, column, value):
    cur.execute(f"UPDATE user set {column} = '{value}' where username='{username}'")
    con.commit()

if __name__ == '__main__':
    args = parser.parse_args()
    if args.name:
        update_user(args.name, "activated", 1)
        if args.admin:
            update_user(args.name, "isAdmin", 1)
        print(f'Activated user: {args.name}')
        
        
    cur.close()