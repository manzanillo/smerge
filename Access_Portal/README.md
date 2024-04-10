# Access Portal
## Intro
This pice of software is designed to run in conjunction with a complete separate (open) webservice. It is designed to infringe as little as possible onto the underling service. The access portal controls a nginx instance, that in turn acts as reverse proxy for front / backend and the service this is designed to gate. With this, a user can authenticate themselves with the access portal and only access the unsecured service, if the are keyed in.

The frontend provides a interface to create / login (after the account was verified) and then saving the users current ip in the allowed list, enabling them access to the service beneath. In addition it can be connected to a git project and enable controlling current running versions based on commits.

## Setup (local / pi without docker)
First install a nginx server. This can be done via docker or in the tutorial case with just installing it directly since the rest will also run directly and only this on a raspberry and therefore docker and extra configuration is not needed.

```sh
sudo apt install nginx
```

After installing nginx, we can configure it to run as reverse proxy for everything... (use the access portal nginx and adjust to your needs (domain / certs / ports if needed...)).

Now install both python dependency parts (one for django in the main folder and the other for flask in the Web_Api folder). Best to use venv or conda but don't forget to change launch scripts to your needed paths if you want to use them.

After this install all node packages with npm, once in the top folder for django, then in the react_extension folder for smerges react part and finally inside the access_portal folder for the access portal frontend part.

Then make sure the rest of djangos needs are fulfilled, like the secrets file.

To activate the first user, follow the command stated in the docker part for the access portal.

To start the react part, move into the access_portal folder and run ```npx vite```.