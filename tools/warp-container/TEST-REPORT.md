# Test report: WARP in a container

Run on 2026-11-11 from the operator's workstation, against Zero Trust team `jfp`.
Container client `warp-cli 2026.8.2115.0`; host client `2025.8.779.0`. Plan:
helm-go PR #1302, sections 6-9.

## Summary

| Question                                                   | Result                                                                                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Can the container enrol as a `jfp` device?                 | **Yes.** `Account type: Team`, `Organization: jfp`, `Connected`.                                                          |
| Does only proxied traffic use WARP?                        | **Yes.** Via the container, SOCKS5 and HTTP CONNECT, `cdn-cgi/trace` shows `warp=on gateway=on`. The host is untouched.   |
| Do the Aurora endpoints resolve to prod/stage private IPs? | **Yes.** prod `<prod-aurora-ip>`, stage `<stage-aurora-ip>`.                                                              |
| Is Postgres reachable on 5432?                             | **No.** TCP connects, then the connection is closed or reset before Postgres answers. The host's own WARP does the same.  |
| Do `*.service.internal` names resolve?                     | **Not shown.** `api-users.service.internal` returns NXDOMAIN-style `getent` rc=2. No real hostname was found (see below). |
| Does the AWS side reject the container egress?             | **Not shown.** Postgres is never reached, so the security group was not tested.                                           |

The container itself works. The blocker is on the path to Aurora, and it is
identical from the host's WARP, so it is not specific to the container.

## What connected

- Enrolment through `enroll.sh` (temporary `com.cloudflare.warp://` handler). The
  previous handler state was restored afterwards: default is `warp-cli.desktop`,
  no `warp-container-enroll.desktop`, no line added to `~/.config/mimeapps.list`.
- Egress: container, host SOCKS5 (`127.0.0.1:11080`) and host HTTP CONNECT all
  report `warp=on gateway=on`.
- DNS inside the container goes through WARP's stub (`127.0.2.2`, `127.0.2.3`)
  and resolves both Aurora cluster endpoints to private IPs.
- Routing reaches the VPC: a nonexistent address (`<unused-ip-next-to-it>`) fails with
  `No route to host`, while the real Aurora IPs complete a TCP connect.
- Compose stack: `warp` is healthy; `pgfwd` forwards `:15432` and `:15433`
  inside the WARP netns. Both published on `127.0.0.1` only.

## What failed

### Postgres on 5432 (prod and stage)

TCP completes, then nothing answers. A Postgres server replies `S` or `N` to an
`SSLRequest`; here the peer closes within 0.1-0.3 s.

```
python SOCKS5 -> <prod-aurora-ip>:5432 + SSLRequest   reply=b''  (0.1s)
python SOCKS5 -> <stage-aurora-ip>:5432 + SSLRequest  reply=b''  (0.1s)
pgfwd: socat[9] E read(5, ...): Connection reset by peer
./verify.sh: FAIL pg_isready 127.0.0.1:15432  -> "no response"
```

**Control:** the same probe from the host (no proxy, through the host's WARP)
fails the same way: `ConnectionResetError(104, 'Connection reset by peer')` in
0.1-0.2 s for both IPs. So this is not caused by the container, its
enrolment, MTU or the proxy layer.

Other things ruled out:

- **MTU:** setting `CloudflareWARP` to 1200 changed nothing (reverted to 1280).
- **Plain TCP is not evidence:** a TCP connect to a VPC resolver address on port 53 also succeeds
  and then resets on read, so Gateway completes the handshake itself. That is
  why `verify.sh` now does a Postgres-level handshake and not only a connect.

I cannot tell from the client side which of these causes it:

1. a Gateway network policy that blocks TCP 5432 for this identity;
2. the Tunnel (cloudflared) not allowed to reach the Aurora security group, so
   the connection is refused at the VPC edge;
3. the intended path to the databases being something else (bastion).

### `*.service.internal`

`getent hosts api-users.service.internal` returns rc=2 in the container. This
name was a guess from the plan, not a confirmed hostname.
`~/scripts/warp-endpoints.sh api-gateway` was run to find a real one and
failed: `Doppler Error: Could not find requested config 'prd'`. No
`*.service.internal` hostname was found, and none is invented here.

## Observations

- The client reports mode `WarpWithDnsOverHttps` (Traffic-and-DNS) and tunnel
  protocol `WireGuard`, with `Allow Mode Switch: false`. Compose does not set
  the mode; it comes from the device policy, and matches the plan.
- `verify.sh` reproduces the egress, DNS, TCP and Postgres-handshake results.
  The `No route to host` on `<unused-ip-next-to-it>`, the MTU 1200 experiment and the host
  control probe were one-off manual checks: a bash `/dev/tcp` connect in the
  container, `ip link set ... mtu 1200`, and the same `SSLRequest` sent from the
  host without the proxy.
- The container runs inside the host's WARP (double tunnel): the host's
  `10.8.0.0/13 dev CloudflareWARP` route covers both VPCs. Earlier PMTU probes
  in the container log failed at 1353-1264 bytes; no stall was seen at 1280.
- The bastion allowlists individual IPs. It was not tested: Postgres is not
  reachable, and no bastion host or address was provided.

## Ask the Zero Trust admin

1. Is TCP 5432 to the prod and stage Aurora subnets allowed by a Gateway
   network policy for the operator's identity? Is a Block rule matching it?
   (Gateway logs for source `<prod-aurora-ip>` / `<stage-aurora-ip>` would show it.)
2. Do the Tunnel routes for `10.10.0.0/16` and `10.11.0.0/16` have a
   cloudflared that can reach the Aurora security groups on 5432?
3. Is direct Postgres through WARP meant to work at all, or is the bastion the
   intended path? If direct is intended, which identity or posture rule applies?
4. Does the device profile for this identity force `WarpWithDnsOverHttps` /
   WireGuard, and what is the real name of a `*.service.internal` host?

## Safety and side effects

- The host `warp-svc` stayed `active`; host `warp-cli status` stayed
  `Connected`; `ip rule` and the table 65743 route are identical to the
  recorded baseline. No sudo, nftables or systemd changes on the host.
- During `enroll.sh` testing, a sandbox run with a fake
  `com.cloudflare.warp://` URL reached the host's real default handler and ran
  the **host** `warp-cli ... registration token <fake>`. The host refused it
  ("Old registration is still around") and was verified unchanged.
- `enroll.sh` deletes the container's consumer registration (the one the upstream
  entrypoint creates on first start) before registering with `jfp`.
- `.env` could not be written by the agent (a permission rule covers it), so the
  Aurora endpoints were passed through the environment when running
  `docker compose up -d` and `./verify.sh`. Endpoints are hostnames only.
- Container-side `ip link set ... mtu 1200` was a temporary change, reverted.
