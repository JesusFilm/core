# Core Constitution

## Global Principles

- Use **pnpm** as the package manager for all projects.
- Enforce code quality through formatting, linting, type-checking, unit tests, and end-to-end tests before merging any changes.
- Prioritize accessibility in all UI components, ensuring ARIA compliance, keyboard support, and visible focus states.
- Type all code with TypeScript and organize exports alphabetically.
- Favor a server-first architecture: minimize client-only code, server-render static content, use link-based navigation, and progressive enhancement.
- Avoid adding new dependencies unless absolutely necessary; prefer refactoring or reusing existing utilities.
- For new features, create detailed implementation strategies including step-by-step plans, technical analysis, success criteria, and living documentation updates.
- Maintain thorough PRD/log documentation for all engagements, capturing goals, obstacles, resolutions, test coverage, user flows, and follow-up ideas.

## App-Specific Addenda

### Watch

# Watch App Constitution

## Core Principles

### I. Tech Stack & UI Policy (NON-NEGOTIABLE)
- App location: `apps/watch` in Nx monorepo (Next.js pages router).
- Required tech: React, TypeScript, Apollo Client with generated GraphQL types, `next-i18next` for localization, Tailwind CSS + shadcn/ui primitives.
- UI hierarchy: **shadcn/ui first**, then custom Tailwind components, then semantic HTML + Tailwind.
- Migration stance: migrating to shadcn/Tailwind. **Do not introduce new MUI usage.** Existing MUI shells may remain until explicit migration tasks retire them.

### II. Workspace Boundaries (NON-NEGOTIABLE)
- All file operations occur **within `/core`**. Never create files or folders directly in `/workspaces`.
- Always verify current working directory is `/core` before any file operations.
- Current app path reference: `/code/apps/watch/`.

### III. Development Server Discipline (NON-NEGOTIABLE)
- Before starting work, discover existing dev servers; prefer reusing a healthy instance.
- If needed, stop only stray `watch:serve` processes.
- Dev sessions must log to `dev-server.log` (e.g., `pnpm dlx nx run watch:serve 2>&1 | tee dev-server.log &`).
- **Always wait for successful compilation** ("Ready in Xs") before proceeding. On errors, stop and fix before continuing.
- After starting the server, **navigate to the affected page** (curl or browser) to trigger compilation and check logs for errors.
- Address **only new** errors introduced by your changes; document pre-existing issues in the PRD log.

### IV. Quality Gates & Tooling
- Reuse existing Playwright setup in `apps/watch-e2e`; never install Playwright globally nor commit browser binaries.
- Core Nx targets: `watch:serve`, `watch:build`, `watch:codegen`, `watch:extract-translations`, `watch:generate-test-data`.
- Pre-PR checks: formatter, lint, type-check, unit tests, e2e smoke where applicable. No new violations introduced by your changes.

### V. Testing Doctrine
- Unit and component tests cover rendering, props, interactions, accessibility, conditional logic, and Tailwind classes.
- Co-locate React Testing Library specs under `*.spec.ts(x)`; mock network with MSW in `apps/watch/test`.
- Extend Playwright scenarios when UI behavior changes; capture console logs/screenshots for regressions.
- Use shared Jest setup in `apps/watch/setupTests.tsx`; wrap with `MockedProvider`, `VideoProvider`, `WatchProvider` as needed; isolate SWR cache with `TestSWRConfig`.
- Always propose and implement tests for edge cases touched by your changes.

### VI. Data Fetching & Codegen
- Apollo hooks must use generated types with colocated GraphQL documents.
- For REST-like endpoints, pair SWR hooks with zod guards; parse responses before returning.
- After editing GraphQL documents, run `pnpm dlx nx run watch:codegen` and commit regenerated artifacts in `apps/watch/__generated__`.

### VII. Coding Standards
- Favor small, focused modules; extract shared logic into hooks/utilities.
- Compose UI with shadcn/ui or semantic HTML styled via Tailwind; use the shared `cn` helper for conditional classes.
- Accessibility is mandatory: ARIA, keyboard support, focus states; interactive elements must be keyboard reachable and visibly focusable.
- Type everything with TypeScript; export components via `index.ts` files; alphabetize imports/exports.
- Prefer server-first architecture: minimal `"use client"`, server-render static content, link-based navigation, progressive enhancement.

### VIII. Dependencies & Change Control
- Avoid adding new packages unless critical. Prefer refactoring or reusing existing utilities.
- When lint/type-check failures stem from unrelated legacy code, ensure **no new issues** originate from your changes and note existing failures in documentation.

## Workflow & Knowledge Sharing

### Implementation Strategies & Engagement Logging (NON-NEGOTIABLE)
- For new features without an execution plan, create an **implementation strategy** in `/core/prds/watch/` including:
  - Step-by-step plan (markdown checkboxes)
  - Technical analysis and component mapping
  - Success criteria and validation steps
  - Living documentation updates during implementation
- For every engagement, create or update the related spec file.
- The PRD/log must capture: Goals, Obstacles, Resolutions, Test coverage, **User flows (human-readable)**, and Follow-up ideas.
- Name the log after the **branch name**, replacing slashes with dashes. Example:
  - Branch: `feature/abc-123-new-feature-name`
  - Log: `/prds/watch/feature-abc-123-new-feature-name.md`

### Updating Agents Guide
- When faster workflows or new standards are discovered, update `AGENTS.md`. Keep entries short, precise, and senior-engineer focused.
- Document learnings from efforts requiring more than three iterations; exclude trivial observations.

## Governance
- This Constitution supersedes other ad-hoc practices for `apps/watch`.
- All PRs and reviews must verify compliance with Core Principles and Workflow rules.
- Any exceptions require explicit documentation in the PRD/log with rationale and a follow-up migration plan.
- Amendments: propose via PR updating this file; include rationale, impact analysis, and migration steps.

**Version**: 1.0.0 | **Ratified**: 2025-09-18 | **Last Amended**: 2025-09-18