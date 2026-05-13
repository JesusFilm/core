# Tailscale dev-server access

> **Note:** Screenshots will be added in a follow-up — the steps below are accurate as text.

## What this gives you

When you run `journeys` / `journeys-admin` locally, they normally only listen on `localhost` — so you can't preview them on a real phone, hand a designer a clickable dev preview, or test mobile flows without ngrok. Tailscale puts your machine on a private network with a stable hostname (e.g. `tailscale-dev-<your-name>.tailXXXXX.ts.net`), and you can hit your local dev servers from any device signed in to the same Tandem Tailnet.

NES-1659 wired the codebase to recognise those hostnames as valid dev origins. The middleware, Apollo client, redirect allow-list, and Next.js `allowedDevOrigins` all consult a shared list (`DEV_HOSTS` in Doppler) and only relax their checks for hostnames in that list. **Localhost development is unaffected** — each consumer keeps its own existing localhost handling (strict allow-lists, hardcoded fallbacks) independent of the Doppler list, so the dev stack works exactly the same as before NES-1659 if you don't opt in. In stage and prod the secret doesn't exist, so the helpers return `[]` everywhere outside dev — absence of the env var IS the gate; no `NODE_ENV` checks anywhere.

## How the gate works

There's **one** secret with the JSON allow-list, and it lives in the **`core` project, `dev` config** as `DEV_HOSTS`. The per-app Doppler configs (`journeys.dev.NEXT_PUBLIC_DEV_HOSTS`, `journeys-admin.dev.NEXT_PUBLIC_DEV_HOSTS`) are cross-project references to that single source — so when you edit `core.dev.DEV_HOSTS`, every consumer picks up the new value automatically on its next `fetch-secrets`. You only edit one place.

The `NEXT_PUBLIC_` prefix on the journeys / journeys-admin side is what causes Next.js to inline the value into the browser bundle (server-side env doesn't reach the client otherwise). The bare `DEV_HOSTS` in `core` is the canonical name; the prefixed variants are scoped projections of it.

The JSON is an object whose **values** are the FQDNs to allow. Keys are arbitrary developer labels (initials work fine) — they're just there to make the JSON readable in Doppler's UI:

```json
{
  "alice": "tailscale-dev-alice.tailXXXXX.ts.net",
  "bob": "tailscale-dev-bob.tailXXXXX.ts.net",
  "you": "tailscale-dev-<your-name>.tailXXXXX.ts.net"
}
```

Multiple teammates merge into the same JSON — when you add yourself, copy the existing value, add your entry, save back. Coordinate in Slack if two of you are editing simultaneously.

The shared helper that reads this lives at `libs/shared/dev-hosts/` (importable as `@core/shared/dev-hosts`). Missing var, empty string, malformed JSON, or a non-object payload all yield `[]` → no relaxation. Fail-closed by default.

The api-gateway doesn't appear in the diagram — its dev config (`apis/api-gateway/gateway.config.ts`) sets no CORS allow-list, so Yoga's default kicks in and echoes any origin. The gateway will accept GraphQL requests from your Tailscale-served apps with no extra setup.

## Prerequisites

- A Tailscale account joined to the Tandem Tailnet (ask in the team channel for an admin invite if you don't have one yet).
- The Tailscale macOS / Linux / Windows client installed.
- Local stack already runs on `localhost:4100` (journeys), `localhost:4200` (journeys-admin), `localhost:4000` (api-gateway).
- Doppler CLI installed and authenticated.

## Setup

### 1. Sign up for Tailscale

Free tier works fine for personal Tailnet membership (no payment needed for personal use within Tandem's Tailnet). Sign up at https://tailscale.com if you don't already have an account.

### 2. Install the Mac client

```sh
brew install --cask tailscale
```

Run the app from `/Applications` once to authenticate. Sign in with your work account and accept the invite to the Tandem Tailnet.

### 3. Set your machine hostname

In the Tailscale admin console (https://login.tailscale.com/admin/machines), rename your machine to a predictable name. **Convention:** `tailscale-dev-<firstname>`. Tailscale will give you a FQDN like `tailscale-dev-<your-name>.tailXXXXX.ts.net` (the `tailXXXXX` segment is your Tailnet's stable identifier — same for everyone on the Tandem Tailnet).

If MagicDNS isn't already on for the Tailnet, enable it at https://login.tailscale.com/admin/dns — without MagicDNS, you'll be stuck addressing devices by IP.

Verify locally with `tailscale status` — it shows your machine's FQDN.

### 4. Add the FQDN to Doppler

One edit only: the `core` project, `dev` config, secret `DEV_HOSTS`. The other projects already reference this one, so they update automatically.

1. Open the `core` project in the Doppler dashboard.
2. Switch to the `dev` config.
3. Edit `DEV_HOSTS`. Copy the current JSON, add your entry, save:
   ```json
   {
     "alice": "tailscale-dev-alice.tailXXXXX.ts.net",
     "you": "tailscale-dev-<your-name>.tailXXXXX.ts.net"
   }
   ```

If you accidentally land in the `journeys` / `journeys-admin` Doppler projects, you'll see `NEXT_PUBLIC_DEV_HOSTS` already populated with the same value — that's the cross-project reference at work. Don't edit those directly; edit `core` and let the references resolve.

### 5. Add the FQDN to Firebase Authorized Domains

Firebase Auth rejects sign-in attempts from hostnames not on its allow-list. Add yours:

1. Firebase Console → Authentication → Settings → Authorized domains
2. **Add domain** → paste the **full FQDN** (e.g. `tailscale-dev-<your-name>.tailXXXXX.ts.net`)
3. Save

Firebase rejects bare hostnames like `tailscale-dev-<your-name>` — you must paste the full `.tailXXXXX.ts.net` form. (Past pain point — get this exactly right.)

### 6. Re-fetch secrets

In your dev container (or wherever you run `nx fetch-secrets`):

```sh
nx fetch-secrets journeys
nx fetch-secrets journeys-admin
```

This pulls the freshly updated Doppler values into each app's `.env`. Next.js reads env at process start, so make sure you re-run `fetch-secrets` **before** starting the dev servers — restarting an already-running dev server is necessary if you changed Doppler after boot.

### 7. Run the stack and hit it from another device

Start as normal:

```sh
nf start                  # all backends (gateway + APIs)
nx serve journeys         # in another shell
nx serve journeys-admin   # in another shell
```

The api-gateway binds to `0.0.0.0` by default (Hive Gateway default on macOS/Linux). The Next.js dev server binds to all interfaces by default. So they're already reachable over the tailnet — no extra config.

From any device signed in to the Tandem Tailnet (your phone, another laptop, a teammate's iPad), browse to:

| App            | URL                       |
| -------------- | ------------------------- |
| journeys       | `http://<your-fqdn>:4100` |
| journeys-admin | `http://<your-fqdn>:4200` |

Substitute your FQDN — e.g. `http://tailscale-dev-<your-name>.tailXXXXX.ts.net:4100`.

## Removal / opt-out

To stop exposing your dev server over the tailnet, **either**:

- Remove your entry from `core.dev.DEV_HOSTS` in Doppler. One edit, all consumers update. Other developers' entries stay in place.
- Or just run `tailscale down` to leave the Tailnet — your machine becomes unreachable to teammates' devices, but the code keeps working locally.

Either way nothing breaks. Each consumer (Apollo client, redirect allow-list, etc.) keeps its own localhost handling independent of the Doppler list, so the dev stack works exactly as it did before NES-1659 once your FQDN is gone.

## Testing other apps over Tailscale

The other Next.js apps in this monorepo (`watch`, `videos-admin`, `arclight`, `resources`, `short-links`, `cms`) read `NEXT_PUBLIC_GATEWAY_URL` directly with no localhost fallback, so they fail-closed when the env var is unset. To test any of them over the tailnet, point that one env var at your tailnet gateway in the app's `.env.local`:

```sh
NEXT_PUBLIC_GATEWAY_URL=http://<your-fqdn>:4000
```

`short-links` is exercised by the journeys/journeys-admin QR-code dialog, so the same env var change is enough for that path.

## Troubleshooting

### Firebase: "Unauthorized domain" on sign-in

You forgot to add the FQDN to Firebase's Authorized Domains list, or you added the bare hostname instead of the full `*.tail*.ts.net` form. Re-check step 5 — bare hostnames are rejected, you need the full FQDN.

### `tailscale up` hangs / Cloudflare WARP conflict

If Cloudflare WARP is running, Tailscale's network connection can hang at startup. Disable WARP (`warp-cli disconnect` or toggle off via the menu bar app) and retry `tailscale up`. Both tools fight over network routes and can't run simultaneously.

### "Blocked cross-origin request" in dev-server stdout

The `allowedDevOrigins` entry in `apps/journeys/next.config.js` and `apps/journeys-admin/next.config.js` reads `NEXT_PUBLIC_DEV_HOSTS` at process start. If you're seeing this message:

- The dev server was started **before** you re-fetched secrets after the Doppler update — re-fetch secrets and restart.
- The hostname in your URL matches the FQDN in Doppler **exactly** (matching is case-sensitive).
- You're loading via the MagicDNS hostname, not the raw `100.x.y.z` IP.

### MagicDNS short names don't reach Firebase auth

Short names (`tailscale-dev-<your-name>`) work for browser navigation when MagicDNS is on, but Firebase requires the full FQDN. Use the full `.tailXXXXX.ts.net` form whenever auth is involved.

### Phone can ping the dev machine but the browser hangs

Check that the api-gateway is actually listening on `0.0.0.0`:

```sh
lsof -nP -iTCP:4000 -sTCP:LISTEN
```

If you see `127.0.0.1:4000` instead of `*:4000`, set `host: '0.0.0.0'` explicitly in `apis/api-gateway/src/common.config.ts` and restart.

### Sign-in redirect bounces to `localhost`

The redirect-allow-list in `apps/journeys-admin/src/libs/auth/getAuthTokens.ts` accepts hosts listed in `NEXT_PUBLIC_DEV_HOSTS`. If the redirect still fails, confirm your FQDN is in the JSON (in `core.dev.DEV_HOSTS`) and that you've re-fetched secrets + restarted the dev server.

### Don't put `DEV_HOSTS` in a local `.env` and call it done

`DEV_HOSTS` is shared infrastructure via the `core` Doppler project. If you hard-code your FQDN in a local `.env.local`, it only works for you — and on next `fetch-secrets` you'll lose your local edit. Edit `core.dev.DEV_HOSTS` in Doppler so the value propagates through the references and everyone stays in sync.
