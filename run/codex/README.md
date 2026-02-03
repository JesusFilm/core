# Codex Local Environment Scripts

These scripts mirror the existing local dev docs so Codex worktrees can bootstrap quickly and repeatably.

Common usage:

- Setup (fast bootstrap): `./run/codex/setup.sh`
- Fetch secrets (dev): `./run/codex/secrets.sh dev`
- Fetch secrets (stg_dev frontend-only): `./run/codex/secrets.sh stg_dev`
- Fast DB setup (no data import): `./run/codex/db-fast.sh`
- Full data import (slow, recommended on main): `./run/codex/db-full.sh`
