# ESLint (lint-policy kernel)

The shared lint policy of the monorepo (`libs/shared/eslint`): one Common Base of house rules and a small set of Flavors that each workspace's `eslint.config.mjs` composes in. Owns no product entities; pure engineering policy consumed by every app, API, and lib.

## Language

**Common Base**:
The single house rule set (`common.mjs`) every workspace inherits — TypeScript strictness (via `typescript-eslint`'s `recommendedTypeChecked`, heavily softened), import ordering/hygiene, Nx module boundaries, i18n literal-string enforcement, and test/story file carve-outs.
_Avoid_: base config, root config (there is no root eslint config — composition happens per workspace)
Trap: `eslint-config-prettier` is spread _after_ any other shared config in the same object, and a spread replaces `rules` wholesale rather than merging. Anything whose rules must survive has to be its own config object in the array.

**Flavor**:
A named composition over the Common Base matched to a workspace type: `next` (Next.js apps), `api` (Yoga subgraph APIs), `yogaWithReactEmail` (APIs whose email templates are React), `prisma` (the `libs/prisma/*` schema libs), `e2e` (Playwright suites), or the Common Base used directly. A workspace picks exactly one.
_Avoid_: preset, profile

**Restricted Import**:
A package that must be imported by submodule, never from its root — `lodash`, `@mui/material`, `@mui/system`, `@mui/icons-material`, and `react-i18next` (use the shared i18n wiring instead). Deep three-level `@mui/*/*/*` paths and `*.mock` imports are equally banned.

**Literal-String Rule**:
The i18n policy (`i18next/no-literal-string`) that user-facing strings must go through translation; switched off in tests, stories, and the React-email flavor.

**Test-File Carve-out**:
The relaxations granted to `*.spec.*` and `*.stories.*` files — Jest-plugin rules and globals, `*.mock` imports allowed, literal strings allowed. Trap: the carve-out is Jest-flavored even in workspaces that have migrated to Vitest (globals are compatible; `jest/*` rules still apply to their specs). The `jest/padding-around-*` block spelling out spec formatting replaces the abandoned `eslint-plugin-jest-formatting`.

## Traps

**Import plugin is the `-x` fork**:
Rules are still written `import/...`, but the plugin behind that name is `eslint-plugin-import-x`; upstream `eslint-plugin-import` calls APIs ESLint 10 removed. Settings use the fork's own namespace (`import-x/internal-regex`), so a stray `import/internal-regex` is silently ignored.

**`projectService`, never `project`**:
Type-aware linting resolves programs through `projectService`. `typescript-eslint` errors outright if a config supplies both, so no `eslint.config.mjs` may reintroduce `project`.

**Cold lint of `journeys-admin` needs headroom**:
~2.6k files type-checked in one ESLint process exceeds Node's default ~4GB heap. The devcontainer and autofix.ci both set `NODE_OPTIONS=--max-old-space-size=8192`; a bare `node` invocation will OOM.
