BASE = ./snapmerge
SETTINGS = config.settings_local

.PHONY: run startapp makemigrations migrate test

run:
	pipenv run python $(BASE)/manage.py runserver --settings=$(SETTINGS)

startapp:
	pipenv run python $(BASE)/manage.py startapp $(APPNAME)

makemigrations:
	pipenv run python $(BASE)/manage.py makemigrations --settings=$(SETTINGS)

migrate:
	pipenv run python $(BASE)/manage.py migrate --settings=$(SETTINGS)

test:
	pipenv run python $(BASE)/manage.py test $(APPNAME) --settings=$(SETTINGS)



