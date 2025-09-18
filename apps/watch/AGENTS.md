# Watch App Agent Guide

## Context & stack

- **Location:** `apps/watch` in the Nx monorepo (Next.js pages router).
- **Tech:** React, TypeScript, Apollo Client with generated GraphQL types, `next-i18next` for localization, Tailwind CSS + shadcn/ui primitives.
- **Design direction:** We are migrating to shadcn/Tailwind. Do **not** introduce new MUI usage even though the lint rule is relaxed.
- **Sister project:** E2E coverage lives in `apps/watch-e2e`; reuse its Playwright setup instead of creating new tooling.

## Workspace setup

1. Install dependencies: `pnpm install` (pnpm is the required package manager).
2. Install Playwright browsers if missing: `pnpm exec playwright install --with-deps` (local-only; do not commit artifacts).
3. Optional data prep: `pnpm dlx nx run watch:generate-test-data`.

## Dev server safety & logging

1. Before starting work, discover existing servers:
   - `ps aux | grep -E "(nx|pnpm|npm|yarn|bun).*(serve|dev|start|run)" | grep -v grep`
   - `lsof -i :3000-5000 | grep LISTEN`
2. Reuse a healthy Watch instance when possible. If you must stop a stray process, run `pkill -f "nx run watch:serve"`.
3. Launch your session with logging so issues are traceable: `pnpm dlx nx run watch:serve 2>&1 | tee dev-server.log &`.
4. After validation, shut down the server (`Ctrl+C` or `pkill`) and archive the log if it captured failures.

## Core Nx targets (run with `pnpm dlx nx run <target>`)

- `watch:serve` – Dev server on <http://localhost:4300>.
- `watch:build` – Production bundle.
- `watch:codegen` – Regenerate GraphQL artifacts after query changes.
- `watch:extract-translations` – Update locale JSON when strings move.
- `watch:test-data` – See step 3 above for local fixtures.

## Quality gates & automated checks

Run these before opening a PR. If a command fails due to pre-existing issues, ensure your changes introduce no new violations and note the exception in the PRD log.

- Format check: `pnpm run prettier` (use `pnpm run prettier:fix` to apply fixes; Tailwind classes are auto-sorted by the plugin).
- Watch lint: `pnpm dlx nx run watch:lint`.
- Watch type-check: `pnpm dlx nx run watch:type-check` (targets `tsc -b apps/watch/tsconfig.json`).
- Watch unit tests: `pnpm dlx nx run watch:test`.
- Watch-e2e lint: `pnpm dlx nx run watch-e2e:lint`.
- Watch-e2e type-check: `pnpm dlx nx run watch-e2e:type-check`.
- Watch-e2e smoke: `pnpm dlx nx run watch-e2e:e2e` (start the dev server first).
- Debugging UI issues: `PWDEBUG=1 pnpm dlx nx run watch-e2e:debug` lets you inspect the browser and console output live.
- Playwright report: `pnpm dlx nx run watch-e2e:show-report` serves the HTML report on `http://127.0.0.1:9323` and keeps the terminal session open until you press `Ctrl+C`.

## Testing expectations

- Always propose and implement unit or integration tests that cover edge cases and likely failure paths touched by your changes. Base new specs on the function signatures and surrounding logic you modify.
- Co-locate React Testing Library specs under `*.spec.ts(x)` and mock network traffic with MSW handlers in `apps/watch/test`.
- Extend Playwright scenarios when UI behavior shifts, and capture console logs/screenshots for regressions.
- Document the executed test suite, notable scenarios, and any skipped checks in `/prds/watch/`.

## Manual user validation

1. Follow the discovery workflow above, then launch `watch:serve` with logging.
2. Navigate to <http://localhost:4300>, exercise the affected flows end-to-end, and confirm copy, layout, animations, and localization behave as expected.
3. Watch the browser console and network panel for errors; capture findings (and relevant log excerpts) in the PRD entry.
4. When reproducing bugs, use either Playwright headed mode or targeted scripts (e.g., `pnpm dlx nx run watch-e2e:debug`) to validate fixes against the live dev server.

## Coding standards

- Strive for simple, reusable components with clear responsibilities and early returns.
- Keep handlers prefixed with `handle*`, type everything explicitly, and lean on generated GraphQL helpers (`ResultOf`, `VariablesOf`).
- Compose UI with shadcn/ui primitives or semantic HTML styled via Tailwind. Use the shared `cn` helper for conditional classes.
- Tailwind utilities should stay semantically grouped—Prettier sorts the lists, but ensure responsive and state variants remain readable.
- Meet high visual polish: consistent typography, deliberate spacing, and tasteful Tailwind-driven animations inspired by Apple TV+, Airbnb, YouTube, Vimeo, and Netflix.
- Build accessible experiences (aria attributes, keyboard support, focus states) as part of every component.
- When calling `t(...)`, inline the human-readable copy with interpolation placeholders (e.g., `t('Switch to {{localeName}}', { localeName: localeDetails.nativeName })`) instead of referencing stored translation keys like `t('localeSuggestion.action', ...)`.

## Architecture & refactoring agreements

- Favor small, focused modules; extract shared logic into hooks or utilities when duplication appears.
- After implementing a feature or fixing a bug, outline a concrete plan to split any touched services into smaller units, execute achievable refactors within the same effort, and document future steps in the PRD log.

## Dependencies & tooling policy

- Do not add new packages unless absolutely critical to deliver the feature. Prefer refactoring or reusing existing utilities.
- Reuse the workspace Playwright installation; never install Playwright globally or commit browser binaries.
- When lint/type-check errors stem from unrelated legacy code, ensure no new issues originate from your changes and call out the existing failures in documentation.

## Knowledge sharing

- Every engagement requires a concise log in `/prds/watch/` capturing goals, obstacles, resolutions, test coverage, and follow-up ideas.
- Update this AGENTS file whenever you uncover faster workflows or new standards that benefit future agents.
