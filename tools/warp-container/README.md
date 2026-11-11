# WARP in a container

Runs a second Cloudflare WARP client (Zero Trust team `jfp`, Traffic-and-DNS
mode) inside Docker, so only traffic you send to it goes through WARP. The
host's own `warp-svc`, routing, nftables and systemd units are not touched.

```
host app ──TCP──> 127.0.0.1:11080  (GOST: SOCKS5 + HTTP CONNECT) ─┐
host psql ─TCP──> 127.0.0.1:15432  (socat -> prod Aurora :5432)   ├─ warp-prod netns ── WARP ── Cloudflare ── Tunnel ── VPC
host psql ─TCP──> 127.0.0.1:15433  (socat -> stage Aurora :5432)  ┘
```

Prod VPC is `10.10.0.0/16`, stage is `10.11.0.0/16`. Every port is published on
`127.0.0.1` only; do not change that to `0.0.0.0`.

## Run it

```sh
cd tools/warp-container
cp .env.example .env     # fill in PROD_PG_ENDPOINT / STAGE_PG_ENDPOINT
docker compose build
docker compose up -d warp
./enroll.sh              # interactive: SSO in your browser, click Open WARP
docker compose up -d     # starts pgfwd once warp is healthy
./verify.sh              # PASS/FAIL probes
```

`enroll.sh` replaces the consumer registration the upstream entrypoint makes on
first start with a `jfp` team registration. The registration lives in `./data`
(git-ignored); when the Access session lapses, run `./enroll.sh` again.

The login token expires in about a minute, so nothing is pasted by hand. While
the script runs it is the default handler for `com.cloudflare.warp://` links:
click **Open WARP** on the SSO success page (allow the browser's "open
external application" prompt) and the token goes straight to the container.
Fallbacks: copy the link (the Wayland clipboard is watched), or paste it at the
hidden prompt. The handler is one `.desktop` file in
`~/.local/share/applications` plus one line in `~/.config/mimeapps.list`;
both are removed on exit, including on Ctrl-C and `kill`. After a `kill -9` the
next run cleans up the leftover. The host's own `warp-cli.desktop` handler is
only shadowed, never edited.

## Use it

```sh
curl --socks5-hostname 127.0.0.1:11080 http://api-users.service.internal:4002/graphql
HTTPS_PROXY=http://127.0.0.1:11080 node script.js
psql "host=$PROD_PG_ENDPOINT hostaddr=127.0.0.1 port=15432 dbname=... user=... sslmode=verify-full sslrootcert=..."
```

`hostaddr` dials the forwarder while `host` still drives TLS name checking.
Prisma has no equivalent, so use `127.0.0.1:15432` with `sslmode=require`.

## Notes

- The image is built from `cmj2002/warp-docker` pinned to a commit (see
  `compose.yaml`), with GOST `2.12.0`. WARP itself is whatever Cloudflare's apt
  repo ships at build time; `docker exec warp-prod warp-cli --version`.
- The container runs inside the host's WARP tunnel (double tunnel). If large
  responses stall, try lowering the inner MTU:
  `docker exec warp-prod sudo ip link set dev CloudflareWARP mtu 1200`
  (it made no difference in the first run, see the report).
- The proxy has no authentication. The host ports are loopback only, but the
  container also has a fixed address (`172.31.250.2`) on a Docker bridge, where
  the proxy and the forwarders listen on all container interfaces. Treat them
  as usable by anything on this host and by other containers on `warpnet`.
- The prod forwarder (`:15432`) starts whenever `PROD_PG_ENDPOINT` is set. Leave
  it empty to run stage only. `pgfwd` does not restart on its own: after
  restarting `warp`, run `docker compose up -d --force-recreate pgfwd`.
- The bastion allowlists individual IPs. Through WARP your source IP is a
  Cloudflare egress IP, so SSH to the bastion goes direct, not via the proxy.
- Tear down: `docker compose down`, revoke the device in the Zero Trust
  dashboard, `rm -rf data`.

Results of the first run (what connected, what did not, what to ask the Zero
Trust admin) are in [TEST-REPORT.md](TEST-REPORT.md).
