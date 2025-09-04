# How to Add UI Components (watch-modern)

> This guide documents the exact, repeatable steps to add shadcn/ui components to the Watch‑Modern app and record the change inside PRDs.

## Prerequisites

- Tailwind v4 is already configured in the app:
  - `apps/watch-modern/postcss.config.js`
  - `apps/watch-modern/tailwind.config.js`
  - `apps/watch-modern/src/app/globals.css`
- Shadcn configuration exists for this app:
  - `apps/watch-modern/components.json` (per‑app)
- Repo‑level shadcn registry config exists for convenience:
  - `components.json` (root)

Notes:
- The app uses a minimal `apps/watch-modern/package.json` so the shadcn CLI can run in a monorepo. Do not add dependencies here; keep dependencies hoisted at the workspace root.
- UI components live under `apps/watch-modern/src/components/ui/`.

## Add Components (CLI)

From the repo root, run the shadcn CLI with the app as the current working directory and target path set to the UI folder:

```bash
npx shadcn@latest add <components...> \
  --cwd apps/watch-modern \
  --path src/components/ui \
  -y --overwrite
```

Examples:
- Add badge and aspect ratio:
  ```bash
  npx shadcn@latest add badge aspect-ratio --cwd apps/watch-modern --path src/components/ui -y --overwrite
  ```
- Add a typical set for forms and layout:
  ```bash
  npx shadcn@latest add button input label textarea select accordion dialog \
    --cwd apps/watch-modern --path src/components/ui -y --overwrite
  ```

Where things land:
- Components: `apps/watch-modern/src/components/ui/*`
- Utilities: `apps/watch-modern/src/lib/utils.ts` (exports `cn`)

## Verify Locally

1. Import a component in the app and confirm it compiles:
   ```tsx
   import { Badge } from "@/components/ui/badge"
   ```
2. Run the app or tests to validate usage:
   ```bash
   nx serve watch-modern
   # or
   nx run watch-modern-e2e:e2e
   ```

## Record in PRDs

When a feature requires adding or changing UI components, document it under that feature’s PRD directory:

- Update requirements: `prds/watch-modern/<feature>/spec/requirements.md`
  - Add a bullet under UI requirements listing the shadcn components used (e.g., Badge, Dialog, Accordion).

- Update design: `prds/watch-modern/<feature>/spec/design.md`
  - Indicate shadcn/ui usage and any theme tokens that were required.

- Update slices: `prds/watch-modern/<feature>/spec/slices.md`
  - Add a slice entry like: "Add shadcn/ui: badge, dialog, accordion (preserve Tailwind classes)."

- Cross‑link code:
  - Reference component files under `apps/watch-modern/src/components/ui/*` from the PRD where relevant.

## Conventions & Constraints

- Always prefer shadcn/ui components first, then custom Tailwind if unavailable (see `prds/watch-modern/GUIDELINES.md`).
- Preserve all Tailwind classes from design lock; snapshot/tests can rely on exact class lists.
- Avoid adding app‑local dependencies; keep dependency updates at the workspace root `package.json`.

## Troubleshooting

- CLI asks to initialize a project: ensure `--cwd apps/watch-modern` is provided and the minimal `apps/watch-modern/package.json` exists.
- CLI prompts to overwrite existing files: use `--overwrite` and check diffs to keep local conventions.
- Tailwind doesn’t apply styles: confirm `@tailwindcss/postcss` is present in `postcss.config.js` and `@import "tailwindcss";` is at the top of `src/app/globals.css`.

## Commit Message Template

```
watch-modern: add shadcn/ui <components>

- add: <component list> under src/components/ui
- update PRD: <feature>/spec/{requirements,design,slices}.md
```

