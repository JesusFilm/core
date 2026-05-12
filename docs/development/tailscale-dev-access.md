# Tailscale dev-server access

> **Note:** Screenshots will be added in a follow-up — the steps below are accurate as text.

Share your local `journeys`, `journeys-admin`, and `api-gateway` over the
Tailscale tailnet so you (or a teammate) can hit them from a phone, tablet, or
another machine without ngrok, without exposing them publicly, and without a
prod cert. This unblocks real mobile-device QA without leaving the laptop.

## Why this exists

- Cross-device QA over HTTP, no ngrok tunnel, no public exposure.
- The repo opts in to a **Doppler-managed allow-list of dev hostnames**. The
  middleware, Apollo client, redirect allow-list, Next.js `allowedDevOrigins`,
  and gateway CORS read that list and relax their checks only for hostnames
  that appear in it.
- Naturally safe in stage / prod: the secret only exists in dev's Doppler
  config, so the helpers return `[]` everywhere else and no relaxation
  happens. **Absence of the secret IS the gate; no `NODE_ENV` checks
  anywhere.**

## How the gate works

Two Doppler env vars in the **`core` project, `dev` config** drive everything:

| Env var                  | Consumer                   | Notes                                |
| ------------------------ | -------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_DEV_HOSTS`  | Next.js apps (browser + SSR) | `NEXT_PUBLIC_` prefix so it ships to the bundle. |
| `DEV_HOSTS`              | `api-gateway` (server only)  | No `NEXT_PUBLIC_` prefix — never reaches the browser. |

Both hold the **same JSON** — an object whose values are the FQDNs to allow.
Keys are arbitrary labels (we use developer initials) and exist only to make
the JSON readable in Doppler's UI.

```json
{
  "siyang": "tailscale-dev-siyang.taila2a609.ts.net",
  "mike": "tailscale-dev-mike.taila2a609.ts.net"
}
```

Hostnames can be anything — they just need to match the FQDN your device
exposes on the tailnet. Full FQDNs (the form Tailscale MagicDNS emits when
the `tailnet-name.ts.net` suffix is enabled) are recommended for clarity, but
any string the helper sees in `window.location.hostname` / `req.headers.host`
will work.

Missing var, empty string, malformed JSON, or a non-object payload → the
helpers return `[]` → no relaxation. Fail-closed by default.

## Prerequisites

- A Tailscale account that's joined to the JFP tailnet (ask in the team
  channel for an admin invite if you don't have one yet).
- The Tailscale macOS / Linux / Windows client installed
  (https://tailscale.com/download).
- Local stack already runs on `localhost:4100` (journeys), `localhost:4200`
  (journeys-admin), `localhost:4000` (api-gateway).
- Doppler CLI installed and authenticated against the `core` project.

## Step 1 — Install Tailscale and join the tailnet

```sh
brew install --cask tailscale
```

Sign in with your work account. Accept the invite in the Tailscale admin
console.

## Step 2 — Enable MagicDNS and note your FQDN

In the Tailscale admin console (https://login.tailscale.com/admin/dns)
enable **MagicDNS**. With MagicDNS on, every device on the tailnet can
address every other by name.

Your device's FQDN looks like `<machine-name>.<tailnet-suffix>` — e.g.
`tailscale-dev-siyang.taila2a609.ts.net`. You can find it in the Tailscale
admin console under **Machines**, or by running `tailscale status` locally.

## Step 3 — Add your entry to Doppler

In the **`core` project, `dev` config**, edit both `NEXT_PUBLIC_DEV_HOSTS`
and `DEV_HOSTS` to include your FQDN:

```json
{
  "siyang": "tailscale-dev-siyang.taila2a609.ts.net",
  "<your-initials>": "<your-fqdn>"
}
```

Keep the two vars in sync. If `NEXT_PUBLIC_DEV_HOSTS` lists your host but
`DEV_HOSTS` doesn't, the page will load over the tailnet but every GraphQL
request will be rejected by gateway CORS.

## Step 4 — Verify connectivity

From the device you want to test on (phone, second laptop), ping your dev
machine over the tailnet:

```sh
ping <your-fqdn>
```

Or on iOS / Android, open the Tailscale app and confirm your dev machine
appears under "Machines" with a green "Connected" status.

## Step 5 — Run the stack

On your dev machine, start the apps as usual:

```sh
nx serve api-gateway
nx serve journeys
nx serve journeys-admin
```

The api-gateway already binds to `0.0.0.0` by default (Hive Gateway's
default on macOS and Linux), so it's reachable over the tailnet
without any extra configuration. Next.js dev server also binds to all
interfaces by default.

Load `http://<your-fqdn>:4100/` (or `:4200`) from your phone and you're in.

## Step 6 — Testing other apps over Tailscale

The other Next.js apps in this monorepo (`watch`, `videos-admin`,
`arclight`, `resources`, `short-links`, `cms`) read
`NEXT_PUBLIC_GATEWAY_URL` directly with no localhost fallback, so they
fail-closed when the env var is unset. To test any of them over the
tailnet, point that one env var at your tailnet gateway in the app's
`.env.local`:

```sh
NEXT_PUBLIC_GATEWAY_URL=http://<your-fqdn>:4000
```

`short-links` is exercised by journeys/journeys-admin's QR-code dialog,
so the same env var change is enough for that path.

## Troubleshooting

### "Blocked cross-origin request" in dev-server stdout

The `allowedDevOrigins` entry in `apps/journeys/next.config.js` and
`apps/journeys-admin/next.config.js` reads `NEXT_PUBLIC_DEV_HOSTS` at
process start. If you're seeing the message, check:

- The dev server was started **after** the Doppler update — Next.js
  reads env at boot, not per-request.
- The hostname in your URL matches the FQDN you put in Doppler **exactly**
  (matching is case-sensitive).
- You're loading via the MagicDNS hostname, not the raw `100.x.y.z` IP.

### Phone can ping the dev machine but the browser hangs

Check that the api-gateway is actually listening on `0.0.0.0`:

```sh
lsof -nP -iTCP:4000 -sTCP:LISTEN
```

If you see `127.0.0.1:4000` instead of `*:4000`, set `host: '0.0.0.0'`
explicitly in `apis/api-gateway/src/common.config.ts` and restart.

### Sign-in redirect bounces to `localhost`

The redirect-allow-list in `apps/journeys-admin/src/libs/auth/getAuthTokens.ts`
accepts hosts listed in `NEXT_PUBLIC_DEV_HOSTS`. If the redirect still
fails, confirm your FQDN is in the JSON and the dev server was restarted
after the Doppler change.

### GraphQL requests fail with CORS error

The gateway CORS allow-list in `apis/api-gateway/gateway.prod.config.ts`
builds one regex per host listed in `DEV_HOSTS` (server-side env, no
`NEXT_PUBLIC_` prefix). If you're getting CORS errors, your FQDN is
probably in `NEXT_PUBLIC_DEV_HOSTS` (so the page loaded) but not in
`DEV_HOSTS` (so the gateway rejects the request). Add it to both.

### HTTPS / Tailscale Funnel

HTTPS over Tailscale Funnel is **not** supported by this setup — the
gateway CORS regex only accepts `http://<fqdn>`. If you need Funnel
support, widen the regex generator in `gateway.prod.config.ts` to emit
an `https?` alternation; that's deliberately out of scope for the first
iteration.
