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

TS 7 removed several options; the errors and their fixes:

- **TS5102 `baseUrl` removed** — `tsconfig.base.json` no longer sets
  `baseUrl`; all `paths` entries are now relative (`./libs/...`). This is
  fully supported by TS 5 too (since 4.1), so the change is repo-wide and
  safe.
- **TS5090 non-relative paths** — same fix: prefix `paths` values with `./`.
- **TS5108 `moduleResolution: node10` removed** — `tsconfig.base.json` still
  sets `moduleResolution: "node"` for non-migrated TS 5 projects; every
  workspace on TS 7 must override it. For the apis we use
  `module: "esnext"` + `moduleResolution: "bundler"` (valid in both TS 5 and
  TS 7), matching what api-journeys already used. **Do not use `nodenext`**
  for webpack-bundled workspaces: it demands explicit `.js` extensions on
  the dynamic `import()` calls in `src/workers/`, which is the wrong model
  for bundled code.

## Gotchas found during the pilot

- Prisma clients must be generated (`pnpm exec prisma generate --schema
  libs/prisma/<db>/db/schema.prisma`) or the `@core/prisma/*/client` paths
  produce TS2305/TS2724 walls followed by implicit-any cascades.
- `.storybook/preview.js` is untyped JS; workspaces whose stories tsconfig
  pulls in `libs/shared/ui` need the sibling `.storybook/preview.d.ts`
  (added in this migration). This was a pre-existing TS 5 error masked by
  stale `.tsbuildinfo` caches.
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
