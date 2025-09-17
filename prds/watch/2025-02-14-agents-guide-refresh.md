# Watch Agent Guide Refresh – 2025-02-14

## Context
- Update `apps/watch/AGENTS.md` with clarified workflows, manual QA expectations, Tailwind ordering guidance, and documentation requirements.
- Remove global ESLint restrictions that blocked `@mui/*` imports while keeping the policy to favor shadcn/Tailwind in documentation.

## Discoveries & decisions
- Playwright dependencies already exist in the root `package.json`; only browser binaries are required per environment (`pnpm exec playwright install --with-deps`).
- `apps/watch-e2e` exposes Nx targets (`lint`, `type-check`, `e2e`, `debug`, `show-report`) that agents can reuse—highlighted them in the guide instead of recommending ad-hoc commands.
- `playwright show-report` keeps the terminal session active while serving the HTML report (default port `9323`); call out the need to terminate manually after review.

## Implementation notes
- Replaced the Storybook demo reference with manual validation guidance per product direction.
- Trimmed `no-restricted-imports` lists in `libs/shared/eslint/common.mjs` to drop `@mui/*` bans while retaining the `lodash` and `react-i18next` protections.
- Added `/prds/watch/` logging requirement to AGENTS so future changes capture lessons learned.
- `pnpm dlx nx run watch:lint` currently fails on pre-existing `AudioTrackSelect` import ordering and `no-floating-promises` errors; no new lint issues were introduced by these changes.

## Follow-up ideas
- Once the shadcn/Tailwind migration is further along, consider re-introducing lint rules that enforce preferred component libraries without blocking legacy code paths.
- Evaluate automated Tailwind class sorting tooling (e.g., `prettier-plugin-tailwindcss`) when upgrading Prettier if manual ordering becomes error-prone.
