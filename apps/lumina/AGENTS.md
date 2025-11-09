# Lumina App Agent Guide

## Context & stack

- **Location:** `apps/lumina` in the Nx monorepo (Next.js App Router).
- **Tech:** React, TypeScript, Apollo Client with generated GraphQL types, `next-intl` for localization, Tailwind CSS + shadcn/ui primitives, Firebase Auth with `next-firebase-auth-edge`.
- **Design direction:** Use shadcn/Tailwind for all UI components. Prefer shadcn/ui components over custom implementations or raw HTML elements.
- **Sister project:** E2E coverage can be added in `apps/lumina-e2e` if needed.

## Workspace setup

1. Install dependencies: `pnpm install` (pnpm is the required package manager).
2. Install Playwright browsers if needed: `pnpm exec playwright install --with-deps` (local-only; do not commit artifacts).

### CRITICAL PATH CONSTRAINT

All file operations for this workspace MUST be within /core/ directory. Never create files or folders directly in /workspaces/.

Always verify current working directory is /core before file operations. Current app is part of monorepo and path to the current app is /code/apps/lumina/.

## Dev server safety & logging

1. Before starting work, discover existing servers:
   - `ps aux | grep -E "(nx|pnpm|npm|yarn|bun).*(serve|dev|start|run)" | grep -v grep`
   - `lsof -i :4900-5000 | grep LISTEN`
2. Reuse a healthy Lumina instance when possible. If you must stop a stray process, run `pkill -f "nx run lumina:serve"`.
3. Existing running server is logging dev logs to: `tee dev-server.log`. At the end of each task review dev-server.log for new errors or warnings. Resolve any new errors automatically. Don't try to resolve issues that existed before your code changes.
4. If no dev server with logging is running, launch your session with logging so issues are traceable: `pnpm dlx nx run lumina:serve 2>&1 | tee dev-server.log &`.
5. Keep the dev server you created running.

## Feature boundaries and modules

### Authentication (`src/libs/auth/`)
- Firebase authentication configuration and utilities
- Server-side user retrieval
- Client-side auth context

### GraphQL Client (`src/lib/apolloClient/`)
- Apollo Client setup with authentication integration
- Cache configuration

### Internationalization (`src/i18n/`, `src/services/locale.ts`)
- Locale detection and management
- Translation loading

### Components (`src/components/`)
- Datadog integration (ErrorBoundary, Init)
- Reusable UI components (to be added)

## API integration points

- **Gateway API:** `http://localhost:4000` (via `NEXT_PUBLIC_GATEWAY_URL`)
- **GraphQL:** All queries/mutations go through the gateway API
- **Authentication:** Firebase Auth via `next-firebase-auth-edge`

## Development workflow

1. Start the gateway API: `nx serve api-gateway` (runs on port 4000)
2. Start the Lumina app: `nx serve lumina` (runs on port 4900)
3. Access the app at `http://localhost:4900`

## Code Implementation Guidelines

- Use early returns whenever possible to make the code more readable.
- Prefer shadcn/ui components over custom implementations or raw HTML elements. If a shadcn/ui component does not exist, use semantic HTML and Tailwind CSS, and document the reason.
- Use descriptive variable and function/const names. Also, event functions should be named with a "handle" prefix, like "handleClick" for onClick and "handleKeyDown" for onKeyDown.
- Implement accessibility features on elements. For example, a tag should have a tabindex="0", aria-label, onClick, and onKeyDown, and similar attributes.
- All components and functions must be fully typed with TypeScript.

## Testing Implementation Guidelines

- Use '@testing-library/react' npm package for component tests.

## Documentation Guidelines

- All components must have JSDoc comments, including examples and prop documentation.
- Keep documentation up to date with code changes.

