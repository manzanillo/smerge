from app import app, db
#import argparse
#from flask_migrate import Migrate

#parser = argparse.ArgumentParser(description='Controls the whole api server')
#parser.add_argument('--migrate', '-m', action='store_true', help='Migrate the database')

if __name__ == '__main__':
    #args = parser.parse_args()
    #if args.migrate:
    #    print('Verbose mode is enabled.')
    #    migrate = Migrate(app, db)
    #else:
    with app.app_context():  
        db.create_all()
        app.run(debug=True)