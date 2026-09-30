# Xenx deployment and operations

- Host: `Xenx53`, IP `66.29.128.53`.
- Project directory: `/root/www/jev-trader`.
- Compose project: `jev-trader`; configuration: `deploy/xenx/compose.yaml`.
- Production URL: [https://jev-trader.com](https://jev-trader.com). The apex A record points to this host with Cloudflare proxying enabled.
- Temporary URL: [http://66.29.128.53:8081](http://66.29.128.53:8081).
- `www.jev-trader.com` is a proxied Cloudflare CNAME targeting `jev-trader.com`. Both HTTPS domains serve the website and API directly; visiting `www` preserves that hostname. The Cloudflare `www to canonical jev-trader.com` redirect rule is disabled.
- The origin Let's Encrypt certificate covers both `jev-trader.com` and `www.jev-trader.com`, maintained by the existing renewal job. Page canonical URLs continue to use the apex domain to consolidate duplicate content.

## Ports and access paths

| Entry point | Purpose |
| --- | --- |
| Public `8081` | OpenResty proxy for this site |
| `127.0.0.1:3120` | Frontend container port `3000` |
| `127.0.0.1:8120` | Backend container port `8000` |
| Shared `80` | Site entry managed by 1Panel; ordinary requests forward to `8081` |
| Shared `443` | Project-managed HTTPS entry for `jev-trader.com` |

OpenResty strips the `/api/` prefix and forwards those requests to the backend; other requests go to the frontend. SSE proxy buffering and caching are disabled. The source configuration is `deploy/xenx/jev-trader.conf`; it uses the existing shared OpenResty instance, outside this project’s Compose stack.

JSON and SSE responses use gzip when supported by the client. Keep proxy buffering disabled so compressed events flush promptly. After proxy or frontend changes, run `node web/scripts/check-market-feed.mjs` against production (or set `FEED_BASE_URL` for another API). This read-only check requires both markets to be running and verifies complete snapshots followed by new blocks; successful page HTML alone does not verify the dashboard connection.

The host file `/opt/1panel/apps/openresty/openresty/conf/conf.d/jev-trader.com.conf` is the apex port `80` entry managed by 1Panel. The adjacent `jev-trader.conf` corresponds to this project’s source configuration and manages `443/8081` for both domains and `80` for `www`. Ordinary www HTTP requests upgrade to HTTPS on the same hostname; certificate challenges serve files directly. Preserve this division when updating configuration; never have both files listen on the same domain and port `80` or `443`.

The frontend build argument is `NEXT_PUBLIC_API_URL=/api`, using the same origin for backend access. This value is set at build time, so changes require rebuilding the frontend. The backend fixes `MODEL=mock`, `DRY_RUN=true` and an empty `PRIVATE_KEY`: it reads real market data and simulates trades without private keys or Jev calls.

Both containers use `restart: unless-stopped`. After a manual stop, start them explicitly.

## Checks

After logging into the host, run these commands from the project directory. The Compose commands below target only this project.

```sh
cd /root/www/jev-trader
docker compose -f deploy/xenx/compose.yaml ps
docker compose -f deploy/xenx/compose.yaml logs --tail 100 backend web
curl -fsS http://127.0.0.1:3120/jev-ai-decision-model -o /dev/null
curl -fsS 'http://127.0.0.1:8120/?venue=hyperliquid'
curl -fsS 'http://127.0.0.1:8081/api/?venue=hyperliquid'
curl -fsS --resolve jev-trader.com:443:127.0.0.1 https://jev-trader.com/hyperliquid-hype-usdc -o /dev/null
```

To inspect SSE, run the following command and press `Ctrl+C` after observing continuous events:

```sh
curl -N 'http://127.0.0.1:8081/api/events?venue=hyperliquid'
```

## Update, restart and stop

After syncing reviewed code, rebuild and update both project services:

```sh
cd /root/www/jev-trader
docker compose -f deploy/xenx/compose.yaml up -d --build backend web
docker compose -f deploy/xenx/compose.yaml ps
```

Restart existing containers only:

```sh
docker compose -f deploy/xenx/compose.yaml restart backend web
```

Stop only this project while retaining containers and data directories:

```sh
docker compose -f deploy/xenx/compose.yaml stop backend web
```

Resume operation:

```sh
docker compose -f deploy/xenx/compose.yaml up -d backend web
```

Do not stop the shared OpenResty instance or use host-wide container stop or cleanup commands. Proxy entry points remain configured while the services are stopped, but the services are unavailable.

## HTTPS and certificate renewal

Certificates are issued through webroot validation using the official `certbot/certbot:v5.8.0` image. Cloudflare uses `Full (strict)` and edge `Always Use HTTPS`. Origin ports `80/443` both serve challenge files; `8081` remains a temporary HTTP entry.

The site certificate directory on the host is `/opt/1panel/apps/openresty/openresty/www/sites/jev-trader.com/`, mounted at `/www/sites/jev-trader.com/` inside OpenResty:

- `acme/`: HTTP-01 challenge files only; the root of the challenge location.
- `letsencrypt/`: certificates, private keys, ACME account and renewal configuration. Preserve the entire directory to retain certificate symlinks.
- `certbot-work/`, `certbot-logs/`: Certbot working state and logs, with at most 12 log backups.

Certificate and challenge directories are separate. Keep private keys readable only by root and never copy them into the repository. The existing `/.well-known/acme-challenge` location in 1Panel’s port `80` configuration must retain `/www/sites/jev-trader.com/acme` as its root. This project manages the same path on `443`.

`jev-trader-cert-renew.timer` checks for renewal daily within the hour after 03:00 and 15:00 in the server timezone. It handles only this site’s certificate. After successful renewal, it runs `nginx -t` and reloads gracefully without restarting containers. No notification email was supplied at initial issuance. Check renewal status with:

```sh
systemctl list-timers jev-trader-cert-renew.timer --no-pager
systemctl status jev-trader-cert-renew.service --no-pager
journalctl -u jev-trader-cert-renew.service -n 50 --no-pager
/root/www/jev-trader/deploy/xenx/renew-cert.sh --dry-run
```

After updating the renewal script or timer configuration, run from the project directory:

```sh
chmod 0755 deploy/xenx/renew-cert.sh
install -m 0644 deploy/xenx/jev-trader-cert-renew.service deploy/xenx/jev-trader-cert-renew.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now jev-trader-cert-renew.timer
```

Update this site’s `443/8081` proxy configuration:

```sh
install -m 0644 deploy/xenx/jev-trader.conf /opt/1panel/apps/openresty/openresty/conf/conf.d/jev-trader.conf
docker exec openresty nginx -t && docker exec openresty nginx -s reload
```

Keep certificate renewal active when temporarily stopping trading containers. Disable this site’s timer only when permanently retiring the site: `systemctl disable --now jev-trader-cert-renew.timer`. This does not affect other projects.

## Logs and simulation data

Container stdout logs are limited to `10 MB` per file with `3` files retained per container. Kuru appends separately to `data/events.jsonl`; the host `data/` directory is mounted at `/app/data` in the backend. Install rotation rules with:

```sh
cd /root/www/jev-trader
install -m 0644 deploy/xenx/logrotate.conf /etc/logrotate.d/jev-trader
logrotate -d /etc/logrotate.d/jev-trader
```

Rotation is checked daily; files exceeding `50 MB` can also rotate on the next logrotate run. Keep `5` compressed rotations. The host’s logrotate scheduler must be running.

Simulated accounts, positions and recent history reside in backend memory. **Restarting or rebuilding the backend resets both markets’ simulation results.** Retaining `events.jsonl` preserves only Kuru logs; the application does not restore accounts from them. Restarting only the frontend does not reset backend simulation accounts.
