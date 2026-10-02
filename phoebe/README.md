# Phoebe on core: operator runbook

Phoebe is an AFK coding agent (engine: [JesusFilm/phoebe](https://github.com/JesusFilm/phoebe), npm `phoebe-agent`). This directory is core's consumer-owned deployment of it: one Docker container that clones core privately, works tagged issues on `phoebe/issue-N` branches, runs the repo gates, and opens pull requests. Your host checkout is never touched.

This file holds the concrete values for **this** deployment. The engine's general manual is [`docs/operating.md`](https://github.com/JesusFilm/phoebe/blob/main/docs/operating.md) in the Phoebe repo; it is written against config field names, which are resolved here.

## Concrete values

| Field (engine default)           | Value on core                                    | Meaning                                                                                                                                                                                   |
| -------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `readyLabel` (`ready-for-agent`) | **`phoebe:ready`**                               | Only issues wearing this are worked. Overridden because `ready-for-agent` is core's shared triage label.                                                                                  |
| `processingLabel` (default)      | `processing`                                     | Phoebe's own "in flight" marker. Never apply it by hand.                                                                                                                                  |
| `prOptOutLabel` (default)        | `ready-for-human`                                | Put this on a PR to make Phoebe leave it alone.                                                                                                                                           |
| `researchLabel` (default)        | `wayfinder:research`                             | Open issues with this are worked by the `research` kind (wayfinder resolution protocol).                                                                                                  |
| `featureLabel` (default)         | `phoebe:feature`                                 | On a parent issue: children land on one feature branch. Not in use yet.                                                                                                                   |
| `branchPrefix` (`phoebe/`)       | **`cursor/phoebe-`**                             | Phoebe branches: `cursor/phoebe-issue-N`. The engine fixes the `issue-N` part; core's branch-name lint rejects `phoebe/issue-N`, and `cursor/.*` is the pattern's arm for agent branches. |
| `prScope` (default)              | `phoebe`                                         | Janitor kinds only maintain Phoebe's own PRs.                                                                                                                                             |
| `workOrder` (default)            | conflicts → checks → reviews → issues → research | Order tried each cycle. Janitor kinds run in persistent mode only.                                                                                                                        |
| `engine.ref`                     | `v0.13.2`                                        | Pinned engine. Upgrade = edit this line; the running container relaunches on it.                                                                                                          |
| Provider                         | `claude` via `CLAUDE_CODE_OAUTH_TOKEN` (`.env`)  | Claude Code on a Pro/Max subscription token, not an API key. Cursor is also in the image.                                                                                                 |
| GitHub identity                  | `GH_TOKEN` in `.env`                             | PRs, branches and comments appear as the token's account (siyang-bot).                                                                                                                    |
| `gitIdentity`                    | siyang-bot + its GitHub noreply email            | Commit author for every Phoebe commit, so commits link to the account that opens the PR.                                                                                                  |

Required labels already exist on JesusFilm/core: `phoebe:ready`, `processing`, `ready-for-human`, `wayfinder:research`.

## Hand Phoebe an issue

1. Make sure the issue is actually buildable (clear scope, acceptance criteria, pointers into the code). Phoebe sits at the end of a planning pipeline; a vague ticket produces a vague PR. See [`docs/preparing-work.md`](https://github.com/JesusFilm/phoebe/blob/main/docs/preparing-work.md).
2. Add the **`phoebe:ready`** label. That is the whole hand-off.
3. To sequence dependent issues, write `Blocked by #N` in the body. Phoebe skips the issue until the blocker has a PR, stacks on that branch while it is open, and rebases onto `main` once it merges.
4. To pause a queued issue, remove `phoebe:ready`. Phoebe never touches an unlabelled issue.

Queue order within the label: titles that sound like bugs or regressions first, then tracers/POCs, then polish, then refactors; older issues win ties.

## Run it

All commands run from `phoebe/container/` with the gitignored `phoebe/.env` filled in (see `.env.example`). `--env-file ../.env` is required every time because Compose only auto-loads a `.env` beside the compose file.

Preview the unit it would pick, executing nothing:

```bash
docker compose --env-file ../.env run --rm phoebe --dry-run --run-once
```

Work exactly one labelled issue, then exit (safest; janitor kinds do not run here):

```bash
docker compose --env-file ../.env run --rm phoebe --run-once
```

Run as a daemon: works tagged issues, and sweeps its own open PRs for merge conflicts, failing CI and unresolved review comments:

```bash
docker compose --env-file ../.env up -d
docker compose --env-file ../.env logs -f
```

Stop, draining the in-flight unit first (grace period is one hour):

```bash
docker compose --env-file ../.env stop
```

Rebuild the image only when `container/Dockerfile` changes (toolchain, provider CLI versions):

```bash
docker compose --env-file ../.env build
```

## While it works

- `phoebe:ready` is swapped for `processing` when a run claims the issue. Don't start on it yourself. A stranded `processing` label is reconciled automatically; three dead claims in a row quarantine the issue for a human.
- Phoebe opens the PR as the `GH_TOKEN` account and leaves watermarked comments. It is judged on side effects (commits pushed, PR opened), not on self-reported success.
- When the agent hits something it can't resolve it comments on the issue and exits rather than blocking. Read the comment, fix the ticket, re-label.
- To take a Phoebe PR back: add `ready-for-human`. Marking a non-Phoebe PR as draft also keeps Phoebe off it (default `draftPrs: skip-non-phoebe`).

## PR conventions on core

- Every Phoebe PR is opened with `--assignee siyang-bot --reviewer csiyang` (baked into `prompts/issues-prompt.md`), because core's Danger check fails a PR with no assignee or no requested reviewer. The engine-created feature integration PR (see `phoebe:feature`) does not go through that prompt, so set both on it by hand.
- Generated files (`schema.graphql`, `__generated__/`) must come from the generators. The image carries the legacy `apollo` CLI for that (pinned in `container/Dockerfile`); the issue prompt tells the agent to run the `apis/AGENTS.md` schema-change steps and commit the output.

## Gates the agent runs

From `phoebe.config.ts`, inside the issue worktree, with `--base=origin/main`:

- install: `pnpm install --frozen-lockfile`
- check: `pnpm lint:changed --fix` (the Prettier + ESLint + i18next-extraction pass autofix.ci would otherwise commit as `fix: lint issues`), then Nx format:write, then Nx affected `lint` + `type-check`
- test: Nx affected `test`
- ready (before push): check + test in one go

## Database for migrations

`compose.yml` runs a `db` service (postgres:13, `postgres`/`postgres`, named volume `phoebe-postgres`) and joins `phoebe` to its network namespace, so Postgres is `localhost:5432` inside the agent's environment. That exact address is hard-required by `tools/scripts/env-validator.sh`, which fronts `nx prisma-migrate` / `prisma-reset`. The issue prompt tells the agent to reset the database from the branch's migration history (`--skip-seed`) and then run `nx prisma-migrate`, so migrations are always generated, never hand-written, and leftover state from an earlier unit is never read as drift. Nothing is published from the container; the credentials are the committed local defaults.

## Secrets and auth

- `phoebe/.env` is gitignored. It holds `GH_TOKEN`, `CLAUDE_CODE_OAUTH_TOKEN`, `PHOEBE_AGENT=claude`, `PHOEBE_MODEL`.
- Phoebe is designed for a **fine-grained PAT** scoped to this one repo (Contents, Pull requests, Issues read/write; Actions read). In the JesusFilm org, a member's fine-grained token needs **org-owner approval** before it can write, and its lifetime must be 366 days or less. Until approved it can still read, because core is public, which makes it look half-working. A classic PAT with `repo` (+ `workflow`) needs no approval but covers every repo the account can reach.
- Verify a token before trusting it with the Phoebe repo's `scripts/verify-tenant-token.mjs` run from this directory, plus a real `git push --dry-run` with the token, which is the only probe that proves Contents write.
- Claude token: `claude setup-token` on a workstation signed in to the subscription prints a ~108-character `sk-ant-oat01-…` value. Check it with `CLAUDE_CODE_OAUTH_TOKEN=… claude -p "say ok" --model claude-sonnet-5-5`.

## Upgrading

Edit `engine.ref` in `phoebe.config.ts` to a released tag. A running container notices within about a minute and relaunches the engine at the next work-unit boundary. If the new engine needs a newer launcher, bump `ARG PHOEBE_AGENT_VERSION` in `container/Dockerfile` and rebuild. `npx --yes phoebe-agent upgrade --check` reports current vs latest. `prompts/` are the shipped copies and are excluded from Prettier so they stay verbatim; copy in newer ones deliberately after an upgrade rather than editing.
