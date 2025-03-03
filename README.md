# SMERGE <img height=80px align="right" src="./snapmerge/static/icon/logo_norm.svg" />
Smerge is a basic version management system for the block-based programming language Snap!. It offers a simple user interface to manage a project and merge different branches with relative ease.

It is based on a lot of open source projects including cytoscape.js and Django. It is intended to be simple, beautiful, fast, and easy to use in school environments. A live demo can be found at [smerge.org](https://smerge.org)

## History lesson
The project was first written purely with Django and due to access limitations could only merge different scripts via cartesian location. This worked well for a less interactive page in the beginning, but with new features the project part was migrated to a React frontend. Due to time constraints and simplicity reasons, project creation and a few other static pages are still using Django and Django templates as base.

The Docker "production" setup was therefore also made with only a simple Django setup in mind, but with some hefty roundabout constraints due to the deployment on the FU Berlin servers and their restrictions. (This includes  [Dockerfile](/Dockerfile), [docker-compose.yml](/docker-compose.yml), [docker-compose.fub.yml](/docker-compose.fub.yml) and [entrypoint.sh](/entrypoint.sh))

The database was and still is an sqlite3 file (/snapmerge/database/db.sqlite3). Since the database is currently very small with low bandwidth, this works well. In the future this should probably be extended to a full blown database instance in the Docker setup (or separately).

## Basic Project Structure
### Django:
As mentioned above, the project currently uses Django as "static" page host and API. The API part is mostly contained in the "snapmerge/home/api" folder and uses Django Rest API as base. During production Django is not ran with its internal server anymore (`python manage.py runserver...`); instead it relies on Daphne, a separate asgi server for Django, designed to handle the whole communication process and Django instantiation.

The main configuration is located in the "snapmerge/home/config" folder and contains different settings for different launch situations. For example, settings_production.py disable debug and beta mode in addition to enforcing some security measures and changing the base URLs to the correct server locations. For most of the configuration to work, some secrets need to be set in advance inside the "snapmerge/secrets" folder. More details in the the secret section below.

The home folder and "views.py" contain most of the logic for the Django part, the merger and API as mentioned above. The old merger is also contained in the "views.py" with more parts inside "ancestors.py" and "xmltools.py". These can still be accessed from the project page by switching the merge mode, but were not modified from the old state. The new merger is contained inside the directory "Merger_Two_ElectricBoogaloo".

The basic premise of the old merger was to combine all scripts / blocks of a Snap! file with cartesian coordinates since they were the only "stable" part to differentiate each block. This approach works for basic combinations but couldn't differentiate between moved and changed parts, in addition to mishandling hidden XML parts like watcher and states. The new merger probably still mishandles some states changed internally by Snap!, but hopefully less then the old one :D. We also added an activation step between the user opening Snap! and their program. Since JS activation inside Snap! was mandatory from the beginning, we extended this part and added the mentioned step there.

When a user opens a project node, a dummy is loaded with a single button that in turn loads the real file after JS was activated and the button pressed. In the same step we have overwritten the serialize and deserialize logic of Django to enable an extra value inside the XML tags. This "customData" value is in turn filled with a uuid4 when the file is posted back to the server. With this addition, the new merger can differentiate most cases better then a simple x / y comparison. (Be careful since Snap! can and will delete script nodes from time to time internally, resulting in a loss of uuid... pre / post pass might be necessary in the future.) The merger itself steps structured through the given XML files, determines the node type and then uses a specific merger for each case. More information can be found inside the merger comments. This approach is longer than a generalized merger but at least a bit easier to understand, extend and is better workable.

If you want to set a message of the day on the main page, use the admin panel of Django and change the bool and text inside the settings table. The admin panel can be reached by the default / admin route of Django or by hovering the mouse in the bottom left corner of the Smerge homepage and then pressing the appearing shield icon (after 10 seconds) while holding ctrl + shift + alt combined.

### Secrets:
The secrets folder is excluded from git for the most part to remove a potential leak of secret information like the public Django key or certificates. The basic structure can be seen in the index and more information on the creation of each part can be found in the setup step. Since most of these steps have an abundance of tutorials online, only general guidance was written down.

### React extension
The React extension currently holds the main project view panel and the conflict stepper. Most parts are the same as the old view, just more *reactive* :P. The graph is still created using cytoscape, just in a TypeScript wrapper package. The sync was changed to a server sent event approach (instead of websocket) and should be extendable by changing the "consumer.py" logic. The language package of the React app is i18next and currently separate from the Django translation parts due to some format inconsistencies of Django.

The conflict stepper is reached on a merge conflict and lists each problem in a separate step.


### Access Portal:
#### Flask:
A quick list of what the Flask server does:
- Runs with an sqlite3 DB to manage users and settings
- exposes the API for the React frontend to manage user / ip access and some (git) commands
- in the background, the server will use the copied .git directory and keep the repo on your wanted state
- a webhook endpoint at `https://<your-domain>/acapi/git` exists, that can be added to github to enable the server to auto reload (run fetch) if a new commit happened in the repo to update the selection list
- the selection list for all branches with all commits is built during runtime by the gitworker and updated with the hook if connected and enables the frontend to display all commits / branches



# Setup
Each setup kind of the project has a few differences, but overall a lot of similar steps are involved. We would advise to use Linux or Mac as the development environment since Windows can get a bit complicated, with wsl as a probable must have for the project to build under it.

In addition, look through some of the settings files used in the following and change local paths or URLs to yours. Local paths should hopefully not be used anymore but we have surely missed some. Inside the Django settings you definitely have to add your domains to the allowed addresses and co. to be able to use it.

## Local
To run Smerge and all parts on your local machine, first make sure python3 is on your system and install all Django requirements contained in the requirements.txt inside the main folder. (The use of conda or venv make your life a lot easier during development for this step...).
Next, you need to have node.js (we have v18.13.0 and v20.12.1 tested) installed on your system and install all npm modules for Django. This can also be done with the package.json inside the main folder.

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

After this, make sure you have the right folder structure and files inside the *secrets* 📁, like listed in the index. For this, rename the sample.secrets.json to secrets.smerge.json and fill in the needed values. *SECRET_KEY* can be any string you want, and Django even has a built-in utility to create one.

```sh
python ./snapmerge/manage.py shell -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())" --settings=config.settings_local
```

For the *EMAIL_HOST_PASSWORD* and *EMAIL_API_KEY*, you need to set up a mail relay yourself or use a mail relay service like Mailjet. The production server has its own relay and therefore this approach was taken in the beginning. If you don't want to use the mail relay but would still like to test a feature that sends mails, you can change Django's mail behavior to print the mail into the console by changing the settings file you are using.

The *rasp_certs* folder should contain a public and private key for your Nginx server. The keys from there are only used inside the Docker container.

## NGINX
To handle communication / security and routing between all parts, the project uses an Nginx server as proxy. The simplest way for local development is a basic install of an Nginx server and then configuring it with one of the given config files inside the *data* 📁.

The `./data/nginx_access/ext_nginx.conf` config works as configuration for the project alone or with the Access Portal. If you want to ignore the Access Portal, comment the /access/ and /acapi/ routes out. Also make sure to create the file `/etc/nginx/allowed_ips.conf` otherwise the Nginx config won't work. This is due to the mechanism the Access Portal uses to restrict IPs. This can also be disabled by commenting out the parts in the config that include the file (which is a simple block / allow list managed by the Access Portal).


## Django
The Django part can be started via the makefile and `make run` or if you want a different settings file, you can use the direct command `python ./snapmerge/manage.py runserver --setting=config.settings_local`. Make sure to run the command from inside the top folder (where all compose and the makefile reside), since Django currently still needs the node dependencies we installed before and can only find them if the launch folder is in the top and not in the snapmerge directory. (If everything is converted to React, the needed packages could be removed).


## React
In theory you could use the `launch.sh` file in the top directory to start both Django and the Vite server in the same terminal, but if you want to launch them separately, just navigate to the React folder (`./react_extension`) and run the command `npx vite`. This will start the Vite dev server and handle all reload or serving during development (don't use in prod!).

Currently only the main project page and the conflict stepper are converted to the React app, but the rest should be portable with relative ease if needed. (Would reduce routing complexity by a bit... unfortunately time was not on our side :D)


## Access Portal
The Access Portal was created as a wrapper for the Django instance in the beginning to test a public available Smerge version, but restrict the access to only verified users without changing the core Django project. From there it evolved from simple Nginx IP allow list to a test server with "git" integration-ish features. If you have no problem with exposing a test server like a Raspberry Pi from your local network your can just ignore the extra wrapper, but we had significant spam problems from Middle Eastern and Asian bots trying to find vulnerabilities in our open server and therefore wanted some extra protection without each of our team needing access to the physical server itself. Of course, deployment and commit updates could be handled with github action, but our local situation and repo uncertainties brought us to this approach.

The portal itself is built in two parts, once a simple Flask api server and then a React app built with Vite.

### React
For the React part you need to once again install the npm packages inside the react folder (`./Access_Portal/access_portal`) and then you can start it via `npx vite`.

### Flask
The API uses a Flask server (more or less a smaller version of Django for all API needs). Install all packages inside the requirements.txt from the Access Portal folder (`./Access_Portal/Web_Api`) and then start with `python run.py` or the launch.sh file inside the Access Portal folder to start both Flask and React in one command.




## Docker (Prod)
For a production ready version of Smerge we need to change a few things. First, the Django dev. server should not be used in an open setting, since it has some possible vulnerabilities and performance problems. Therefore, the Django part of the app will be started with Daphne (a specialized async gateway server for Django). In addition, another settings file is needed to disable more Django-specific settings. Next, the React app will no longer run in dev mode on the Vite server, instead it needs to be compiled and then the static files are served via Nginx. In theory, the main Nginx proxy server can be set up to handle everything, but for some local reasons (a protesting Raspberry Pi...), this part was split into separate lightweight Nginx containers.

It is advised to use only docker-compose for container since it makes it easier to include the `/media` and `/database` folders as volumes to make all data persistent.

### Lets Encrypt
If you have a public DNS available (for example using a local Raspberry Pi and then DuckDNS), you are able to use Let's Encrypt and Certbot to get a certificate for your server. The production container and the rest will both need one and a self signed is often more trouble if you have access from public already.

### Local Prod
It is possible to init all needed parts for the certificates without installing Certbot on the local server, only docker-compose is needed. First, change the domain and email inside the `new_init_deploy_certbot.sh` and then run it. The script will change the domains inside the Nginx configs to the given and then start a docker-compose for Certbot with the given domain and email. Once the script has ran once, the normal compose `docker-compose-prod.yml` should be able to build and will handle the rest. First, the React app is built inside a two stage container, then Django with Daphne, the Nginx proxy and finally another Certbot container with an automatic restart that handles renewal for the created certs.

### FU Prod
Since the FU server handles its own certificates, the production compose dose not include the Certbot step and the paths are changed. In addition, the configs have all FU domains already inside and try to include the existing secrets.


## Docker (Access Portal)
The access server container can "simply" be built and started with docker-compose and the `docker-compose-access.yml` file. For the container to be able to build properly, a few steps need to be taken.
- First, disable any local Nginx server running on port 80 / 443 of the target machine, since the Access Portal container has its own for routing and IP blocking. (Optionally, change ports and use another proxy server to point at the right container if needed.)
- Then make sure all needed files exist inside the secrets folder. These are the SSL certificates (public / private) for your domain (make sure to change your needed domain inside the Nginx config...). We would advise to use tools like Certbot to get the certificates if you want a publicly accessible server, or create a self signed pair. In addition, you need a set of public and private SSH keys. They are used by the server to authenticate against github (also make sure to enter this public key in your repo, otherwise switching commit / branch won't work).
- After the container is running, you should be able to open the Access Portal login under `https://<your-domain>/access/login` and register a user. To verify the first user / admin, open a terminal inside the Access Portal container and run the python file `/app/Access_Portal/Web_Api/activateUser.py --name <name> -a`. This will activate your created user and make him the admin. Each next verification can be made inside the Access Portal in the admin panel by the applicable user.

After these steps, the server should be running in dev mode. This means that each file change will trigger a hot reload in Django / Flask (for the Access Portal) and therefore enable a quick change via the interface of the current commit the Access Portal container is running on.

The settings panel enable an admin user to run some commands like npm to update the container insides if they have changed during a commit, since this does not happen automatically. Also a list of all active / allowed IPs can be found and managed there. These IPs reflect what is listed inside the `allowed_ips.txt` file, handling the Nginx access. Also can be disabled in these settings.

If the SSH key is not registered in github, the container won't be able to execute git functions and will therefore run into an error if you still try to change the current commit.


# Index
Rough list of project files with short descriptors as direction guide. Files not listed should be artefacts or not important for the current iteration anymore (for the most part :D).


<details>
<summary><span style="font-weight: 900;">Top-level:</summary>
<br>

| File / Folder | Short description |
| ---------- | ----------------- |
| 📄 docker-compose-access.yml | Compose file for the Access Portal |
| 📄 docker-compose-init-certbot.yml | Compose to init Certbot files for the first time (don't run by itself) |
| 📄 docker-compose-mail-dummy.yml | Compose a mail dump, used to activate mail relay like Mailjet |
| 📄 docker-compose-new.fub.yml | New compose for the Berlin Smerge server |
| 📄 docker-compose-prod.yml | New production setup (init Certbot before, run via script or manually if settings were adjusted) |
| 📄 Dockerfile.access | Docker file to build Smerge with the Access Portal |
| 📄 Dockerfile.daphne | Docker file for the production Django part |
| 📄 Dockerfile.react.ext.depl | Docker file for the React App (2 stage build and then static Nginx serve) |
| 📄 launch_daphne.sh | Launch script for the Docker prod container (run preliminaries and then Daphne) |
| 📄 launch_docker.sh | Launch script for the Access Portal container (starts Flask, Vite, Nginx and Django) |
| 📄 launch.sh | Launch script for Django and Vite in one terminal with Vite interactability |
| 📄 new_init_deploy_certbot.sh | Changes Nginx configs to right domains and runs the Certbot init compose |
</details>


<br>

<details>
<summary><span style="font-weight: 900;">Django:</summary>
<br>

| File / Folder | Short description |
| ---------- | ----------------- |
| 📁 snapmerge | Base folder for the Django project |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 config | Mostly config root |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 asgi.py | Setup for the asgi server (needed step and "routing" for the SSE in the sync) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 Custom...ware.py | Inserts IDs as object for the SSE part |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 settings_*.py | Configs for different launch settings |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 urls.py | Top level Django url pattern file |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 database | Contains sqlite3 db file (only exists after first run...) |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 home | Main Django and merger logic |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 api | Views for Django REST framework (most React API parts) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 management / commands | Additional commands that can be used in the manage.py |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 addadmin.py | Adds Django site admin user to DB when ran with the given inputs |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 addpage.py | Adds the given domain to the django_site table (needed for the admin panel to work) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 resettok....py | Invalidates pw reset tokens that are to old when ran |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 Merger_Two_... | Contains all files used by the new merger |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 generator.py | Barebone generator for very basic Snap! files used by some old test |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 merger_v2_2.py | Newest rendition of the merger |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 merger.py | Old variant of new merger (delete if additional functions not needed anymore) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 testMerg...es.py | Tests for the merger (specific and structural via the `tests/snapfiles` folder) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 migrations | Contains all DB migrations |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 admin.py | Extra table definitions for admin panel |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 ancestors.py | Used by old merger to determine ancestors in segments |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 apps.py | Django app definition for the snapmerge project |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 consumers.py | Endpoint for Server Sent Event setup and messaging |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 dataImport...er.py | Two functions used to auto generate the JS Snap! blocks (triggered on load/reload) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 forms.py | Django form definitions |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 models.py | Django DB entry (table) definitions (Only update DB with this as base and then run the Django migration commands) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 routing.py | Artefact from old sync try with websockets |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 tests.py | Óld direct project related tests |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 urls.py | URL path definitions for most app endpoints |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 views.py | All app endpoints connected to the paths from URLs |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 xmltools.py | old merger utility (still used for sync button injection) |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 media | Contains all static user uploaded / created Snap! files and merge conflict files |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 static | Contains JS, CSS and more static page related files for Django |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 snap | Contains base project and import / export block data |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 blank_proj.xml | Base project on creation if no file was given |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 data...blank.xml | Base Snap! XML for the data import block |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 data_importer.js | JS code for the data importer block (Overwrites Snap! serialize and deserialize functions to enable customData attribute) (hot reload reacts to this file) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 data_impo...xml | Combination of blank and JS code (Auto generated on start or hot reload) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 simple...nk.xml | Base Snap! XML for the sync back block |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 simple...block.js | JS code for the data sync back block (hot reload reacts to this file) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 simple...ock.xml | Combination of blank and JS code (Auto generated on start or hot reload) |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 templates | Contains template bases for all used Django pages |
| &nbsp;&nbsp;&nbsp;&nbsp;📄 manage.py | Entry and management point of Django app |
</details>

<br>

<details>
<summary><span style="font-weight: 900;">React:</summary>
<br>

| File / Folder | Short description |
| ---------- | ----------------- |
| 📁 react_extension | Contains the frontend code for the react extension (Vite) |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 public | Contains publicly accessible files like language or images |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 csnap | Copy of Snap! for diff view (lower strain on Snap's own server... change or update if needed) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 img | Contain the help menu resources |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 locales | Contain the language files, used by i18next |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 src | Contains all React (TypeScript) components (very badly sorted :P) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 assets | Image resources used in some components (internal loaded) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 components | Contains all building blocks of the React app |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 ConflictParts | Contains conflict stepper component and all different divs |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 HelpMenu | Contains definition for help modal components and the content |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 Pages.tsx | Content pages for the help modal |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 models | Should contain all dto's... (fix in future iterations...) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 NodeGraph | Cytoscape / ProjectView specific parts |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 shared | Contain some general used components |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 eventstream | JS files that the django_event_stream package uses for connection / reconnection |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 services | Most of the communication parts for the API |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 shared | shared code parts for the top level of the project |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 Layout.tsx | Menu bar on top of screen and reroute on missing token |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 main.tsx | Main React component with all routes under |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 ProjectView.tsx | Component for the main project view |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 TeacherView.tsx | Component for the teacher view |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 SignIn.tsx | Component for the teacher login view |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 SignUp.tsx | Component for the teacher registration view |
| &nbsp;&nbsp;&nbsp;&nbsp;📄 index.html | Base and entry point for the React app |
| &nbsp;&nbsp;&nbsp;&nbsp;📄 package.json | Contains list of all needed node packages |
| &nbsp;&nbsp;&nbsp;&nbsp;📄 tsconfig.json | linter and compile configs |
| &nbsp;&nbsp;&nbsp;&nbsp;📄 vite.config.ts | Vite config |
</details>

<br>

<details>
<summary><span style="font-weight: 900;">Access Portal:</summary>
<br>

| File / Folder | Short description |
| ---------- | ----------------- |
| 📁 Access_Portal | Top level folder |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 access_portal | Contains all relevant React parts for the Access Portal |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 * | more or less same structure as Django React part |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 Web_Api | Contains Flask API |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 app | Contains the main Flask files |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 models.py | DB object definitions (like in Django) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 routes.py | Contain all "views" to access or set data via the API (logic part) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 gitWorker | Contains code and data for for the current git repo the folder is in |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📁 instance | Contains sqlite3 DB file |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 activateUser.py | Run to activate a registered user (with our without admin rights) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 rest | most DB parts old and unused... probably |
| &nbsp;&nbsp;&nbsp;&nbsp;📄 launch.sh | Starts both Flask and React parts in one terminal |
</details>

<br>

<details>
<summary><span style="font-weight: 900;">Secrets:</summary>
<br>

| File / Folder | Short description |
| ---------- | ----------------- |
| 📁 secrets | Top level folder |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 rasp_certs | Contains SSL certificates for the public Nginx server (mostly for Docker) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 fullchain.pem | Public SSL key for Nginx |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 privkey.pem | Private SSL key for Nginx |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 rasp_ssh | Contains SSH certificate stuff for the Access Portal |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 id_rsa | Private key connected to the public (store only inside the container) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 id_rsa.pub | SSH public key (needs to be added to your github repo) |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 known_hosts | Current github public keys for a github webhook with the Access Portal |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 smerge | Contains secret json |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 secrets.smerge.json | Contains important Django config parts like sec.key, email host pw and email API key |
</details>

<br>

<details>
<summary><span style="font-weight: 900;">Data:</summary>
<br>

| File / Folder | Short description |
| ---------- | ----------------- |
| 📁 data | Top level folder |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 nginx_access | Full config with all routes to Django / React ext. / Flask and Access React |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 nginx_deploy | Configs more specific for compiled / deploy versions |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 init_cert_nginx.conf | Config for the Certbot initialization container |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 nginx_ext.conf | Config for the alpine Nginx server in the React extension container |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 nginx.conf | Config for Django and React with static server for admin panel and Certbot paths |
| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;📄 nginx.fub.conf | Prod config with fu domain and other config / cert parts set |
| &nbsp;&nbsp;&nbsp;&nbsp;📁 old_configs | Old Nginx config files |

</details>

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
For convenience, there exists a small convention-based test framework for generating tests that test whether a conflict should be raised or not when two files get merged.

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
It is important to separate the prefix from the suffix with an "_". Otherwise, the matching cannot be successfully executed.

If you have multiple tests that rely on the same input for one half, you can reduce the number of files by a base matcher. If for example more than two files with the same prefix are found, the tests will search for a base file with the suffix "_0". If it is found, test cases will be generated with each other file and the base case.

As an example, these input xml files ["test_0", "test_1", "test_2", "other_1", "other_2"] result in these test combinations -> [("test_0", "test_1"), ("test_0", "test_2"), ("other_1", "other_2")].

In addition, if you want to test for a specific conflict type you expect, you can add a type to the name that the generator uses to match against. Add one of the following into the `<ignored>` section of the filename (at least in one of both files, if both files have different types, the conflict will test against the first found in the list):
- "type_image" -> `ConflictTypes.IMAGE`
- "type_element" -> `ConflictTypes.ELEMENT`
- "type_text" -> `ConflictTypes.TEXT`
- "type_customBlock" -> `ConflictTypes.CUSTOMBLOCK`
- "type_watcher" -> `ConflictTypes.WATCHER`
- "type_audio" -> `ConflictTypes.AUDIO`
- "type_attribute" -> `ConflictTypes.ATTRIBUTE`

A third type for test generation exists if you want to test multiple collisions. They work similarly to the single collision files, you just have to add multiple types into the name that the test should expect and then test for. Either write a list or use amounts on repeating types.

Example: [`ConflictTypes.IMAGE`, `ConflictTypes.ELEMENT`, `ConflictTypes.ELEMENT`, `ConflictTypes.TEXT`] can either be "[matchName]_type_image_type_element_type_element_type_text_[matchNumber].xml" or shorter "[matchName]_type_image_type_element_2_type_text_[matchNumber].xml".

This part is a bit stricter and only reads the types from the first input file. On problems, change detection or extend.



### Other Reference File Based Tests
It is recommended to store all files involved in the merger test into the ```snapfiles``` folder.
They can either be stored directly into the folder itself or into subfolders for clarity.

As these tests cannot be auto-generated, the tests need to be implemented manually. It is recommended to implement the tests directly into the folder with the implementation to be tested, following the Django naming scheme for test files.


## Password Reset Token Invalidation
In order to reset passwords, Smerge uses a token-based password reset mechanism.
After their usage, the tokens get deleted from the database automatically and therefore, they get invalidated.
For unused tokens, it may be desired to invalidate them from time to time.
This may prevent abuse of the tokens.

By default, Smerge runs a task after starting the server that invalidates old unused password reset tokens.
Every day, the task gets rescheduled.
The task deletes all password reset tokens that are older than one week.

The default task can be disabled by setting the following in the Django settings:
```DISABLE_TOKEN_INVALIDATION = True```


If you have disabled the automatically scheduled invalidation task within Django you can still invalidate tokens via a Django management command.
The same command gets executed for the scheduled task.

For more information execute:
```python snapmerge/manage.py  resettokencleanup --h --settings=config.settings_local```


## Good to know:
### XMLBlocker / Post Block
Since Snap! already needs JS to be activated for the post back button to work, we decided to implement a blocker step to force a user into activating JS before the real project file is even loaded. During this step, the Snap! serializer and deserializer functions get modified to allow the new customData attribute, currently used for uuids. In addition, the post back button also reloads the file inside Snap! with the request return link to update all uuids inside a running Snap! instance.

Both xmlBlocker JS and the post back button JS are watched by Django for changes and rebuild the xml part for the Snap! file on start of Django or on a hot reload trigger. Therefore, if you want to change these code parts, just edit the JS files inside `./snapmerge/static/snap/` while Django is running.

To add more files apart from Python files to the Django auto watch, register them inside the `app.py` files `extra_reload_files` list and add a builder if needed to the `ready` function.

### Django compress error in browser
The npm packages for Django are installed in the toplevel folder, therefore when you start Django inside another folder (i.e. not with the path ./snapmerge/manage.py), it won't be able to resolve the wanted packages and throws an error on template render.

### Snap! integration in React
Don't be as stupid as we were and put multiple Snap! instances in a resizable slider component. Snap! is not happy with this and requires full reloads to handle right scales and ratios. Therefore the mess in the diff view. Just use a static frame or anything else :D.

### DEV / Beta / Prod
Depending on the settings inside the config you are using, the debug mode and beta mode will change a few things inside the Django visuals. As a start, "(DEV)" or "(Beta)" will be added to the page headers depending on the debug and beta settings. If either one is in use, the main page icons will change as well. In addition, Vite will change the names and icons depending on if it is ran with the Vite dev server or compiled for production. Keep in mind to change this in the views / the `react_extension/vite.config.ts` if you want it another way.

Good to know: Django has some parts that only work when `debug=True` is set in the used config. For example, static file serving only works with explicitly added paths during production but in dev mode you won't notice since the development server of Django will serve everything there regardless.


### Custom manage.py commands
In the `snapmerge/home/management/commands/` folder lay three additional commands that can be run with

```sh
python manage.py <addadmin | addpage | resettokencleanup> --settings=config.settings_local
```

or

```sh
make <addadmin | addpage>
```

As the names suggest, addadmin will ask for a username, mail and password (two times the same...) and on success adds a new admin user to the DB. An admin user is needed if you want access to the Django admin panel from the page to for example change DB entries on the fly (good for the message of the day banner).

The addpage command will ask you for a domain name like "example.com" and then will add this name to the database. This is also needed by the admin panel, because Django only allows admin panel request for domains that are added to the "django_site" table.

The resettokencleanup will run through all active password reset tokens and disables them if they are too old. This command is also called in a cronjob, added in the `snapmerge/home/urls.py` part to periodically clean the DB. With this, there shouldn't be a need to run it manually. Just useful if you want to add additional periodic cleanup jobs if needed in the future.

### Database
If you change anything structural (the field values or types) inside the `models.py` file, a database migration is needed to bring the current DB or any future DB instances on the same page. This can be done by hand (don't do this if not needed like the pw has...), or by using the Django internal migration tool. Just run

```
make makemigrations
```

followed by


```
make migrate
```

in the top level folder. The first command will generate a migration based on the current changes to the models compared to the last state and add it to the migrations folder. The second will check the current migration state of the DB and apply any that were not applied previously. This should ensure that each DB instance should be able to be ported to the newest state (like the old Berlin DB states to a newer on upgrade).


### HTTP vs. HTTPS
The project has a lot of interconnected parts and some Django routing sections won't work only under localhost and without SSL (to be more specific, communication between Snap! and Smerge won't work without...). So we would advise you to create a self signed certificate pair for your Nginx proxy from the get-go and don't bother with reenabling HTTP only (it is a pain and SSL will always be needed in the end anyway). Or open the needed ports and use Certbot and get a Let's Encrypt certificate.

## Lessons learned
### Git
We used a fork of the main project in a private repo since we wanted to make sure not to leak any secret files or anything during development in a public repo. This worked well until the time comes for a pr to the main repo which does not work directly between a private and an unowned public repo. Therefore we wanted to give you a warning in advance if you consider a similar approach. It works with porting it between your private repo and a public fork of the main project and the making a pr but it will cause a short headache in the end. (Or make a single commit in the end to the main repo... this would also work but delete any history for the files of your part). Just be warned :P

### Test Server
Depending on the nature of your changes, a test / live server may not be very possible / convenient for you. Since we rewrote some fundamental parts of the project and ported it to other frameworks or approaches, we had this situation in the beginning and shoved this part always to a later date. The problem with this is, that Django and to some extent React behave differently in dev and semi / full production environment. For example, we had a lot of problems with the Cytoscape canvas element in a semi-live test at the university since we only tested the main parts locally with a very limited set of devices. These problems only appeared with laptops of certain size during production and therefore completely slipped under the radar. This is only one of the most prominent examples and an early test server with outside testers would have helped a lot earlier.

In addition, a live test in combination with a school is harder to handle and maintain but if the possibility arises you will get a lot of data and behavior you wouldn't have thought otherwise and we found this to be also extremely helpful in the end.


--------------

# Contributing

Thank you for considering contributing to Smerge! It's as easy as creating a pull request.

# License

Smerge itself is licensed under the MIT license. License for third-party libraries may differ and those licenses apply in those cases.

# etc.

To import initial data use:
manage.py loaddata snapmerge/fixtures/initial_data.json

--------------

# Changelog

## 2018-2023

- Creation 2018
- Developed and maintained mostly by Stefan Seegerer and Tilman Michaeli

## 2023-2024

- Development by student project
- e.g. modernization and switch to React

## 2024-2025

A second student project including the following major changes:

### Kanban board

With the Kanban board pupils can communicate between each other and track their progress,
such that additional external tools like sticky notes are no longer needed.

It can be used to:
- Create tasks by adding cards with a textual description
- Track the progress by moving cards to an appropriate column,
  the number of columns and column description can also be adjusted
- Colorize cards to assign additional meaning to them
  e.g. to assign them to a specific person

### Introduction of three-way merge

In case of a merge conflict between two blocks, the merging view has been expanded. The conflicting blocks are no longer isolated and shown in the context of the whole sprite/stage. For further clarity the blocks involved in the current merging step are highglighted in colour. Furthermore, a third window in the middle was added placing the conflict blocks within the automatically merged project to visualize the overall consequences of the merge.

Should both versions of a conflicting block be chosen, notes were added to these blocks describing their origin.

### Collapse of commit messages

Commit messages that appear next to their respective node have been collapsed to reduce clutter on the screen. The full commit messages can be displayed by hovering above them with the cursor.

### Addition of teacher accounts and teacher view

Teachers can now register teacher accounts and use them for login. When logged in with a teacher account, teachers have access to the newly added teacher view, in which they can organize Smerge projects between different school classes. They can also add new school classes to the teacher view.

### Improvement of project import and addition of project duplication

Within the teacher view, teachers can now import existing project by providing either project ID or Pin. They can now also duplicate projects.


--------------

<details>
<summary><span style="font-weight: 600; font-size: 32px">Old Readme</summary>

# Smerge

Smerge is a merge tool for school environments and Snap!. It is based on a lot of open source projects including cytoscape.js and Django. It is intended to be simple, beautiful, fast, and easy to use in school environments. A live demo can be found at [smerge.org](https://smerge.org)

# Install

You will need pip and Python 3 for installing Smerge on your server.
We recommend using a virtualenv and npm for local deployment. Activate your virtualenv and use

## With Docker

To deploy Smerge via Docker you may use the docker-compose.yml file and run:

```
docker-compose build
docker-compose up
```

Sometimes it might be necessary to run `docker exec -it smerge_server bash` and then run `make migrate`.

For the official version on our FU server, use

```
docker-compose -f docker-compose.fub.yml build
```

## Without Docker

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

We recommend to test the system using a redis Docker. Redis is used for handling all websocket related actions:

```
docker run -p 6379:6379 --name some-redis -d redis
```

</details>
