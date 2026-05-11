---
title: 'chore: Migrate api-media tests from Jest to Vitest'
type: chore
status: active
date: 2026-05-07
---

# chore: Migrate api-media tests from Jest to Vitest

## Summary

Finish the Jest → Vitest migration for `apis/api-media`, mirroring the recipe already proven on `apis/api-analytics` (commit `bc0da938d`). Replace the Jest config and runner with a Vitest config, swap test setup files and 63 spec files from `jest`/`jest-mock-extended` to `vi`/`vitest-mock-extended`, and update `project.json` and `tsconfig.spec.json` to point at the new toolchain.

---

## Problem Frame

The branch `26-00-MA-chore-vitest-media` was created to migrate `api-media` to Vitest, but only `api-analytics` was migrated in the prior commit. `api-media` is the only remaining workspace API with a `jest.config.ts` that needs the same treatment to align the api codebase on a single test runner.

---

## Requirements

- R1. `apis/api-media/jest.config.ts` is deleted; a new `apis/api-media/vitest.config.mts` exists and matches the `api-analytics` shape, adjusted for `api-media`'s `setupFiles` and coverage path.
- R2. `apis/api-media/project.json` `test` target uses `@nx/vitest:test` with `configFile: apis/api-media/vitest.config.mts`.
- R3. `apis/api-media/tsconfig.spec.json` uses `vitest/globals` (and removes `jest`/`@jest/globals`); `apis/api-media/tsconfig.app.json` removes `jest` from `types` and drops `jest.config.ts` from `exclude`.
- R4. All three test setup files (`apis/api-media/test/prismaMock.ts`, `apis/api-media/test/bullmqMock.ts`, `apis/api-media/test/crowdinMock.ts`) compile and run under Vitest — `jest.*` calls become `vi.*`, `jest-mock-extended` becomes `vitest-mock-extended`, and the synchronous `jest.requireActual` mock factory in `prismaMock.ts` becomes the async `vi.importActual` form used in `api-analytics`.
- R5. All 63 spec files under `apis/api-media/src/**/*.spec.ts` compile and run under Vitest — every `jest` global and `jest`-namespaced type is rewritten to its Vitest equivalent.
- R6. `nx test api-media --skip-nx-cache` passes with the same suites green as before the migration (no test deletions, no skipped suites added).
- R7. The branch carries no remaining references to `jest`, `jest-mock-extended`, `@jest/globals`, `ts-jest`, or `jest.preset.js` from inside `apis/api-media/**`.

---

## Scope Boundaries

- Out of scope: migrating other apps (`api-journeys`, `api-journeys-modern`, `api-languages`, `api-users`) — they keep their existing Jest setup.
- Out of scope: changing test behavior, adding new tests, or fixing pre-existing flakes.
- Out of scope: removing root-level Jest dependencies or deleting `jest.preset.js` (other workspaces still depend on them).
- Out of scope: GraphQL/Pothos schema, runtime, or worker code changes — only test configuration and test files are touched.

---

## Context & Research

### Relevant Code and Patterns

- **Reference migration (the template):** commit `bc0da938d` ("chore: update dependencies and migrate tests from Jest to Vitest"). Shows the exact diff shape for `vitest.config.mts`, `project.json`, `tsconfig.spec.json`, the prisma mock setup, and a representative spec file.
- `apis/api-analytics/vitest.config.mts` — config to mirror for api-media, swapping `setupFiles` to `['./test/prismaMock.ts', './test/bullmqMock.ts', './test/crowdinMock.ts']` and `reportsDirectory` to `'../../coverage/apis/api-media'`.
- `apis/api-analytics/test/prismaMock.ts` — pattern for converting `jest-mock-extended` setup files to `vitest-mock-extended` with `vi.importActual` (async factory).
- `apis/api-analytics/test/timers.ts` — pattern for `vi.useFakeTimers` / `vi.setSystemTime` (not currently used by api-media specs, but useful if any are added during migration cleanup).
- `apis/api-media/test/{prismaMock,bullmqMock,crowdinMock}.ts` — three setup files to migrate. Note: `crowdinMock.ts` uses `mockDeep<typeof crowdinClient>()` and a top-level `process.env` set; the `vi.mock` factory must be async to use `vi.importActual` if any pieces of the real module need preservation.

### Spec Files To Migrate

`apis/api-media/src/**/*.spec.ts` — 63 files, ~526 `jest.*` references. Patterns observed:

- `jest.fn`, `jest.mock`, `jest.spyOn`, `jest.mocked`, `jest.clearAllMocks`, `jest.resetAllMocks`, `jest.restoreAllMocks`, `jest.setTimeout` — direct one-to-one replacement with the `vi` namespace.
- `jest.Mock`, `jest.Mocked`, `jest.MockedClass`, `jest.MockedFunction`, `jest.SpyInstance` — replace with the corresponding `vitest`-namespaced or named imports (`Mock`, `Mocked`, `MockedClass`, `MockedFunction`, `MockInstance`).
- `jest.requireActual`, `jest.requireMock` — non-trivial. The Vitest equivalents `vi.importActual` and `vi.importMock` are async. Within a `vi.mock(path, async () => { ... })` factory this works directly. Outside a factory (e.g. the `node-fetch` `Response` import in `apis/api-media/src/schema/shortLink/shortLinkDomain/shortLinkDomain.service.spec.ts`), convert to a top-level `const { Response } = await vi.importActual<typeof import('node-fetch')>('node-fetch')` — note this may need to move into a `beforeAll` if a top-level `await` isn't supported by the spec file's module mode.

### Migration Targets — Confirmed Surface

Patterns (count via `grep -rE "jest\.[a-zA-Z]+" apis/api-media/src --include="*.spec.ts" | wc -l`): **526 occurrences**, **63 spec files**, **3 setup files**. No spec file currently uses `vi.*` or imports from `vitest`, so no merge conflict with prior partial migration.

### Institutional Learnings

- This monorepo has a project rule that Jest tests are run via `npx jest --config <config> --no-coverage <path>` rather than `nx test` because `--testPathPattern` is silently ignored. Once migrated, prefer `npx vitest run --config apis/api-media/vitest.config.mts <path>` for single-file iteration during the migration to keep the feedback loop tight. Use `nx test api-media` for the final green-suite verification.

### External References

None required — the recipe is fully captured in the in-tree reference commit.

---

## Key Technical Decisions

- **Mirror the api-analytics recipe rather than re-deriving.** The `bc0da938d` commit is the source of truth for config shape, dependency choices, and import style. Any deviation must be justified by a media-specific need (e.g., the extra setup files).
- **Use globals (`globals: true` in `vitest.config.mts`) and `vitest/globals` types.** Matches the api-analytics setup; means specs can keep `describe`/`it`/`expect`/`beforeEach` as ambient globals and only need to import `vi` (and any concrete types like `Mock`, `MockedFunction`) from `vitest`.
- **Convert mock factories to async only where a real module import is needed.** Plain factories with no `requireActual` stay synchronous; only the prisma/bullmq/crowdin/`videoVariant` and similar mocks that use `jest.requireActual` switch to `async () => ({ ...(await vi.importActual(...)), ... })`. Keeps the diff minimal.
- **Codemod-by-pattern, not blind sed.** The shape `jest.X` → `vi.X` is mostly mechanical, but `jest.MockedFunction<…>` → `MockedFunction<…>` and `jest.requireActual` → `await vi.importActual` change the imports of the file. Use `grep` to enumerate, then edit each file with `Edit`/`replace_all` so the `import { vi, type Mock, ... } from 'vitest'` line is added exactly once and only where it's needed.
- **`jest.setTimeout(10000)` (used in `dataExport/service/service.spec.ts`) becomes `vi.setConfig({ testTimeout: 10000 })`** at the top of the affected `describe` block, which is the documented Vitest equivalent.
- **Do not touch root `jest.preset.js` or root `package.json` Jest deps.** Other workspaces still rely on them; the api-analytics migration also left them in place.

---

## Open Questions

### Resolved During Planning

- _Should we delete root Jest dependencies?_ — No. Other workspaces still use Jest; out of scope.
- _Do we need a CHANGELOG or release note?_ — No. Pure tooling migration with no user-visible behavior change.
- _Is there a partial migration in flight?_ — No. Confirmed no `vitest` imports under `apis/api-media/**` yet.

### Deferred to Implementation

- Whether any individual spec file requires structural rework beyond a search-and-replace (e.g., the `await vi.importActual` move for the `node-fetch` `Response` case in `shortLinkDomain.service.spec.ts`). Resolve per-file as the migration runs.
- Whether `vi.setConfig({ testTimeout: 10000 })` is the right shape for the long-running `dataExport` test, or whether the timeout should move to the `vitest.config.mts` `testTimeout` field. Decide when re-running that suite.

---

## Implementation Units

- U1. **Bootstrap api-media Vitest configuration**

**Goal:** Add the Vitest config and switch the Nx target so `nx test api-media` invokes Vitest.

**Requirements:** R1, R2, R3

**Dependencies:** None.

**Files:**

- Create: `apis/api-media/vitest.config.mts`
- Modify: `apis/api-media/project.json`
- Modify: `apis/api-media/tsconfig.spec.json`
- Modify: `apis/api-media/tsconfig.app.json`
- Delete: `apis/api-media/jest.config.ts`

**Approach:**

- Copy `apis/api-analytics/vitest.config.mts` verbatim, then change `setupFiles` to `['./test/prismaMock.ts', './test/bullmqMock.ts', './test/crowdinMock.ts']` and `reportsDirectory` to `'../../coverage/apis/api-media'`. Keep `globals: true`, `environment: 'node'`, `reporters: ['default']`, and the `vite-tsconfig-paths` plugin shape unchanged.
- In `project.json`, change the `test` target's `executor` from `@nx/jest:jest` to `@nx/vitest:test` and replace `options.jestConfig` with `options.configFile: 'apis/api-media/vitest.config.mts'`. Leave `outputs` as `["{workspaceRoot}/coverage/apis/api-media"]`.
- In `tsconfig.spec.json`, replace `types: ['jest', '@jest/globals', 'node', ...]` with `types: ['vitest/globals', 'node', ...]` and update `include` to `['**/*.spec.ts', '**/*.d.ts', 'vitest.config.mts', 'test/**/*.ts']` (drop `__mocks__` and `jest.config.ts`).
- In `tsconfig.app.json`, drop `'jest'` from `types`, drop `'jest.config.ts'` from `exclude`, and add `'vitest.config.mts'` to `exclude` if not already covered by the include rule. Keep all other entries intact.
- Delete `apis/api-media/jest.config.ts`.

**Patterns to follow:**

- `apis/api-analytics/vitest.config.mts`
- `apis/api-analytics/project.json` (the migrated `test` target)
- `apis/api-analytics/tsconfig.spec.json` and `apis/api-analytics/tsconfig.app.json`

**Test scenarios:**

- Test expectation: none — pure config change. Verification at the end of U4 covers correctness.

**Verification:**

- `apis/api-media/jest.config.ts` no longer exists.
- `apis/api-media/vitest.config.mts` exists and parses (`pnpm exec tsc -p apis/api-media/tsconfig.spec.json --noEmit` succeeds, deferred until U2/U3 are done so unmigrated files don't blow up the type-check).

---

- U2. **Migrate the three test setup files**

**Goal:** Convert `prismaMock.ts`, `bullmqMock.ts`, and `crowdinMock.ts` to Vitest so `setupFiles` runs cleanly before any spec.

**Requirements:** R4

**Dependencies:** U1.

**Files:**

- Modify: `apis/api-media/test/prismaMock.ts`
- Modify: `apis/api-media/test/bullmqMock.ts`
- Modify: `apis/api-media/test/crowdinMock.ts`

**Approach:**

- `prismaMock.ts`: replace `jest-mock-extended` import with `vitest-mock-extended`; add `import { beforeEach, vi } from 'vitest'`; convert the `jest.mock(...)` factory to `vi.mock('@core/prisma/media/client', async () => ({ __esModule: true, ...(await vi.importActual('@core/prisma/media/client')), prisma: mockDeep<PrismaClient>() }))`. The structure should match `apis/api-analytics/test/prismaMock.ts` exactly, with the package path swapped from `@core/prisma/analytics/client` to `@core/prisma/media/client`.
- `bullmqMock.ts`: replace `jest.mock('bullmq', () => { ... jest.fn() ... })` with `vi.mock('bullmq', () => { ... vi.fn() ... })`. Add `import { vi } from 'vitest'` at the top. No `requireActual` is needed here — the factory replaces the whole module.
- `crowdinMock.ts`: add `import { beforeEach, vi } from 'vitest'`; replace `jest-mock-extended` with `vitest-mock-extended`; replace the `jest.mock` factory with `vi.mock(...)` (synchronous form is fine since the factory does not call `requireActual`); replace `mockReset(crowdinClientMock)` import path. Keep the `process.env.CROWDIN_*` assignments and exported mock data unchanged.

**Patterns to follow:**

- `apis/api-analytics/test/prismaMock.ts` for the async `vi.importActual` factory shape.

**Test scenarios:**

- Test expectation: none — these files are setup helpers. Their correctness is verified via the spec suite green-state in U4.

**Verification:**

- `pnpm exec tsc -p apis/api-media/tsconfig.spec.json --noEmit` produces only spec-file errors (the three test files themselves type-check).
- `grep -rE "jest|jest-mock-extended" apis/api-media/test/` returns no hits.

---

- U3. **Migrate all 63 spec files from Jest to Vitest**

**Goal:** Rewrite every `jest.*` reference in `apis/api-media/src/**/*.spec.ts` to its Vitest equivalent and add the necessary `vitest` imports.

**Requirements:** R5, R7

**Dependencies:** U1, U2.

**Files:**

- Modify: every file matched by `apis/api-media/src/**/*.spec.ts` (63 files).

**Approach:**

- For each file, in this order:
  1. Add `import { vi, ... } from 'vitest'` (only the names actually used — `vi` always, plus `type Mock`, `type MockedFunction`, `type Mocked`, `type MockedClass`, `type MockInstance` as needed). Place it as the first import.
  2. Replace tokens using `replace_all` per file, scoped to identifiers (avoid replacing inside string literals or test names):
     - `jest.fn` → `vi.fn`
     - `jest.mock` → `vi.mock`
     - `jest.spyOn` → `vi.spyOn`
     - `jest.mocked` → `vi.mocked`
     - `jest.clearAllMocks` → `vi.clearAllMocks`
     - `jest.resetAllMocks` → `vi.resetAllMocks`
     - `jest.restoreAllMocks` → `vi.restoreAllMocks`
     - `jest.Mock` (when used as a type cast, e.g. `as jest.Mock`) → `Mock`
     - `jest.MockedFunction` → `MockedFunction`
     - `jest.MockedClass` → `MockedClass`
     - `jest.Mocked` → `Mocked`
     - `jest.SpyInstance` → `MockInstance`
     - `jest.setTimeout(N)` → `vi.setConfig({ testTimeout: N })` (only used in `workers/dataExport/service/service.spec.ts` per current grep; verify and convert in place).
     - `jest.requireMock(path)` → `await vi.importMock(path)` (only inside an async test/`beforeAll`/factory; only used in `schema/mux/video/video.spec.ts` per current grep — promote the calling test to async if needed).
     - `jest.requireActual(path)` inside a `vi.mock(path, () => ({ ... }))` factory: convert to `vi.mock(path, async () => ({ ...(await vi.importActual(path)) , ... }))`.
     - `jest.requireActual(path)` outside a factory (only `schema/shortLink/shortLinkDomain/shortLinkDomain.service.spec.ts` per current grep): replace with `const { Response } = await vi.importActual<typeof import('node-fetch')>('node-fetch')` inside a `beforeAll` (or convert that file's outer scope to support a top-level await — choose whichever yields the smallest diff).
  3. Replace `import ... from 'jest-mock-extended'` (only `schema/unsplash/service.spec.ts`, `schema/cloudflare/image/service.spec.ts`, `schema/mux/video/service.spec.ts`) with the same names imported from `vitest-mock-extended`.
- After per-file edits, run `npx vitest run --config apis/api-media/vitest.config.mts <single-spec-path>` to confirm each file at least loads without resolution errors before moving on, and `grep -rE "\\bjest\\b" apis/api-media/src --include="*.spec.ts"` to confirm zero residual hits.

**Patterns to follow:**

- `apis/api-analytics/src/scripts/sites-add-goals.spec.ts` (a representative migrated spec showing the import style and `as Mock` cast).
- `apis/api-analytics/src/schema/site/siteCreate.mutation.spec.ts` for `vi.mock` with a factory.

**Test scenarios:**

- Test expectation: none — this unit moves existing tests to a new runner without behavior changes. The full-suite green-state in U4 is the verification.
- During the migration, run each migrated spec file individually (`npx vitest run --config apis/api-media/vitest.config.mts <path>`) to catch import or factory-shape regressions early. Spec authors do not write new tests here.

**Verification:**

- `grep -rE "\\bjest\\b" apis/api-media/src --include="*.spec.ts"` returns zero matches.
- `grep -rE "jest-mock-extended|@jest/globals" apis/api-media/src --include="*.spec.ts"` returns zero matches.

---

- U4. **Run the full api-media test suite under Vitest and resolve fallout**

**Goal:** Get `nx test api-media` green under the new toolchain so the migration is complete.

**Requirements:** R6, R7

**Dependencies:** U1, U2, U3.

**Files:**

- Modify: any spec or setup file that surfaces a runtime regression once the suite runs end-to-end.

**Approach:**

- Run `nx test api-media --skip-nx-cache` (or `npx vitest run --config apis/api-media/vitest.config.mts` if Nx caching gets in the way during iteration).
- Triage failures into three buckets and fix in order:
  1. **Module-resolution failures** — usually a `vi.importActual` factory that should have stayed synchronous, or vice versa, or a missing `vitest-mock-extended` import.
  2. **Type-cast failures at runtime** — usually a `jest.Mock`/`jest.MockedFunction` that didn't get its accompanying `vitest` import added.
  3. **Hoisting-related failures** — Vitest hoists `vi.mock` calls similarly to Jest, but a factory that captures a top-level `const` may need an inline `vi.hoisted(() => ...)` wrapper. Apply only when a specific test exposes the issue.
- Confirm `pnpm exec tsc -p apis/api-media/tsconfig.spec.json --noEmit` is clean.
- Confirm `pnpm exec eslint apis/api-media --max-warnings 0` (or the project's lint script) does not regress.

**Patterns to follow:**

- The api-analytics migration deliberately changed only what was required to make the suite green; mirror that restraint here. Avoid restructuring tests that already pass.

**Test scenarios:**

- The pre-existing api-media test suite, unchanged in coverage, must pass under Vitest:
  - All 63 spec files load without module-resolution errors.
  - All previously-passing assertions remain green.
  - `dataExport` long-running suite respects its timeout via `vi.setConfig({ testTimeout: 10000 })`.
  - `mux/video` spec's `vi.importMock('./service')` paths resolve correctly inside async tests.
  - `shortLinkDomain.service` spec's replacement for `node-fetch`'s `Response` resolves.

**Verification:**

- `nx test api-media --skip-nx-cache` exits zero with the same number of passing tests as before the migration.
- Coverage report writes to `coverage/apis/api-media/`.
- No `jest`/`jest-mock-extended`/`@jest/globals`/`ts-jest` strings remain inside `apis/api-media/**`.

---

## System-Wide Impact

- **Interaction graph:** `nx test api-media` is the only direct consumer; CI calls it via existing pipelines that use `nx affected --target=test`. The Nx executor change is the only contact point.
- **Error propagation:** Vitest reports failures with a different shape than Jest, but the CI parses the exit code, not the format. No downstream code reads test output as data.
- **State lifecycle risks:** None — no migrations, no persistent state changes.
- **API surface parity:** None — internal tooling change only.
- **Integration coverage:** All existing api-media integration tests must keep running unchanged; if any rely on Jest-specific timer or fake-module behavior, surface it during U4 triage rather than papering over.
- **Unchanged invariants:** Runtime code in `apis/api-media/src/**` (non-spec) is not modified. The GraphQL schema, workers, and prisma usage are untouched. Other workspaces' Jest setups remain as-is.

---

## Risks & Dependencies

| Risk                                                                                                                                  | Mitigation                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `jest.requireActual` → `await vi.importActual` change introduces async ordering bugs in mock factories.                               | Mirror the api-analytics async-factory pattern; verify per-file with `npx vitest run` before moving on.                                                                                                |
| Spec files that rely on Jest's auto-mocking or implicit module resolution behave differently under Vitest.                            | Triage in U4 individually. Vitest's hoisting model is documented; use `vi.hoisted` only where a specific failure forces it.                                                                            |
| The `@nx/vitest:test` executor surfaces a different `outputs` or coverage-path expectation than `@nx/jest:jest`.                      | Mirror api-analytics's `project.json` exactly; CI cache hashing keys off the `test` target spec, so any mismatch fails fast in U4.                                                                     |
| Hidden duplicate test setup (e.g., a global `jest.setup` referenced via `jest.preset.js`).                                            | Search `apis/api-media` for any `setupFilesAfterEach`/`globalSetup` in the deleted Jest config; the current `jest.config.ts` shows only the three setup files already enumerated, so this is unlikely. |
| `crowdinMock.ts` exports mock data referenced by specs; converting `jest.mock` to `vi.mock` could change the export-evaluation order. | Keep the same factory shape (synchronous, no `requireActual`) and re-run the crowdin-importer specs first as a smoke test.                                                                             |

---

## Documentation / Operational Notes

- Update `.claude/rules/running-jest-tests.md` is **not** required — that rule only governs Jest invocation, and other apps still use Jest. A separate Vitest rule may follow once more workspaces are migrated; it is out of scope here.
- No rollout, monitoring, or ops impact.

---

## Sources & References

- Reference commit: `bc0da938d` ("chore: update dependencies and migrate tests from Jest to Vitest") — full diff for `api-analytics`.
- Branch: `26-00-MA-chore-vitest-media`.
- Vitest migration docs: https://vitest.dev/guide/migration.html (only consulted for `vi.importActual`/`vi.importMock` async semantics; the in-tree reference is otherwise authoritative).
