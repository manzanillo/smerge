# Use the official Nginx slim image as the base image
FROM nginx:alpine

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN apk update && apk add bash

RUN apk --no-cache add git python3 py3-pip nodejs npm

RUN mkdir /app

WORKDIR /app

COPY . /app

WORKDIR /app/access_portal

RUN npm install

WORKDIR /app/Web_Api

RUN pip install -r requirements.txt

WORKDIR /app

# Expose port 80 to allow incoming HTTP traffic
EXPOSE 80
EXPOSE 443

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]

RUN chmod 777 /app/launch_docker.sh

ENTRYPOINT ["/app/launch_docker.sh"]


# docker build -t my-nginx-test .
# docker run -d -p 80:80 -p 443:443 my-nginx-test