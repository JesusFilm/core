---
title: "Next 16 / Turbopack treats .tsx specs in pages/ as routes and fails the build with 'Export getStaticProps doesn't exist'"
date: 2026-05-11
category: build-errors
module: apps/journeys
problem_type: build_error
component: development_workflow
symptoms:
  - "`nx build journeys` fails: `Error: Turbopack build failed with 1 errors: ./apps/journeys/pages/home/template-gallery/[slug].spec.tsx:5:1 Export getStaticProps doesn't exist in target module`"
  - "Type-check fails: `error TS2708: Cannot use namespace 'jest' as a value` on `pages/.../*.spec.tsx`"
  - 'Vitest tests pass locally; only the production / preview build pipeline breaks'
root_cause: incomplete_setup
resolution_type: code_fix
severity: medium
tags:
  - next16
  - turbopack
  - pages-router
  - vitest
  - spec-collocation
  - apps-journeys
related_components:
  - tooling
  - testing_framework
---

# Next 16 / Turbopack treats `.tsx` specs in `pages/` as routes and fails the build

## Problem

After Next 16 (which makes Turbopack the default builder) merged into `main`, the journeys app's preview deploy broke for any PR with a `.tsx` spec file co-located inside `apps/journeys/pages/`. The build failed with `Export getStaticProps doesn't exist in target module`. The same spec passed locally under Vitest because Vitest doesn't share Turbopack's module-resolution rules.

## Symptoms

- Nx build error from the journeys app (Turbopack) on `pages/<route>/<route>.spec.tsx`:
  ```
  Error: Turbopack build failed with 1 errors:
  ./apps/journeys/pages/home/template-gallery/[slug].spec.tsx:5:1
  Export getStaticProps doesn't exist in target module
  > 5 | import { getStaticProps } from './[slug]'
  The export getStaticProps was not found in module
  [project]/apps/journeys/pages/home/template-gallery/[slug].tsx [client] (ecmascript).
  ```
- TypeScript type-check error in the same spec file: `error TS2708: Cannot use namespace 'jest' as a value` (cascading from the same file but a separate symptom — see Prevention #4 below).
- Vitest unit tests pass locally; the failure only surfaces in CI where the production / preview build pipeline runs `nx build`.
- No other apps in the repo were affected — they don't put `.tsx` spec files in `pages/`. Only this PR introduced one.

## What Didn't Work

- Re-running the build / clearing Nx cache. The failure is deterministic; it's not a stale cache.
- Configuring `pageExtensions` in `next.config.js` to exclude spec files. Next's `pageExtensions` is an allow-list of extensions that count as pages — the default is `['tsx', 'ts', 'jsx', 'js']`. There's no built-in way to filter `.spec.tsx` while keeping `.tsx`, so this would require renaming every page module to `*.page.tsx` (massive scope).
- Suspecting the merge from `main` brought in something unrelated. The actual cause was Next 16 + Turbopack semantics; nothing about the spec file or the page changed in this PR.
- Suspecting the `jest.*` calls were the issue. The TypeScript error about `jest` namespace was real but secondary — it surfaced because the spec was in a path that shared TS compilation with page modules under the new compiler rules. The primary failure was Turbopack's client/server view split, not the test API.

## Solution

Move the `.tsx` spec file out of `pages/` to a parallel `__tests__/` directory and update the relative imports.

```bash
git mv 'apps/journeys/pages/home/template-gallery/[slug].spec.tsx' \
       'apps/journeys/__tests__/pages/home/template-gallery/[slug].spec.tsx'
```

Update the import paths in the moved spec so the extra `../` levels resolve correctly:

```ts
// Before (in pages/)
import { getStaticProps } from './[slug]'
import { GET_TEMPLATE_GALLERY_PAGE } from '../../../src/libs/getTemplateGalleryPage'

// After (in __tests__/pages/)
import { getStaticProps } from '../../../../pages/home/template-gallery/[slug]'
import { GET_TEMPLATE_GALLERY_PAGE } from '../../../../src/libs/getTemplateGalleryPage'
```

Vitest's default `**/*.{test,spec}.?(c|m)[jt]s?(x)` glob picks up the new location automatically — no test-runner config change needed.

If the journeys app has been migrated to Vitest (`vitest.config.mts` present), also convert any `jest.*` calls in the moved spec to `vi.*` (vitest's globals are `vi`, `describe`, `it`, `expect` — `jest` is not provided):

```ts
// Before
const mockQuery = jest.fn()
jest.mock('../some-module', () => ({ ... }))

// After
const mockQuery = vi.fn()
vi.mock('../some-module', () => ({ ... }))
```

## Why This Works

Next 16 introduced Turbopack as the default builder. Turbopack walks every `.tsx` file in `pages/` and compiles it as a Next.js page module, which means it splits the module into two graphs: the **server** graph (with server-only exports like `getStaticProps`, `getServerSideProps`, `getStaticPaths`) and the **client** graph (those exports stripped). When the spec file — also in `pages/` — imported from a sibling page module, Turbopack resolved the import against the **client** view because cross-module imports inside `pages/` are presumed client-side. `getStaticProps` is server-only, so the client view doesn't expose it, and Turbopack hard-fails the build with `Export getStaticProps doesn't exist in target module`.

Moving the spec out of `pages/` removes it from the page-discovery graph entirely. Turbopack no longer treats it as a page, so it doesn't apply the client/server split when the spec imports from the page module. The spec just runs through Vitest as a normal unit test.

The TS `Cannot use namespace 'jest' as a value` error appeared simultaneously because the moved-file shared the same `tsconfig` scope as page modules; once the file moved out of `pages/` and was rewritten with `vi.*`, both errors resolved.

## Prevention

- **Don't put `.tsx` spec files inside `apps/journeys/pages/` (or any Next.js Pages Router `pages/` directory).** Place them in `apps/<app>/__tests__/pages/<route>/<spec>.spec.tsx` mirroring the route path, or co-locate component tests in `src/`. Other apps in this monorepo follow this convention; the gallery PR was the first to break it.
- **`.ts` specs in `pages/api/` are tolerated** (e.g. `apps/journeys/pages/api/chat/index.spec.ts` works). API routes don't go through the same client/server split that page routes do, so the analogous failure mode doesn't appear. Don't generalize from API specs to page specs.
- **When `apps/journeys` is on Vitest, use `vi.*` not `jest.*`.** The `vitest.config.mts` sets `globals: true`, which exposes `vi`, `describe`, `it`, `expect` — but not `jest`. Importing the wrong API will fail TS type-check (`Cannot use namespace 'jest' as a value`) and the test runtime won't have `jest.mock`. The list of vitest-migrated workspaces is in `.claude/rules/running-vitest-tests.md`.
- **A spec passing locally under Vitest is not a build-pass signal.** Vitest skips Turbopack entirely; CI's `nx build` is the first time the page-routing rules apply. Run `nx build journeys` before pushing if you've added or moved files inside `pages/`.
- If the symptom appears, **read the dev-server / build log for which page is being compiled** before debugging the resolver, ACL, or federation. The actual page name in the error message is the fastest way to identify a misrouted spec or an unintended page registration.

## Related Issues

- NES-1552 PR #9144 (the PR where this failure was diagnosed)
- `apps/journeys/__tests__/pages/home/template-gallery/[slug].spec.tsx` (the moved spec)
- `.claude/rules/running-vitest-tests.md` (the rule listing vitest-migrated workspaces)
- `.claude/rules/running-jest-tests.md` (notes which workspaces are still on Jest)
- Next.js docs: `pageExtensions` and the rationale for treating every page-dir file as a route
