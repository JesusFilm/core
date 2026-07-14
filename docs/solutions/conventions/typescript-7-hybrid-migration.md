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
  root script: `pnpm tsc7 -b <tsconfig>`
  (`node tools/typescript7/node_modules/typescript/bin/tsc`) — the single
  line to change when the hybrid era ends.

## Config changes TS 7 forced (and how to fix them elsewhere)

TS 7 removed `baseUrl` (TS5102), non-relative `paths` (TS5090), and
`moduleResolution: node10` (TS5108). We could NOT fix these in
`tsconfig.base.json` itself: although TS 5 accepts baseUrl-less relative
`paths` (since 4.1), the surrounding tooling does not —
**vite-tsconfig-paths silently fails to resolve `@core/*` aliases without
`baseUrl`** (vitest specs then fail with confusing runtime symptoms, e.g.
components rendering wrong), and **Next's webpack alias resolution also
requires `baseUrl`** (`Module not found: Can't resolve '@core/shared/gql'`).

So the repo has TWO base configs:

- `tsconfig.base.json` — unchanged, for the TS 5 world (baseUrl, absolute
  paths, `moduleResolution: node`).
- `tsconfig.base.ts7.json` — for workspaces type-checked by `pnpm tsc7`:
  no `baseUrl`, `./`-relative `paths`, `module: esnext` +
  `moduleResolution: bundler`. **The `paths` maps must be kept in sync by
  hand** (JSON `extends` cannot remove keys, so the TS 7 variant cannot
  extend the TS 5 base). Collapse back to one file when the whole repo is
  on TS 7.

Every tsconfig in a migrated workspace must extend the ts7 base — watch for
configs like `tsconfig.stories.json` that extend `../../tsconfig.base.json`
directly rather than via the workspace's root tsconfig.

**Do not use `nodenext`** for webpack-bundled workspaces: it demands
explicit `.js` extensions on the dynamic `import()` calls in
`src/workers/`, the wrong model for bundled code. Use
`esnext` + `bundler` (valid in both TS 5 and TS 7), matching api-journeys.

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
   CI for a few days. Each workspace needs the `moduleResolution` override
   described above (Next apps likely already use `bundler`).
2. **Editor flip** — commit the TS 7 language-service setting to
   `.vscode/settings.json` only once *all* type-check targets are on TS 7,
   so editor squiggles and CI agree.
3. **Retire TS 5 / drop the alias** — when typescript-eslint and Next
   support the TS 7 API. Then `typescript` becomes v7, the `typescript7`
   alias and the `tsc7` script are deleted, and targets go back to plain
   `tsc`.
