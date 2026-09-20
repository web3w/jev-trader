#!/bin/sh
set -eu

CERT_ROOT=/opt/1panel/apps/openresty/openresty/www/sites/jev-trader.com

# Use a site-specific lock to prevent manual checks and scheduled renewals from running concurrently.
exec 9>/run/jev-trader-cert-renew.lock
flock -n 9 || exit 0

docker run --rm \
    -v "$CERT_ROOT/letsencrypt:/etc/letsencrypt" \
    -v "$CERT_ROOT/certbot-work:/var/lib/letsencrypt" \
    -v "$CERT_ROOT/certbot-logs:/var/log/letsencrypt" \
    -v "$CERT_ROOT/acme:/var/www/certbot" \
    certbot/certbot:v5.8.0 renew \
    --cert-name jev-trader.com \
    --non-interactive \
    --no-random-sleep-on-renew \
    --max-log-backups 12 \
    --deploy-hook 'touch /var/lib/letsencrypt/reload-required' \
    "$@"

# Reload gracefully only after certificate renewal succeeds; retain the marker on reload failure for the next retry.
if [ -f "$CERT_ROOT/certbot-work/reload-required" ]; then
    docker exec openresty nginx -t
    docker exec openresty nginx -s reload
    rm "$CERT_ROOT/certbot-work/reload-required"
fi
