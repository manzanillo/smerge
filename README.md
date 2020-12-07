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
