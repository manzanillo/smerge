BASE = ./snapmerge

.PHONY: run startapp makemigrations migrate test

run:
	pipenv run python $(BASE)/manage.py runserver

startapp:
	pipenv run python $(BASE)/manage.py startapp $(APPNAME)

makemigrations:
	pipenv run python $(BASE)/manage.py makemigrations 

migrate:
	pipenv run python $(BASE)/manage.py migrate 

test:
	pipenv run python $(BASE)/manage.py test $(APPNAME) 


#pipenv run python snapmerge/manage.py runserver
