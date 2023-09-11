# Access Portal API
This is a small Flask app, designed to handle all backend tasks for the Access Portal. This includes user registration, access management and git tasks, like updating the cache of commits and handling the version of the main webservice.

## Install
create a conda environment named access_portal_api and install pip / then the requirements for the Flask app.

## Run
To start the backend, enter:
```sh
python run.py
```
This will start the server and serve all needed requests.

To activate from the server side, enter:
```sh
python activateUser.py -n "name" [-a]
```
The optional flag a makes the user also a admin.


## During development
Activate conda environment again
```sh
conda activate access_portal_api
```

## Good to know
All data is stored in a local sqlite under /instance/local.sqlite3. This can be changed inside the config.py file.

In addition it is advised to change the secret key inside the config.