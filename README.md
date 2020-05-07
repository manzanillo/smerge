# smerge

Smerge is a merge tool for school environments and Snap!. It is based on a lot of open source projects including cytoscape.js or Django. A live demo can be found at [smerge.org](https://smerge.org)

Rules

- Simple
- beautiful
- fast

# Install

You will need pip and Python 3 for installing smerge on your server.
We recommend using a virtualenv and npm for local deployment. Activate your virtualenv and use

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

# Contributing

Thank you for considering contributing to smerge! It's as easy as creating a pull request.

# License

smerge itself is licenced under the MIT license. Licence for third-party libraries may differ and those licences apply in those cases.

# etc.

To import initial data use:
manage.py loaddata snapmerge/fixtures/initial_data.json
