# Watch-Modern Contributor Guide

This document summarizes key rules for Codex when working inside the `apps/watch-modern` application. It draws from `.cursor/rules/watch-modern.mdc` and the `prds/watch-modern` folder.

## Environment
- Run the dev server from the repo root with **both** `nf start` and `nx run watch-modern:serve` running in parallel.
- Wait until `✓ Ready` appears in the console before continuing development.

## Testing
- Follow Test Driven Development.
- Run tests with `npm test watch-modern`.
- You may run a specific test using `npm test watch-modern -- --testNamePattern="<name>"`.

## Coding Standards
- **Never** use MUI components. Prefer Shadcn/ui, then Tailwind, then semantic HTML+Tailwind.
- All code must be typed with TypeScript.
- Use early returns and descriptive names.
- Maintain alphabetical import order and use type-only React imports.
- Layout components live in `src/components/Layout/` and are exported via `index.ts`.
- Use i18next via `useTranslation('apps-watch')` for user-facing text.
- Follow a server-first architecture: use `'use client'` components only when necessary.

## Workflow
- Keep Git operations (commits, branches, PRs) in human control.
- Follow the Red → Green → Refactor cycle.
- Update or create tests for any code changes and ensure they pass before delivery.

