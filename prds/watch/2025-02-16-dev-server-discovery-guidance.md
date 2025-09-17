# Watch Dev Server Discovery Guidance — 2025-02-16

## Context

- Product requested an explicit safety check before starting new Watch dev servers so that parallel Nx tasks do not fight over the same ports.
- Agents occasionally spawned multiple `watch:serve` processes, which confused Playwright runs and manual QA.

## Changes

- Added a "Dev server discovery" checklist to `apps/watch/AGENTS.md` with the exact `ps` and `lsof` commands to run before launching `pnpm dlx nx run watch:serve`.
- Clarified the manual validation step to reuse an existing server instance or gracefully stop it before creating a new one.

## Follow-ups

- Consider scripting the discovery logic into a shared `tools/dev-server-check.sh` helper once other teams adopt the workflow.
- Explore wiring the commands into Nx target defaults so `watch:serve` warns when a port is already bound.
