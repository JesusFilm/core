#!/usr/bin/env bash
# Probe what the warp-prod container can reach. Read-only; prints PASS/FAIL per check.
# Usage: ./verify.sh [prod-ip] [stage-ip]   (private IPs inside 10.10.0.0/16 / 10.11.0.0/16)
set -uo pipefail

container="${WARP_CONTAINER:-warp-prod}"
port="${WARP_PROXY_PORT:-11080}"
in_ctr() { docker exec "$container" "$@"; }
check() { # name command...
  local name="$1"; shift
  if out=$("$@" 2>&1); then echo "PASS $name"; else echo "FAIL $name"; fi
  printf '%s\n' "$out" | sed 's/^/     /' | head -6
}

echo "== client"
in_ctr warp-cli --version
in_ctr warp-cli --accept-tos status
in_ctr warp-cli --accept-tos registration show | sed -n '1,4p'
in_ctr warp-cli --accept-tos settings | grep -E 'Mode|protocol|Split|Exclude|Include|Fallback' | head -8

echo "== egress"
check "container sees warp=on gateway=on" bash -c \
  "docker exec $container curl -fsS -m 10 https://www.cloudflare.com/cdn-cgi/trace | grep -E '^(warp|gateway)='"
check "host via SOCKS5 sees warp=on" bash -c \
  "curl --socks5-hostname 127.0.0.1:$port -fsS -m 10 https://www.cloudflare.com/cdn-cgi/trace | grep -E '^(warp|gateway)='"
check "host via HTTP CONNECT sees warp=on" bash -c \
  "curl -x http://127.0.0.1:$port -fsS -m 10 https://www.cloudflare.com/cdn-cgi/trace | grep -E '^(warp|gateway)='"

echo "== names"
check "getent api-users.service.internal" in_ctr getent hosts api-users.service.internal
for h in "${PROD_PG_ENDPOINT:-}" "${STAGE_PG_ENDPOINT:-}"; do
  [ -n "$h" ] && check "getent $h" in_ctr getent hosts "$h"
done

# A TCP connect alone proves little: Gateway completes the handshake itself and
# resets afterwards. A Postgres server answers an SSLRequest with 'S' or 'N'.
pg_handshake() { # host-or-ip, through the SOCKS5 proxy
  python3 -I - "$1" "$port" <<'EOF'
import socket, struct, sys
target, proxy_port = sys.argv[1], int(sys.argv[2])
s = socket.create_connection(("127.0.0.1", proxy_port), timeout=15)
s.sendall(b"\x05\x01\x00")
assert s.recv(2) == b"\x05\x00", "SOCKS5 greeting refused"
s.sendall(b"\x05\x01\x00\x03" + bytes([len(target)]) + target.encode() + struct.pack("!H", 5432))
rep = s.recv(10)
assert rep[1] == 0, f"SOCKS5 connect failed (reply {rep[1]})"
s.sendall(struct.pack("!II", 8, 80877103))
s.settimeout(10)
reply = s.recv(1)
assert reply in (b"S", b"N"), f"no Postgres reply to SSLRequest (got {reply!r})"
print("postgres answered", reply.decode())
EOF
}

echo "== private reachability (TCP 5432 + Postgres handshake)"
for ip in "$@"; do
  check "tcp $ip:5432" in_ctr bash -c "timeout 5 bash -c '</dev/tcp/$ip/5432'"
  check "postgres handshake $ip:5432" pg_handshake "$ip"
done
for var in PROD_PG_ENDPOINT STAGE_PG_ENDPOINT; do
  h="${!var:-}"
  [ -z "$h" ] && continue
  check "tcp $h:5432 (in container)" in_ctr bash -c "timeout 5 bash -c '</dev/tcp/$h/5432'"
  check "postgres handshake $h:5432" pg_handshake "$h"
done

echo "== forwarders (host loopback)"
for p in 15432 15433; do
  check "pg_isready 127.0.0.1:$p" pg_isready -h 127.0.0.1 -p "$p" -t 5
done

echo "== host untouched"
ip rule; ip route get 10.10.1.5
