#!/bin/sh
# Forward fixed local ports to the private Aurora endpoints. Runs in the WARP
# container's netns, so the dial-out (and the DNS lookup) goes through WARP.
set -eu

started=0

forward() {
  port="$1"
  endpoint="$2"
  [ -n "$endpoint" ] || return 0
  echo "forwarding :$port -> $endpoint:5432"
  socat "TCP-LISTEN:$port,fork,reuseaddr" "TCP:$endpoint:5432" &
  started=1
}

forward 15432 "${PROD_PG_ENDPOINT:-}"
forward 15433 "${STAGE_PG_ENDPOINT:-}"

if [ "$started" -eq 0 ]; then
  echo "set PROD_PG_ENDPOINT and/or STAGE_PG_ENDPOINT (see .env.example)" >&2
  exit 1
fi

# PID 1 gets no default SIGTERM action; stop the forwarders so `compose down` is quick.
trap 'kill $(jobs -p) 2>/dev/null; exit 0' TERM INT
wait
