# Tailwind Prettier Plugin Adoption – 2025-02-15

## Context

- Install and configure `prettier-plugin-tailwindcss` so Tailwind utility ordering is automated for Watch-related work.
- Align workspace scripts with pnpm-first usage instead of relying on `npx` shims.

## Discoveries & decisions

- The workspace already shipped Prettier 3 globally; adding the Tailwind plugin at the root keeps Nx packages in sync without per-app installs.
- Prettier detects plugins from `node_modules`, but pinning `"plugins": ["prettier-plugin-tailwindcss"]` inside `.prettierrc` guarantees consistent behavior across editors and CI.
- `pnpm run prettier` now performs a check-only pass, while `pnpm run prettier:fix` writes changes—clearer ergonomics for agents following automation-first workflows.

## Implementation notes

- Added `prettier-plugin-tailwindcss` to the root package alongside the existing Prettier dependency.
- Updated `.prettierrc` to reference the plugin explicitly.
- Swapped the Prettier npm scripts to `pnpm exec` so commands use workspace binaries and avoid global installs.
- Documented the workflow in `apps/watch/AGENTS.md`, emphasizing Prettier as the preferred Tailwind ordering tool.

## Follow-up ideas

- Consider scoping `pnpm run prettier` to touched packages (via `lint-staged` or Nx format targets) to reduce runtime on large diffs.
- Evaluate enabling a pre-commit hook once Tailwind adoption is further along to catch ordering regressions earlier.
