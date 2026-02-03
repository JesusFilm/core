# Codex Local Environment Scripts

This directory provides the Codex worktree setup flow and Option A (shared DB via Docker Compose) for host-native macOS runs.

Option A summary:
The shared Postgres container runs via `docker-compose.db.yml` and exposes a host port so all Codex worktrees connect with `localhost:<port>`.

**Prerequisites**
- Docker Desktop
- Node.js + pnpm
- `nx` available via `pnpm exec nx`
- Doppler CLI (only required if you need secrets fetch)

**First-Time Setup**
1. Authenticate with Doppler if needed: `doppler login`
2. Create a Codex worktree and set the setup command to `./run/codex/setup.sh`
3. Start the shared DB: `./run/codex/db-up.sh`
4. Run migrations + seeds: `./run/codex/db-fast.sh`

**Recommended Codex Actions**
- `DB: up` -> `./run/codex/db-up.sh`
- `DB: down` -> `./run/codex/db-down.sh`
- `DB: migrate + seed` -> `./run/codex/db-fast.sh`
- `Secrets: fetch (dev)` -> `DOPPLER_CONFIG=dev nx run-many --all --target=fetch-secrets`
- `Start: backend (nf start)` -> `nf start`
- `Start: journeys` -> `nx run journeys:serve:development`
- `Start: watch` -> `nx run watch:serve:development`
- `Verify` -> `./run/codex/verify.sh`

**Notes**
- `setup.sh` is intentionally non-blocking if the DB is not running.
- Host-native Prisma uses `localhost` via `.env.local` overrides created by setup.
- `.env.local` is ignored by git and safe to edit for local overrides.
- Full data import (slow, recommended on main): `./run/codex/db-full.sh`

**Troubleshooting**
- `db` host does not resolve:
  Run DB steps on host using `localhost:<port>` and `.env.local` overrides. The `db` hostname is only for devcontainer networking.
- Port conflict on `5432`:
  Update `CODEX_DB_PORT` in `.env.local`, then restart with `./run/codex/db-down.sh` and `./run/codex/db-up.sh`.
- Reset DB (destructive):
  `docker compose -f docker-compose.db.yml down -v` then `./run/codex/db-up.sh`
- Missing databases after a port/volume change:
  The container initializes DBs on first boot via `run/codex/db-init.sql`. If you reused an old volume, reset the DB volume.
