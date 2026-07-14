---
title: TypeScript 7 hybrid migration — pilot rollout and remaining phases
date: 2026-07-14
category: docs/solutions/conventions/
module: monorepo
problem_type: tooling_migration
component: typescript
severity: medium
related_components:
  - nx_targets
  - tsconfig
  - prisma_client
applies_when:
  - 'Adding TypeScript 7 type-checking to another workspace'
  - 'Wondering why the repo has both `typescript` and `typescript7` dependencies'
  - 'Hitting TS5090/TS5102/TS5108 config errors under the TS 7 compiler'
tags:
  - typescript
  - typescript-7
  - tsgo
  - migration
  - type-check
---

# TypeScript 7 hybrid migration

## Strategy

The repo runs a **hybrid** TypeScript setup:

- `typescript` (5.x) remains the package every tool resolves by name — typed
  ESLint (typescript-eslint 8), Next 16, Nx executors, and the default editor
  TS all depend on the TS 5 compiler API, which the Go-based TS 7 does not
  expose.
- TypeScript 7 lives in its own workspace package,
  `tools/typescript7` (`typescript-runner`), NOT in the root
  devDependencies. Both TS packages ship a bin named `tsc`, and when both
  were root deps, pnpm's `node_modules/.bin/tsc` resolution was
  nondeterministic — locally it kept TS 5, but in CI it resolved to TS 7,
  which failed all 27 non-migrated `pnpm exec tsc` type-check targets with
  TS5108 (`moduleResolution=node10` removed). Isolating TS 7 in its own
  package keeps its bin out of the root `.bin` entirely. Invoke it via the
  root script: `pnpm tsc7 -p <tsconfig.ts7.json>`
  (`node tools/typescript7/node_modules/typescript/bin/tsc`) — the single
  line to change when the hybrid era ends.

## Config changes TS 7 forced (and how to fix them elsewhere)

TS 7 removed `baseUrl` (TS5102), non-relative `paths` (TS5090), and
`moduleResolution: node10` (TS5108). These CANNOT be fixed in the shared
tsconfigs, because the TS 5 toolchain actively depends on the removed
options: Next's webpack alias resolution and tsconfig-paths-webpack-plugin
(api builds) fail with `Module not found: Can't resolve '@core/...'`
without `baseUrl`, and vite-tsconfig-paths silently misresolves aliases
(vitest specs fail with confusing runtime symptoms). Sharing tsconfig
files between the two compilers was tried twice and broke CI both times.

The working shape — **complete config separation**:

- `tsconfig.base.json` and every existing per-workspace tsconfig stay
  byte-identical to the TS 5 world; webpack builds, tsx scripts, vitest,
  and Storybook keep reading them.
- `tsconfig.base.ts7.json` is a standalone TS 7 base: no `baseUrl`,
  `./`-relative `paths`, `module: esnext` + `moduleResolution: bundler`.
  **Keep its `paths` map in sync with `tsconfig.base.json` by hand**
  (JSON `extends` cannot remove keys, so it cannot extend the TS 5 base).
- Each migrated workspace gets a `tsconfig.ts7.json` extending the ts7
  base — a single `noEmit` program over `**/*.ts(x)` (sources, specs,
  stories together; needs `types: ["node", "vitest/globals", ...]` and
  `allowImportingTsExtensions` for `.tsx` re-exports). Only the
  `type-check` target reads it: `pnpm tsc7 -p <workspace>/tsconfig.ts7.json`.

**Do not use `nodenext`** for webpack-bundled workspaces: it demands
explicit `.js` extensions on the dynamic `import()` calls in
`src/workers/`, the wrong model for bundled code. Use
`esnext` + `bundler`.

## Gotchas found during the pilot

- Prisma clients must be generated (`pnpm exec prisma generate --schema
libs/prisma/<db>/db/schema.prisma`) or the `@core/prisma/*/client` paths
  produce TS2305/TS2724 walls followed by implicit-any cascades.
- `.storybook/preview.js` is untyped JS; workspaces whose stories tsconfig
  pulls in `libs/shared/ui` need the sibling `.storybook/preview.d.ts`
  (added in this migration). This was a pre-existing TS 5 error masked by
  stale `.tsbuildinfo` caches.
- Touching a shared tsconfig invalidates the Nx cache for EVERY project,
  forcing cold builds/tests repo-wide in CI. Expect latent, cache-masked
  failures to surface (this migration flushed out an arclight page
  component returning plain objects instead of JSX — a guaranteed runtime
  crash that cached builds never re-checked).
- Speed: on api-sized projects a cold `tsc -b` was ~equal under TS 5 and
  TS 7 (~4.6s vs ~4.8s for api-journeys); the TS 7 win is expected to show
  on the large Next apps and in the editor, not on small programs.

## Rollout status and remaining phases

Done (2026-07-14): all six `apis/*` `type-check` targets run `pnpm tsc7`.

Remaining, in order, each gated on the previous:

1. **apps/libs/workers type-check targets** — after the api pilot bakes in
   CI for a few days. Each workspace gets its own `tsconfig.ts7.json` as
   described above; existing tsconfigs stay untouched.
2. **Editor flip** — commit the TS 7 language-service setting to
   `.vscode/settings.json` only once _all_ type-check targets are on TS 7,
   so editor squiggles and CI agree.
3. **Retire TS 5** — when typescript-eslint and Next support the TS 7
   API. Then `typescript` becomes v7, `tools/typescript7`, the `tsc7`
   script, and the `*.ts7.json` configs are deleted, and targets go back
   to plain `tsc` against the unified base config.
