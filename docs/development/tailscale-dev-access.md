# Tailscale dev-server access

Share your local `journeys`, `journeys-admin`, and `api-gateway` over the
Tailscale tailnet so you (or a teammate) can hit them from a phone, tablet, or
another machine without ngrok, without exposing them publicly, and without a
prod cert. This unblocks real mobile-device QA without leaving the laptop.

## Why this exists

- Cross-device QA over HTTP, no ngrok tunnel, no public exposure.
- The repo opts in to a single hostname prefix — `tailscale-*` — that the
  middleware, Apollo client, redirect allow-list, and gateway CORS recognise
  as a dev-only origin.
- Zero per-developer env vars after the initial setup.

## Prerequisites

- A Tailscale account that's joined to the JFP tailnet (ask in the team
  channel for an admin invite if you don't have one yet).
- The Tailscale macOS / Linux / Windows client installed
  (https://tailscale.com/download).
- Local stack already runs on `localhost:4100` (journeys), `localhost:4200`
  (journeys-admin), `localhost:4000` (api-gateway).

## Step 1 — Install Tailscale and join the tailnet

```sh
brew install --cask tailscale
```

Sign in with your work account. Accept the invite in the Tailscale admin
console.

> Screenshot TBD — Tailscale sign-in flow with the JFP tailnet selected.

## Step 2 — Rename your device to `tailscale-<initials>-<machine>`

Open the Tailscale admin console at https://login.tailscale.com/admin/machines,
locate your device, click the three-dot menu, and choose "Edit machine name".
Use the pattern `tailscale-<initials>-<machine>` — for example
`tailscale-mbp-siyang`.

This prefix is the contract: the repo's middleware, Apollo client, redirect
allow-list, and gateway CORS only relax their dev-mode checks for hostnames
that start with `tailscale-`.

> Screenshot TBD — admin console "Edit machine name" dialog.

## Step 3 — Enable MagicDNS

In the admin console go to **DNS** and enable **MagicDNS**. With MagicDNS
on, every device on the tailnet can address every other by the short
hostname (e.g. `http://tailscale-mbp-siyang:4100`).

> Screenshot TBD — DNS tab with MagicDNS toggled on.

## Step 4 — Verify connectivity

From the device you want to test on (phone, second laptop), ping your dev
machine over the tailnet:

```sh
ping tailscale-mbp-siyang
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

Once the code in this guide's PR has landed, no env-var changes are
required — load `http://tailscale-mbp-siyang:4100/` (or `:4200`) from
your phone and you're in.

> Screenshot TBD — iOS Safari loading `http://tailscale-mbp-siyang:4100/`
> rendering the journeys home page.

### Step 5a — Workaround before the PR merges

If you need this working *today* before this PR ships, set both env vars
in `.env.local` for each app:

```sh
# apps/journeys-admin/.env.local
NEXT_PUBLIC_GATEWAY_URL=http://tailscale-mbp-siyang:4000

# apps/journeys/.env.local
GATEWAY_URL=http://tailscale-mbp-siyang:4000
```

You'll also need to manually toggle the middleware host check off, or hit
`/home` directly to skip the catch-all route. The PR removes both
workarounds.

## Step 6 — Testing other apps over Tailscale

The other Next.js apps in this monorepo (`watch`, `videos-admin`,
`arclight`, `resources`, `short-links`, `cms`) read
`NEXT_PUBLIC_GATEWAY_URL` directly with no localhost fallback, so they
fail-closed when the env var is unset. To test any of them over the
tailnet, point that one env var at your tailnet gateway in the app's
`.env.local`:

```sh
NEXT_PUBLIC_GATEWAY_URL=http://tailscale-mbp-siyang:4000
```

`short-links` is exercised by journeys/journeys-admin's QR-code dialog
(see code below), so the same env var change is enough for that path.

## Troubleshooting

### "Blocked cross-origin request" in dev-server stdout

The `allowedDevOrigins: ['tailscale-*']` entry in `apps/journeys/next.config.js`
and `apps/journeys-admin/next.config.js` should suppress this. If you're seeing
it, you're probably loading the app over an IP address (e.g. `100.x.y.z`) instead
of the MagicDNS hostname. Use the hostname.

### Phone can ping the dev machine but the browser hangs

Check that the api-gateway is actually listening on `0.0.0.0`:

```sh
lsof -nP -iTCP:4000 -sTCP:LISTEN
```

If you see `127.0.0.1:4000` instead of `*:4000`, set `host: '0.0.0.0'`
explicitly in `apis/api-gateway/src/common.config.ts` and restart.

### Sign-in redirect bounces to `localhost`

The redirect-allow-list in `apps/journeys-admin/src/libs/auth/getAuthTokens.ts`
accepts `tailscale-*` hosts in dev. If the redirect still fails, confirm
`NODE_ENV !== 'production'` in your dev environment (the production gate
deliberately rejects `tailscale-*` redirects).

### GraphQL requests fail with CORS error

The gateway CORS allow-list in `apis/api-gateway/gateway.prod.config.ts`
adds a `tailscale-*` regex when `NODE_ENV !== 'production'`. If you're
testing against a stage gateway, the regex is also active there. For
production builds the regex is omitted.

### HTTPS / Tailscale Funnel

HTTPS over Tailscale Funnel is **not** supported by this setup — the
gateway CORS regex only accepts `http://tailscale-...`. If you need
Funnel support, widen the regex and the Apollo derivation to accept
`https://` too; that's deliberately out of scope for the first
iteration.

## Screenshots TBD

The following screenshots are placeholders to be captured during the
first dogfood pass. Replace this section with embedded images:

1. Tailscale sign-in / tailnet selection.
2. Admin console — renaming a machine to `tailscale-mbp-siyang`.
3. Admin console — DNS tab with MagicDNS enabled.
4. iOS Safari rendering `http://tailscale-mbp-siyang:4100/`.
