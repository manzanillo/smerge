BASE = ./snapmerge
SETTINGS = config.settings_local

.PHONY: run startapp makemigrations migrate test

crun:
	npm install && python $(BASE)/manage.py compress --settings=$(SETTINGS) ; python $(BASE)/manage.py runserver --settings=$(SETTINGS)
run:
	python $(BASE)/manage.py runserver --settings=$(SETTINGS)

startapp:
	python $(BASE)/manage.py startapp $(APPNAME)

makemigrations:
	python $(BASE)/manage.py makemigrations --settings=$(SETTINGS)

migrate:
	python $(BASE)/manage.py migrate --settings=$(SETTINGS)

test:
	python $(BASE)/manage.py test $(APPNAME) --settings=$(SETTINGS)

translation_DE:
	python $(BASE)/manage.py makemessages -l de --settings=$(SETTINGS)

compile_translations:
	python $(BASE)/manage.py compilemessages --settings=$(SETTINGS)

shell:
	python $(BASE)/manage.py shell --settings=$(SETTINGS)

compress:
	npm install && python $(BASE)/manage.py compress --settings=$(SETTINGS)

#for tracking time spend on project :)
CFLAGS = -g -std=c11 -pedantic -Wall -Werror -D_XOPEN_SOURCE=700 
CC = gcc
time: time.o
	$(CC) $(CFLAGS) -o time time_track.o
time.o:
	$(CC) $(CFLAGS) -c time_track.c
clear: 
	rm -f time time_track.o .tmp.time



