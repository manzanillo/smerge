# Access Portal
## Intro
This pice of software is designed to run in conjunction with a complete separate (open) webservice. It is designed to infringe as little as possible onto the underling service. The access portal controls a nginx instance, that in turn acts as reverse proxy for front / backend and the service this is designed to gate. With this, a user can authenticate themselves with the access portal and only access the unsecured service, if the are keyed in.

The frontend provides a interface to create / login (after the account was verified) and then saving the users current ip in the allowed list, enabling them access to the service beneath. In addition it can be connected to a git project and enable controlling current running versions based on commits.

## Setup
First install a nginx server. This can be done via docker or in the tutorial case with just installing it directly since the rest will also run directly and only this on a raspberry and therefore docker and extra configuration is not needed. (Especially since controlling the running version of the service through the container would be a pain :D...)

```sh
sudo apt install nginx
```

After installing nginx, we can configure it to run as reverse proxy for everything...