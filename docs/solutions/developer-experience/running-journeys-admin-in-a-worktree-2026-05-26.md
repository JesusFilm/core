---
title: Running journeys-admin in a git worktree
date: 2026-05-26
category: developer-experience
module: journeys-admin
problem_type: developer_experience
component: development_workflow
severity: medium
applies_when:
  - Working on a feature branch in a git worktree under .claude/worktrees/
  - An agent (or fresh shell) needs to start `nx serve journeys-admin`
  - The agent's shell does not have doppler-loaded env vars
tags: [nx, pnpm, worktree, journeys-admin, doppler, next-config]
---

# Running journeys-admin in a git worktree

## Context

Worktrees under `.claude/worktrees/` are useful for isolating long-lived
feature work without disturbing the parent checkout. But two friction
points break the obvious `nx serve journeys-admin` command for an agent
working inside a worktree:

1. The worktree has no `node_modules/` of its own.
2. `next.config.js` reads environment variables at load time. The team's
   normal shell has them via doppler; an agent's shell does not.

Both surface as confusing failures that don't say "you're in a worktree"
or "env not loaded."

## Guidance

### 1. Symlink node_modules from the parent

Worktrees do not inherit `node_modules` from the parent repo. The pnpm
machinery (specifically `node_modules/.modules.yaml`) is missing, so
nx's project-graph plugin fails before the server can start:

```
NX   Failed to process project graph.
  - pnpm-lock.yaml:
      Could not find ".modules.yaml" at
      "/Users/<you>/CodingProjects/core/.claude/worktrees/<branch>/node_modules/.modules.yaml"
```

The fastest fix is a symlink to the parent's `node_modules`. pnpm is
content-addressed and worktrees are part of the same repo, so the
parent's install satisfies every dependency:

```bash
cd /Users/<you>/CodingProjects/core/.claude/worktrees/<branch>
ln -s /Users/<you>/CodingProjects/core/node_modules node_modules
```

A fresh `pnpm install` in the worktree also works but is much slower
and creates a duplicated `node_modules/` for no real benefit.

### 2. Either run from a doppler-loaded shell, or stub the required env vars

`next.config.js` performs build-time rewrite validation that interpolates
env vars into route destinations:

```js
{ source: '/share/:slug', destination: `${process.env.PLAUSIBLE_URL}/share/:slug` }
```

When `PLAUSIBLE_URL` is undefined the destination becomes
`undefined/share/:slug`, which Next.js rejects:

```
`destination` does not start with `/`, `http://`, or `https://`
for route { ..., "destination": "undefined/share/:slug" }
Error: Invalid rewrites found
```

The team normally runs the backend via `nf start` (foreman / Procfile)
inside a doppler-loaded shell, which also supplies the frontend's env.
An agent dropped into a fresh shell has no doppler context.

Options when you need the dev server up:

- **Best**: run `nx serve journeys-admin --port 4202` from the user's
  own shell (where doppler is loaded). The worktree path is fine — just
  `cd` into it first. Picks the same env the API gets.
- **Adequate for build-time only**: export dummy values for the build-
  time blockers (`PLAUSIBLE_URL=http://localhost:9999`) so the server
  starts. Runtime calls that need real Firebase auth or the gateway URL
  will still fail.
- **Not viable for agents**: install doppler locally and authenticate.
  Doppler is not installed in agent shells by default; trying it just
  reveals it's missing.

### 3. Port choices

The Procfile only runs the APIs. Frontend dev servers must be started
manually. Defaults:

- 4200 — usually free, but a parallel `nx serve` already running in the
  parent occupies it.
- 4201 — occupied by Cursor (the IDE itself listens here).
- 4202 — generally free; use this if the user wants a frontend running
  alongside their existing dev environment.

Always probe with `lsof -nP -iTCP:<port> -sTCP:LISTEN` before binding.

## Why This Matters

The obvious command `nx serve journeys-admin` fails inside a worktree
without either of the above set up. The failure messages point at
project-graph plugins or rewrite validation rather than at the worktree
or the missing env, which makes the diagnosis slow the first time.

For agents in particular, the env-var requirement is a hard blocker:
an agent has no plausible way to load doppler-scoped secrets from its
own shell. Recognizing that early lets the agent surface the constraint
to the user rather than burning cycles trying to stub one variable at a
time.

## When to Apply

- Any time work happens in a worktree under `.claude/worktrees/` and a
  Next.js app must be served (journeys-admin, watch, journeys, etc.).
- Before promising the user a frontend preview URL — verify that env
  is reachable from the current shell first.

## Examples

```bash
# Inside the worktree, before first `nx serve`:
ln -s /Users/<you>/CodingProjects/core/node_modules node_modules

# Then, from a doppler-loaded shell:
npx nx serve journeys-admin --port 4202
```

If the env is not available, surface this to the user and ask them to
run the command in their own shell — do not stub Firebase or gateway
URLs hoping the runtime calls won't matter; the auth flow will fail
the first time the user clicks a real API-backed action.

## Related

- `.claude/rules/running-jest-tests.md` — covers the related worktree
  gotcha for Jest (resolving `<rootDir>` from CWD).
- Procfile at the repo root — confirms only APIs are wrapped; frontend
  apps must be started manually.
