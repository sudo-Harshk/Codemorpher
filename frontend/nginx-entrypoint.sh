#!/bin/sh
# Substitute $BACKEND_URL in the nginx config template, then start nginx.
# This is required because nginx does not natively support environment variables.
envsubst '$BACKEND_URL' < /etc/nginx/conf.d/default.conf.template \
  > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
