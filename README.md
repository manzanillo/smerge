<h1 style="font-size: 50px; display: flex; align-items:center; justify-content:space-between;"> SMERGE <img height=80px src="./snapmerge/static/icon/logo_norm.svg"/> </h1>
Smerge is a basic version management system for the block based programming language Snap!. It offers a simple user interface to manage a project and merge different branches with relative ease.

# History lesson
The project was first written purely with django and due to access limitations could only merge different scripts via cartesian location. This worked well for a lesser interactive page from the beginning, but with new features the project part was migrated to a react frontend. Due to time constraints and simplicity, project creation and a few other static pages are still using django and the in conjunction django templates as base.

The docker "production" setup was therefore also only made with only a simple django setup in mind, but with some hefty roundabout constraints due to the deployment on the TU Berlin servers and their restrictions. (This includes  [Dockerfile](/Dockerfile), [dockear-compose.yml](/docker-compose.yml), [docker-compose.fub.yml](/docker-compose.fub.yml) and [entrypoint.sh](/entrypoint.sh))

The database was and still is a sqlite3 file (/snapmerge/database/db.sqlite3). Since the database is currently very small with low bandwidth, this works fine. In the future this should probably be extended to a full blown db instance in the docker setup or separate.

## Basic Project Structure
### Django:
As mentioned above, the project currently uses Django as "static" page host and API. The api part is mostly contained in the "snapmerge/home/api" folder and uses Django Rest Api as base. During production django is not ran with its internal server anymore (```python manage.py runserver...```), instead it relies on Daphne, a separate asgi server for Django, designed to handle the whole communication process and django instantiation.

The main configuration are located in the "snapmerge/home/config" folder and contain different settings for different launch situations. For example settings_production.py disable debug and beta mods in addition to enforcing some security measures and changing the base urls to the right server locations. For most of the configuration to work, some secrets need to be set in advance inside the "snapmerge/secrets" folder. More details in the the secret section below.

### Secrets:
Stuff how files and secret keys / certs...


## Index
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


## Setup
### Local
### Docker
### Access Portal


<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>

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
