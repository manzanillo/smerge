#!/bin/bash

# Enter your domain
domain="<your-domain>"
# Enter the email certbot should run under
email="<your-mail>"
data_path="./data/certbot"


# stop if compose is missing
if ! [ -x "$(command -v docker-compose)" ]; then
  echo 'Error: docker-compose is not installed.' >&2
  exit 1
fi


# check if cert config already exist in project
if [ -d "$data_path" ]; then
  read -p "Existing data found for $domain. Continue and replace existing certificate? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi


echo "Generating new hellman prim set for main nginx instance"
echo "$data_path/conf"
mkdir -p "$data_path/conf"
sudo openssl dhparam -out "$data_path/conf/ssl-dhparams.pem" 2048
echo

echo "Update docker-compose-prod.yml with domain and email"
sed -i -E "/command: certonly/s/^.*$/    command: certonly --webroot --webroot-path=\/var\/www\/certbot --email $email --agree-tos -d $domain/" docker-compose-prod.yml
echo

echo "Update docker-compose-init-certbot.yml with domain and email"
sed -i -E "/command: certonly/s/^.*$/    command: certonly --webroot --webroot-path=\/var\/www\/certbot --email $email --agree-tos -d $domain/" docker-compose-init-certbot.yml
echo

echo "Update init certbot nginx config with domain"
sed -i -E "/server_name/s/^([[:space:]]*)(.*)$/\1server_name $domain;/" ./data/nginx_deploy/init_cert_nginx.conf
echo

echo "Update deploy nginx config with domain"
sed -i -E "/server_name/s/^([[:space:]]*)(.*)$/\1server_name $domain;/" ./data/nginx_deploy/nginx.conf
sed -i -E "/ssl_certificate /s/^.*$/        ssl_certificate \/etc\/letsencrypt\/live\/${domain}\/fullchain.pem;/" ./data/nginx_deploy/nginx.conf
sed -i -E "/ssl_certificate_key/s/^.*$/        ssl_certificate_key \/etc\/letsencrypt\/live\/${domain}\/privkey.pem;/" ./data/nginx_deploy/nginx.conf
echo

echo "Start init certbot and request certificate"
echo "Stop with ctrl+c after certificate was gathered and start normal deployment with:"
echo "sudo docker-compose -f docker-compose-prod.yml build"
echo "sudo docker-compose -f docker-compose-prod.yml up"

sudo docker-compose -f docker-compose-init-certbot.yml up
