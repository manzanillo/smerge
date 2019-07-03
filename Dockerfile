# SMERGE
# Version: 1.0
FROM python:3
# Install Python and Package Libraries
RUN apt-get update && apt-get upgrade -y && apt-get autoremove && apt-get autoclean
RUN apt-get install -y \
    libffi-dev \
    libssl-dev \
    libxml2-dev \
    libxslt-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zlib1g-dev \
    net-tools
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash -
RUN apt-get install -y nodejs
# Project Files and Settings
ARG PROJECT=snapmerge
ARG PROJECT_DIR=/var/www/${PROJECT}
RUN mkdir -p $PROJECT_DIR
WORKDIR $PROJECT_DIR
#COPY Pipfile Pipfile.lock ./
COPY . .
RUN pip install -U pipenv
RUN pipenv install --system
RUN npm install
# Server
EXPOSE 8000
STOPSIGNAL SIGINT
ENTRYPOINT ["python", "snapmerge/manage.py"]
CMD ["migrate"]
CMD ["compress"]
#CMD ["runserver", "0.0.0.0:8000", "--settings=config.settings_production"]
CMD ["runserver", "0.0.0.0:8000", "--settings=config.settings_local"]