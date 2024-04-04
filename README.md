# SMERGE <img height=80px align="right" src="./snapmerge/static/icon/logo_norm.svg" />
Smerge is a basic version management system for the block-based programming language Snap!. It offers a simple user interface to manage a project and merge different branches with relative ease.

## History lesson
The project was first written purely with Django and due to access limitations could only merge different scripts via cartesian location. This worked well for a less interactive page in the beginning, but with new features the project part was migrated to a React frontend. Due to time constraints and simplicity, project creation and a few other static pages are still using django and the in conjunction Django templates as base.

The Docker "production" setup was therefore also only made with only a simple Django setup in mind, but with some hefty roundabout constraints due to the deployment on the TU Berlin servers and their restrictions. (This includes  [Dockerfile](/Dockerfile), [docker-compose.yml](/docker-compose.yml), [docker-compose.fub.yml](/docker-compose.fub.yml) and [entrypoint.sh](/entrypoint.sh))

The database was and still is an sqlite3 file (/snapmerge/database/db.sqlite3). Since the database is currently very small with low bandwidth, this works well. In the future this should probably be extended to a full blown database instance in the Docker setup (or separately).

## Basic Project Structure
### Django:
As mentioned above, the project currently uses Django as "static" page host and API. The API part is mostly contained in the "snapmerge/home/api" folder and uses Django Rest API as base. During production Django is not ran with its internal server anymore (`python manage.py runserver...`), instead it relies on Daphne, a separate asgi server for Django, designed to handle the whole communication process and Django instantiation.

The main configuration is located in the "snapmerge/home/config" folder and contains different settings for different launch situations. For example, settings_production.py disable debug and beta mode in addition to enforcing some security measures and changing the base URLs to the right server locations. For most of the configuration to work, some secrets need to be set in advance inside the "snapmerge/secrets" folder. More details in the the secret section below.

The home folder and "views.py" contain most of the logic for the Django part, the merger and API as mentioned above. The old merger is also contained in the "views.py" with more parts inside "ancestors.py" and "xmltools.py". These can still be accessed from the project page with switching the merge mode, but were not modified from the old state. The new merger is contained inside the directory "Merger_Two_ElectricBoogaloo". 

The basic premise of the old merger was to combine all scripts / blocks of a snap file with cartesian coordinates since they were the only "stable" part to differentiate each block. This approach works for basic combination but couldn't differentiate between moved and changed in addition to mishandling hidden xml parts like watcher and states. The new merger probably still mishandles some states changed internally by Snap!, but hopefully less then the old one :D. We added an activation step between the user opening Snap! and their program. Since js activation inside Snap! was mandatory from the beginning, we extended this part and added the mentioned step there. When a user opens a project node, a dummy is loaded with a single button that in turn loads the real file after js was activated and the button pressed. In the same step we have overwritten the serialize and deserialize logic of Django to enable an extra value inside the xml tags. This "customData" value is in turn filled with a uuid4 when the file is posted back to the server. With this addition, the new merger can differentiate most cases better then a simple x / y comparison. (Be careful since Snap! can and will delete script nodes from time to time internally, resulting in a loss of uuid... pre / post pass might be necessary in the future.)The merger itself steps structured through the given xml files, determines the node type and then uses a specific merger for each case. More information can be found inside the merger comments. This approach is longer than a generalized merger but at least a bit easier to understand, extend and workable.

If you want to set a message of the day on the main page, use the admin panel of Django and change the bool and text inside the settings table. The admin panel can be reached by the default / admin route of Django or by hovering the mouse in the bottom left corner of the Smerge homepage and then pressing the appearing shield icon while holding ctrl + shift + alt combined.

### Secrets:
The secrets folder is excluded from git for the most part, to remove a potential leak of secret information like the Django key or certificates. The basic structure can be seen in the index and more information on the creation of each part can be found in the setup step. Since most of these steps have an abundance of tutorials online, only general guidance was written down.

### React extension
The react extension currently holds the main project view panel and the conflict stepper. Most parts are the same as the old view, just more *reactive* :P. The graph is still created using cytoscape, just in a TypeScript wrapper package. The sync was changed to a server sent event approach (instead of websocket) and should be extendable by changing the "consumer.py" logic. The language package of the React app is i18next and currently separate from the Django translation parts due to some format inconsistencies of Django.

The conflict stepper is reached on a merge conflict and lists each problem in a separate step.


### Access Portal:
#### React:

#### Flask:
A quick list of what the flask server does:
- Runs with an sqlite3 db to manage users and settings
- exposes the API for the React frontend to manage user / ip access and some (git) commands
- in the background, the server will use the copied .git directory and keep the repo on your wanted state
- a webhook endpoint at `https://<your-domain>/acapi/git` exists, that can be added to github to enable the server to auto reload (run fetch) if a new commit happened in the repo to update the selection list
- the selection list for all branches with all commits is built during runtime by the gitworker and updated with the hook if connected and enables the frontend to display all commits / branches




# Setup
Each setup kind of the project has a few differences, but overall a lot of similar steps are involved. We would advise to use Linux or Mac as the development environment since Windows can get a bit complicated, with wsl as a probable must have for the project to build under it.

In addition, look through some of the settings files used in the following and change local paths or URLs to yours. Local paths should hopefully not be used anymore but we have surely missed some. Inside the Django setting you definitely have to add your domains to the allowed addresses and co. to be able to use it.

## Local
To run Smerge and all parts on your local machine, first make sure python3 is on your system and install all Django requirements contained in the requirements.txt inside the main folder. (The use of conda or venv make your life a lot easier during development for this step...).
Next you need to have node.js (we had v18.13.0) installed on your system and install all npm modules for django. This can also be done with the package.json inside the main folder.

```sh
# inside ./
pip install -r requirements.txt

npm install
```

Since npm should already work in this step, also install all npm modules for the React part of the project. They are contained inside the *react_extension* 📁.

```sh
# inside ./react_extension also run
npm install
```

After this, make sure you have the right folder structure and files inside the *secrets* 📁, like listed in the index. For this, rename the sample.secrets.json to secrets.smerge.json and fill in the needed values. *SECRET_KEY* can be every string you want, and django even has a built-in utility to create one.

```sh
python ./snapmerge/manage.py shell -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())" --settings=config.settings_local
```

For the *EMAIL_HOST_PASSWORD* and *EMAIL_API_KEY*, you need to set up a mail relay yourself or use a mail relay service like Mailjet. The production server has its own relay and therefore this approach was taken in the beginning. If you don't want to use the mail relay but would still like to test a feature with sending mails, you can change Django's mail behavior to print the mail into the console by changing the settings file you are using.

The *rasp_certs* folder should contain a public and private key for your nginx server. The keys from there are only used inside the docker container.

## NGINX
To handle communication / security and routing between all parts, the project uses a nginx server as proxy. The simplest way for local development is a basic install of a nginx server and then configuring it with one of the given config files inside the *data* 📁.

The `./data/nginx_access/ext_nginx.conf` config works as configuration for the project alone or with the access portal. If you want to ignore the access portal, comment the /access/ and /acapi/ routes out. Also make sure to create the file `/etc/nginx/allowed_ips.conf` otherwise the nginx config won't work. This is due to the mechanism the access portal uses to restrict ips. This can also be disabled by commenting out the parts in the config that include the file (which is a simple block / allow list managed by the access portal).


/home/rs-kubuntu/Desktop/Smerge-Private/data/nginx_access/ext_nginx.conf
.......


## Django
The Django part can be started via the makefile and `make run` or if you want a different settings file, you can use the direct command `python ./snapmerge/manage.py runserver --setting=config.settings_local`. Make sure to run the command from inside the top folder (where all compose and the makefile reside), since django currently still needs the node dependencies installed before and can only find them if the launch folder is in the top and not in the snapmerge directory. (If everything is converted to react, the needed packages could be removed).


## React
In theory you could use the `launch.sh` file in the top directory to start both Django and the Vite server in the same terminal, but if you want to launch them separate, just navigate to the react folder (`./react_extension`) and run the command `npx vite`. This will start the vite def server and handles all reload or serving during development (don't use in prod!).

Currently only the main project page and the conflict stepper are converted to the react app, but the rest should portable with relative easy if needed. (Would reduce routing complexity by a bit... unfortunately time was not on our side :D)


## Access Portal
The access portal was created as a wrapper for the django instance in the beginning to test a public available Smerge version, but restrict the access to only verified user without changing the core django project. From there it evolved from simple nginx ip allow list to a test server with "git" integration-ish features. If you have no problem with exposing a test server like a raspberry pi from your local network your can just ignore the extra wrapper, but we had significant spam problems from middle eastern and asian bots trying to find vulnerabilities in our open server and therefore wanted some extra protection without each of our team needing access to physical server itself. Of cause deployment and commit updates could be handled with github action, but our local situation and repo uncertainties brought us to this approach.

The portal itself is built in two parts, once a simple flask api server and then a react app built with vite.

### React
For the react part you need to install the npm packages once again inside the react folder (`./Access_Portal/access_portal`) and then you can start it via `npx vite`.

### Flask
The api uses a flask server (more or less a smaller version of django for all api needs). Install all packages inside the requirements.txt from the access portal folder (`./Access_Portal/Web_Api`) and then start with `python run.py` or the launch.sh file inside the access portal folder to start both flask and react in one command.




## Docker (Prod)
For a production ready version of smerge we need to change a few things. First the django dev. server should not be used in an open setting, since it has a some possible vulnerabilities and performance problems. Therefore the django part of the app will be started with daphne (a for django specialized async gateway server). In addition another settings file is needed to disable more django specific settings. Next the react app will no longer run in dev mode on the vite server, instead it needs to be compiled and then the static files are served via nginx. In theory the main nginx proxy server can be set up to handle everything, but for some local reasons (a protesting raspberry pi...), this part is split into a separate lightweight nginx container. With this, the prod compose can simply start the different container and all should work. Make sure to compile the react app with vite before you build the container (`npx vite build`), otherwise it won't be able to build (or has an old version...).


## Docker (Access Portal)
The access server container can "simply" be build and started with docker-compose and the `docker-compose-access.yml` file. For the container to be able to build properly, a view steps need to be taken. 
- First disable any local nginx server running on port 80 / 443 of the target machine, since the access portal container has its own for routing and ip blocking. (Optionally change ports and use another proxy server to point at the right container if needed.)
- Then make sure all needed files exit inside the secrets folder. These are the ssl certificate (public / private) for your domain (make sure to change your needed domain inside the nginx config...). We would advice to use some tools like certbot to get the certificates if you want a public accessible server, or create a self signed pair. In addition you need a set of ssh public and private keys. They are used by the server to authenticate against github (make sure to enter this public key in your repo, otherwise switching commit / branch won't work).
- After the container is running, you should be able to open the access portal login under `https://<your-domain>/access/login` and register a user. To verify the first user / admin, open a terminal inside the access portal container and run the python file `/app/Access_Portal/Web_Api/activateUser.py --name <name> -a`. This will activate your created user and make him admin. Each next verify can be made inside the access portal in the admin panel by applicable user.

After these steps the server should be running in dev mode. This means each file change will trigger a hot reload in django / flask (for the access portal) and therefore enable a quick change via the interface of the current commit, the access portal container is running on.

If the ssh key is not registered in github, the container won't be able to execute git functions and therefore run into an error if you still try to change the current commit.


# Index
Rough list of project files with short descriptors as direction guide. Files not listed, should be artefact or not important for the current iteration anymore (, for the most part :D).

<details>
<summary><span style="font-weight: 900;">Django:</summary>
<br>

| File / Folder | Short description |
| ---------- | ----------------- |
| 📁 snapmerge | Base folder for the Django project |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 config | Mostly config root |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 asgi.py | Setup for the asgi server (needed step and "routing" for the SSE in the sync) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 Custom...ware.py | Inserts ids as object for the SSE part |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 settings_*.py | Configs for different launch settings |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 urls.py | Top level Django url pattern file |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 wsgi*.py | Artefact from old connection handling |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 database | Contains sqlite3 db file (only exists after first run...) |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 home | Main Django and merger logic |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 admin.py | Extra table definitions for admin panel |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 ancestors.py | Used by old merger to determine ancestors in segments |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 apps.py | Django app definition for the snapmerge project |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 consumers.py | Endpoint for Server Sent Event setup and messaging |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 forms.py | Django form definitions |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 models.py | Django db entry (table) definitions (Only update db with this as base and then run the django migration commands) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 routing.py | Artefact from old sync try with websockets |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 urls.py | Url path definitions for most app endpoints |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 views.py | All app endpoints connected to the paths from urls |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 xmltools.py | old merger utility (still used for sync button injection) |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 media | Contains all static user uploaded / created snap files and merge conflict files |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 static | Contains js, css and more static page related files for django |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 templates | Contains template bases for all used Django pages |
| &nbsp;&nbsp;&nbsp;&nbsp;📄 manage.py | Entry and management point of django app |
</details>

<br>

<details>
<summary><span style="font-weight: 900;">React:</summary>
<br>

| File / Folder | Short description |
| ---------- | ----------------- |
| 📁 react_extension | Contains the frontend code for the react extension (vite) |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 public | Contains public accessible files like language or images |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 csnap | Copy of snap for diff view (lower strain on snaps onw server) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 img | Contain the help menu resources |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 locales | Contain the language files, used by i18next |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 src | Contains all react (typescript) components (very bad sorted :P) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 csnap | Copy of snap for diff view (lower strain on snaps onw server) |
| &nbsp;&nbsp;&nbsp;&nbsp;📄 index.html | Base and entry point for the react app |
| &nbsp;&nbsp;&nbsp;&nbsp;📄 package.json | Contains list of all needed node packages |
| &nbsp;&nbsp;&nbsp;&nbsp;📄 tsconfig.json | linter and compile configs |
| &nbsp;&nbsp;&nbsp;&nbsp;📄 vite.config.ts | vite config |
</details>

<br>

<details>
<summary><span style="font-weight: 900;">Access Portal:</summary>
<br>

| File / Folder | Short description |
| ---------- | ----------------- |
| 📁 ... | ... |
| &nbsp;&nbsp;&nbsp;&nbsp;📄 ... | ... |
</details>

<br>

<details>
<summary><span style="font-weight: 900;">Secrets:</summary>
<br>

| File / Folder | Short description |
| ---------- | ----------------- |
| 📁 secrets | Top level folder |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 rasp_certs | Contains ssl certificates for the public nginx server (mostly for docker) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 fullchain.pem | Public ssl key for nginx |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 privkey.pem | Private ssl key for nginx |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 rasp_ssh | Contains ssh certificate stuff for the Access Portal |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 id_rsa | Private key connected to the public (store only inside the container) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 id_rsa.pub | Ssh public key (needs to be added to your github repo) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 known_hosts | Current github public keys for a github webhook with the Access Portal |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 smerge | Contains secret json |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 secrets.smerge.json | Contains important django config parts like sec.key, email host pw and email api key |
</details>

<br>

<details>
<summary><span style="font-weight: 900;">Toplevel:</summary>
<br>

| File / Folder | Short description |
| ---------- | ----------------- |
| 📁 data | multiple nginx configs (old and new) |
| 📄 docker-compose-access.yml | Compose file for the Access Portal |
| 📄 docker-compose-local-nginx.yml | Compose for a local nginx router |
| 📄 docker-compose-mail-dummy.yml | Used for mail relay activation (for us mailjet) |
| 📄 docker-compose-prod.yml | New production setup (make sure to compile React before build) |
| 📄 docker-compose.fub.yml | Old Berlin setup |
| 📄 docker-compose.yml | Old local docker build |
| 📄 ... | ...|
</details>



<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>


## Test Infrastructure
The main focus of the test infrastructure is the merger algorithm as it is the core of Smerge.  

For the merger, the tests are based on reference files.  
This means that the Snap! files to be tested with are stored within the Smerge git repository.  
In particular, the files are stored under:
```
snapmerge -> test -> snapfiles
```

### Merging Test Case Generation
For convenience, there exists a small convention-based test framework for generating tests that test, whether a conflict should be raised or not when two files get merged.

In order to generate new test cases files can be added either to the ```collisions``` or the ```no_collisions``` folder.  
For each merging test, 'two' files must be placed into those folders.
If a collision is the expected outcome of merging the two files they must be placed into the ```collisions``` folder. Otherwise, in the ```no_collisions``` folder. 

The files must adhere to the following naming convention: 
```
prefix_<ignored>_suffix.xml
```
The files get matched by their prefix, i.e. the prefix must be the same for the files to be merged together for the test.  
As a best practice, the prefix should be a description of what is to be tested.
The suffix can be anything.  
For example, it can extend the description of the particular test with individual information of the file, or it can be just a number. 
It is important to separate the prefix from the suffix with a "_". Otherwise, the matching can not be successfully executed.

If you have multiple test that rely on the same input for one half, you can reduce the number of files by a base matcher. If for example more than two files with the same prefix are found, the tests will search for a base file with the suffix "_0". If it is found, test cases will be generated with each other file and the base case.

As example these input xml files ["test_0", "test_1", "test_2", "other_1", "other_2"] result in these test combinations -> [("test_0", "test_1"), ("test_0", "test_2"), ("other_1", "other_2")].

In addition if you want to test for a specific conflict type you expect, you can add a type to the name, that the generator uses to match against. Add one of the following into the `<ignored>` section of the filename (at least in one of both files, if both files have different types, the conflict will test against the first found in the list):
- "type_image" -> `ConflictTypes.IMAGE`
- "type_element" -> `ConflictTypes.ELEMENT`
- "type_text" -> `ConflictTypes.TEXT`
- "type_customBlock" -> `ConflictTypes.CUSTOMBLOCK`
- "type_watcher" -> `ConflictTypes.WATCHER`
- "type_audio" -> `ConflictTypes.AUDIO`



### Other Reference File Based Tests
It is recommended to store all files involved in the merger test into the ```snapfiles``` folder.  
They can either be stored directly into the folder itself or into subfolders for clarity.  

As these tests cannot be auto-generated, the tests need to be implemented manually. It is recommended to implement the tests directly into the folder with the implementation to be tested, following the django naming scheme for test files.   


## Password Reset Token Invalidation
In order to reset passwords Smerge uses a token-based password reset mechanism.  
After their usage, the tokens get deleted from the database automatically and therefore, they get invalidated.  
For unused tokens, it may be desired to invalidate them from time to time.  
This may prevent abuse of the tokens.  

By default, Smerge runs a task after starting the server that invalidates old unused password reset tokens.
Every day, the task gets rescheduled.   
The task deletes all password reset tokens that are older than one week.  

The default task can be disabled by setting the following in the django settings:  
```DISABLE_TOKEN_INVALIDATION = True```


If you have disabled the automatically scheduled invalidation task within django you can still invalidate tokens via a django management command.  
The same command gets executed for the scheduled task. 
 
For more information execute:  
```python snapmerge/manage.py  resettokencleanup --h --settings=config.settings_local```


## Good to know:
### XMLBlocker / Post Block
Since snap already needs js to be activated for the post back button to work, we decided to implement a blocker step to force a user in activating js before the real project file is even loaded. During this step snaps serializer and deserializer functions get modified to allow the new customData attribute, currently used for uuids. In addition the post back button also reloads the file inside snap with the request return link, to update all uuids inside a running snap instance.

Both xmlBlocker js and the post back button js are watched by django for changes and rebuild the xml part for the snap file on start of django or on a hot reload trigger. Therefore if you want to change these code parts, just edit the js files inside `./snapmerge/static/snap/` while django is running.

To add more files apart from python files to the django auto watch, register them inside the `app.py` files `extra_reload_files` list and add a builder if needed to the `ready` function.


--------------

--------------

# Old Readme
# TMP - README...
This is a private "fork" of [smerge](https://github.com/manzanillo/smerge) and used to develope the application further on a local basis.

# smerge

Smerge is a merge tool for school environments and Snap!. It is based on a lot of open source projects including cytoscape.js or Django. It is intended to be simple, beautiful, fast, and easy to use in school environments. A live demo can be found at [smerge.org](https://smerge.org)

# Install

You will need pip and Python 3 for installing smerge on your server.
We recommend using a virtualenv and npm for local deployment. Activate your virtualenv and use

## With docker

To deploy smerge via docker you may use the docker-compose.yml file and run:

```
docker-compose build
docker-compose up
```

Sometimes it might be necessary to run `docker exec -it smerge_server bash` and then run `make migrate`.

For the official version on our FU server, use

```
docker-compose -f docker-compose.fub.yml build
```

## Without docker

```
# remove all pip installs
# only for reinstall
# pip freeze | xargs pip uninstall -y

pip install -r requirements.txt
npm install
```

and then the command

```
make run
```

In case, you have unapplied migrations, first run:

```
make migrate
```

We recommend to test the system using a redis docker. Redis is used for handling all websocket related actions:

```
docker run -p 6379:6379 --name some-redis -d redis
```

# Contributing

Thank you for considering contributing to smerge! It's as easy as creating a pull request.

# License

smerge itself is licenced under the MIT license. Licence for third-party libraries may differ and those licences apply in those cases.

# etc.

To import initial data use:
manage.py loaddata snapmerge/fixtures/initial_data.json
