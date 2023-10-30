# nginx-dist

Use [nginx](http://nginx.org) as an npm module for tighter integration with node
apps (e.g. test fixtures).

Build steps based on <https://github.com/jirutka/nginx-binaries> with some
modifications (remove some modules and add in http3 support with libressl)

## Usage

`npm install nginx-dist`

Example config, put in `nginx.conf`:

```conf
error_log stderr;
daemon off;
events {}
http {
  # Respond to health checks
  server {
    listen unix:./nginx.sock;
    location / {
      echo "OK";
    }
  }
  access_log off;
  server {
    listen 8080;
    root .;
  }
}
```

```js
import nginx from "nginx-dist";

const server = await nginx();
server.stop();
```

## Running on privileged ports

If you want to bind to privileged ports (anything below 1024, like 80 for http
och 443 for https) you need to set the capabilities for the binary.

Something like this should work:

```sh
sudo setcap 'cap_net_bind_service=+ep' ./node_modules/nginx-dist-*/nginx
```
