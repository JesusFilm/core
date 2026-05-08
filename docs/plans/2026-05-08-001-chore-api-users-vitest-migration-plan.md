---
title: 'chore: Migrate api-users tests from Jest to Vitest'
type: chore
status: active
date: 2026-05-08
---

# chore: Migrate api-users tests from Jest to Vitest

## Summary

Finish the Jest → Vitest migration on `apis/api-users`, mirroring the recipes already proven on `apis/api-analytics` (commit `bc0da938d`) and `apis/api-media` (commit `6c28772e2`, PR #9179). Replace the Jest config and runner with a Vitest config, swap the single test setup file (`test/prismaMock.ts`) and 9 spec files from `jest`/`jest-mock-extended` to `vi`/`vitest-mock-extended`, and update `project.json`, `tsconfig.spec.json`, and `tsconfig.app.json` to point at the new toolchain. With api-users, all four backend APIs that previously ran Jest (`api-analytics`, `api-media`, now `api-users`) align on Vitest. `api-journeys` and `api-journeys-modern` keep their existing Jest setup — out of scope here.

---

## Problem Frame

`apis/api-users` is one of the remaining workspace APIs still running Jest after `api-analytics` and `api-media` migrated to Vitest. Aligning api-users on the same runner removes a per-app divergence in test tooling and shrinks the surface that depends on the root `jest.preset.js` / `ts-jest` toolchain.

---

## Requirements

- R1. `apis/api-users/jest.config.ts` is deleted; a new `apis/api-users/vitest.config.mts` exists and matches the `api-analytics` shape, adjusted for api-users's `setupFiles` (only `./test/prismaMock.ts`) and `coverage.reportsDirectory` (`'../../coverage/apis/api-users'`).
- R2. `apis/api-users/project.json` `test` target uses `@nx/vitest:test` with `configFile: apis/api-users/vitest.config.mts`. `outputs` remains `["{workspaceRoot}/coverage/apis/api-users"]`.
- R3. `apis/api-users/tsconfig.spec.json` uses `vitest/globals` (and removes `jest`/`@jest/globals`); `apis/api-users/tsconfig.app.json` removes `jest.config.ts` from `exclude`. `tsconfig.app.json` does not currently list `jest` in `types`, so no edit is needed there for `types`.
- R4. The single test setup file (`apis/api-users/test/prismaMock.ts`) compiles and runs under Vitest — `jest.*` calls become `vi.*`, `jest-mock-extended` becomes `vitest-mock-extended`, and the synchronous `jest.requireActual` mock factory becomes the async `vi.importActual` form used in `api-analytics`.
- R5. All 9 spec files under `apis/api-users/src/**/*.spec.ts` compile and run under Vitest — every `jest` global and `jest`-namespaced type is rewritten to its Vitest equivalent.
- R6. `nx test api-users --skip-nx-cache` passes with the same suites green as before the migration (no test deletions, no skipped suites added).
- R7. The branch carries no remaining references to `jest`, `jest-mock-extended`, `@jest/globals`, `ts-jest`, or `jest.preset.js` from inside `apis/api-users/**`.

---

## Scope Boundaries

- Out of scope: migrating other apps (`api-journeys`, `api-journeys-modern`, `api-languages`) — they keep their existing Jest setup.
- Out of scope: changing test behavior, adding new tests, or fixing pre-existing flakes.
- Out of scope: removing root-level Jest dependencies or deleting `jest.preset.js` (other workspaces still depend on them).
- Out of scope: GraphQL/Pothos schema, runtime, worker, or email-template code changes — only test configuration and test files are touched.
- Out of scope: changes to `apis/api-users/test/client.ts` — it is a runtime helper for the GraphQL HTTP executor, not a Jest construct, so it ports as-is.

---

## Context & Research

### Relevant Code and Patterns

- **Reference migration #1 (the canonical template):** commit `bc0da938d` ("chore: update dependencies and migrate tests from Jest to Vitest"). Shows the exact diff shape for `vitest.config.mts`, `project.json`, `tsconfig.spec.json`, the prisma mock setup, and a representative spec file.
- **Reference migration #2 (most recent precedent):** commit `6c28772e2` (PR #9179, "chore(api-media): migrate test suite from Jest to Vitest"). Same recipe applied at scale (63 spec files); confirms the recipe is repeatable and surfaces the per-file edge cases (`jest.requireActual`, `jest.requireMock`) that also appear in api-users.
- `apis/api-analytics/vitest.config.mts` — config to mirror for api-users, swapping `setupFiles` to `['./test/prismaMock.ts']` and `reportsDirectory` to `'../../coverage/apis/api-users'`.
- `apis/api-analytics/test/prismaMock.ts` — pattern for converting `jest-mock-extended` setup files to `vitest-mock-extended` with `vi.importActual` (async factory). The api-users `prismaMock.ts` is structurally identical except for the package path (`@core/prisma/users/client` vs `@core/prisma/analytics/client`).
- `apis/api-analytics/tsconfig.spec.json` and `apis/api-analytics/tsconfig.app.json` — the post-migration tsconfig shape to mirror. api-users adds `**/*.spec.tsx` to `include` even though no `.tsx` specs exist today; preserve that to keep the surface identical to pre-migration.

### Spec Files To Migrate

`apis/api-users/src/**/*.spec.ts` — 9 files, ~63 `jest.*` references. Patterns observed (counts via `grep -rE "jest\.[a-zA-Z]+" apis/api-users/src --include="*.spec.ts"`):

- `jest.fn` (21), `jest.mock` (14), `jest.clearAllMocks` (6), `jest.mocked` (1) — direct one-to-one replacement with the `vi` namespace.
- `jest.MockedFunction` (10), `jest.Mock` (2) — replace with the `MockedFunction` / `Mock` named imports from `vitest`.
- `jest.requireActual` (1) — appears once in `schema/user/findOrFetchUser.spec.ts` inside a `jest.mock(...)` factory. Convert that factory to `vi.mock(path, async () => ({ ...(await vi.importActual(path)), ... }))`.
- `jest.requireMock` (8) — all 8 occurrences are inside `schema/user/findOrFetchUser.spec.ts`, used inside async test bodies to retrieve the mocked `auth` from `@core/yoga/firebaseClient` (e.g. `const { auth } = jest.requireMock('@core/yoga/firebaseClient')`). All calling tests are already `async`, so each call converts to `const { auth } = (await vi.importMock<typeof import('@core/yoga/firebaseClient')>('@core/yoga/firebaseClient'))`. No structural rewrite needed.
- No `jest.setTimeout`, `jest.SpyInstance`, `jest.MockedClass`, or `jest.Mocked` — these patterns from api-media do not appear in api-users.

### Migration Targets — Confirmed Surface

- **63 `jest.*` occurrences** across **9 spec files**; **1 setup file** (`test/prismaMock.ts`).
- **No spec file currently uses `vi.*`** or imports from `vitest`, so no merge conflict with prior partial migration.
- **`jest-mock-extended` appears only in `test/prismaMock.ts`** — not in any spec file. This narrows U2 to a single file edit.
- **`test/client.ts`** uses no Jest constructs (it just builds an HTTP executor for `yoga.fetch`), so it ports as-is.

### Institutional Learnings

- The monorepo has a project rule (`.claude/rules/running-jest-tests.md`) that Jest tests are run via `npx jest --config <config> --no-coverage <path>` rather than `nx test` because `--testPathPattern` is silently ignored. Once api-users is on Vitest, prefer `npx vitest run --config apis/api-users/vitest.config.mts <path>` for single-file iteration during the migration to keep the feedback loop tight. Use `nx test api-users` for the final green-suite verification.
- Recent precedent (api-media, PR #9179) confirmed the recipe is mechanical for the bulk of replacements; the only judgement calls are around `jest.requireActual` / `jest.requireMock` factory shapes, both of which appear in api-users only inside `findOrFetchUser.spec.ts`.

### External References

None required — the recipe is fully captured in the in-tree reference commits.

---

## Key Technical Decisions

- **Mirror the api-analytics + api-media recipes rather than re-deriving.** Both prior commits are the source of truth for config shape, dependency choices, and import style. Any deviation must be justified by an api-users-specific need (in practice, only the package paths and the `setupFiles` list change).
- **Use globals (`globals: true` in `vitest.config.mts`) and `vitest/globals` types.** Matches both prior migrations; means specs can keep `describe`/`it`/`expect`/`beforeEach` as ambient globals and only need to import `vi` (and any concrete types like `Mock`, `MockedFunction`) from `vitest`.
- **Convert mock factories to async only where a real module import is needed.** The single `jest.requireActual` call (in `findOrFetchUser.spec.ts`'s `@core/yoga/firebaseClient` mock factory) becomes an async `vi.mock` factory. All other plain `jest.mock(path, () => ({...}))` factories stay synchronous. Keeps the diff minimal.
- **Convert `jest.requireMock` → `await vi.importMock` in place; do not refactor to a hoisted top-level mock reference.** All 8 calls are already inside async test bodies, so the smallest-diff conversion is to add `await` inline. Refactoring to a `vi.hoisted`-shared mock is tempting but expands the diff and risks subtle behavioral changes (mock instance identity, `mockReturnValueOnce` semantics).
- **Codemod-by-pattern, not blind sed.** The shape `jest.X` → `vi.X` is mostly mechanical, but `jest.MockedFunction<…>` → `MockedFunction<…>` and `jest.requireActual` → `await vi.importActual` change the imports of the file. Use `grep` to enumerate, then edit each file with `Edit`/`replace_all` so the `import { vi, type Mock, type MockedFunction, ... } from 'vitest'` line is added exactly once and only where it's needed.
- **Do not touch root `jest.preset.js` or root `package.json` Jest deps.** Other workspaces (`api-journeys`, `api-journeys-modern`, `api-languages`, plus many libs) still rely on them; the api-analytics and api-media migrations also left them in place.
- **Preserve `tsconfig.app.json` `exclude` entries that are not Jest-specific** — only drop `jest.config.ts`. Entries like `**/*.stories.ts` and `src/lib/apiUsersConfig/**` are unrelated to the migration and must remain.
- **Preserve `tsconfig.spec.json` `include` entries that survive the migration** — keep `**/*.spec.ts`, `**/*.spec.tsx`, `**/*.d.ts`, `test/**/*.ts`. Add `vitest.config.mts`, drop `jest.config.ts`. The `**/*.spec.tsx` entry stays even though no `.tsx` spec exists today; matches the pre-migration include surface.

---

## Open Questions

### Resolved During Planning

- _Should we delete root Jest dependencies?_ — No. Other workspaces still use Jest; out of scope.
- _Do we need a CHANGELOG or release note?_ — No. Pure tooling migration with no user-visible behavior change.
- _Is there a partial migration in flight?_ — No. Confirmed no `vitest` imports under `apis/api-users/**` yet.
- _Does any spec use `jest-mock-extended` directly?_ — No. Confirmed via `grep -rn "jest-mock-extended" apis/api-users/src` — zero hits in spec files; only the setup file imports it.
- _Does any spec use `jest.setTimeout` or other long-tail Jest APIs?_ — No. Pattern-count audit (above) returned only `fn`, `mock`, `mocked`, `Mock`, `MockedFunction`, `clearAllMocks`, `requireActual`, `requireMock`.

### Deferred to Implementation

- Whether the `await vi.importMock<typeof import('@core/yoga/firebaseClient')>(...)` form needs the explicit type parameter on every call site, or only on the first one in each `describe` block. Decide while editing — pick the minimum that keeps the file's TypeScript clean.
- Whether `nx test api-users --skip-nx-cache` surfaces any per-test ordering or hoisting differences vs. Jest. Triage in U4 only if a specific failure exposes the issue.

---

## Implementation Units

- U1. **Bootstrap api-users Vitest configuration**

**Goal:** Add the Vitest config and switch the Nx target so `nx test api-users` invokes Vitest.

**Requirements:** R1, R2, R3

**Dependencies:** None.

**Files:**

- Create: `apis/api-users/vitest.config.mts`
- Modify: `apis/api-users/project.json`
- Modify: `apis/api-users/tsconfig.spec.json`
- Modify: `apis/api-users/tsconfig.app.json`
- Delete: `apis/api-users/jest.config.ts`

**Approach:**

- Copy `apis/api-analytics/vitest.config.mts` verbatim, then change `setupFiles` to `['./test/prismaMock.ts']` and `reportsDirectory` to `'../../coverage/apis/api-users'`. Keep `globals: true`, `environment: 'node'`, `reporters: ['default']`, `passWithNoTests: true`, and the `vite-tsconfig-paths` plugin shape unchanged. Do **not** copy api-media's `resolve.dedupe: ['graphql']` or `pool: 'forks'` — neither was needed for api-analytics, and api-users has no graphql-dedup or worker-pool pressure surfaced by current test set.
- In `project.json`, change the `test` target's `executor` from `@nx/jest:jest` to `@nx/vitest:test` and replace `options.jestConfig` with `options.configFile: 'apis/api-users/vitest.config.mts'`. Leave `outputs` as `["{workspaceRoot}/coverage/apis/api-users"]`.
- In `tsconfig.spec.json`, replace `types: ['jest', '@jest/globals', 'node', '@nx/react/typings/cssmodule.d.ts', '@nx/react/typings/image.d.ts']` with `types: ['vitest/globals', 'node', '@nx/react/typings/cssmodule.d.ts', '@nx/react/typings/image.d.ts']`. Update `include` to `['**/*.spec.ts', '**/*.spec.tsx', '**/*.d.ts', 'vitest.config.mts', 'test/**/*.ts']` (drop `jest.config.ts`).
- In `tsconfig.app.json`, drop `'jest.config.ts'` from `exclude`. Leave all other entries (`**/*.spec.ts`, `**/*.spec.tsx`, `**/*.stories.ts`, `**/*.stories.tsx`, `test/**/*.ts`, `src/lib/apiUsersConfig/**`) intact. The `types` array does not currently include `'jest'`, so no edit is needed there.
- Delete `apis/api-users/jest.config.ts`.

**Patterns to follow:**

- `apis/api-analytics/vitest.config.mts`
- `apis/api-analytics/project.json` (the migrated `test` target)
- `apis/api-analytics/tsconfig.spec.json` and `apis/api-analytics/tsconfig.app.json`

**Test scenarios:**

- Test expectation: none — pure config change. Verification at the end of U4 covers correctness.

**Verification:**

- `apis/api-users/jest.config.ts` no longer exists.
- `apis/api-users/vitest.config.mts` exists. Type-check (`pnpm exec tsc -p apis/api-users/tsconfig.spec.json --noEmit`) is deferred until U2/U3 are done so unmigrated files don't blow up the type-check.

---

- U2. **Migrate the prisma test setup file**

**Goal:** Convert `apis/api-users/test/prismaMock.ts` to Vitest so `setupFiles` runs cleanly before any spec.

**Requirements:** R4

**Dependencies:** U1.

**Files:**

- Modify: `apis/api-users/test/prismaMock.ts`

**Approach:**

- Replace `import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'` with the same names imported from `vitest-mock-extended`.
- Add `import { beforeEach, vi } from 'vitest'` as the first import.
- Convert the synchronous `jest.mock('@core/prisma/users/client', () => ({ __esModule: true, ...jest.requireActual('@core/prisma/users/client'), prisma: mockDeep<PrismaClient>() }))` to the async form: `vi.mock('@core/prisma/users/client', async () => ({ __esModule: true, ...(await vi.importActual('@core/prisma/users/client')), prisma: mockDeep<PrismaClient>() }))`. The structure should match `apis/api-analytics/test/prismaMock.ts` exactly, with the package path swapped from `@core/prisma/analytics/client` to `@core/prisma/users/client`.
- Keep `beforeEach(() => { mockReset(prismaMock) })` and the `prismaMock` export unchanged.

**Patterns to follow:**

- `apis/api-analytics/test/prismaMock.ts` for the async `vi.importActual` factory shape.

**Test scenarios:**

- Test expectation: none — this file is a setup helper. Its correctness is verified via the spec suite green-state in U4.

**Verification:**

- `grep -rE "\\bjest\\b|jest-mock-extended" apis/api-users/test/` returns no hits.

---

- U3. **Migrate all 9 spec files from Jest to Vitest**

**Goal:** Rewrite every `jest.*` reference in `apis/api-users/src/**/*.spec.ts` to its Vitest equivalent and add the necessary `vitest` imports.

**Requirements:** R5, R7

**Dependencies:** U1, U2.

**Files:**

- Modify: `apis/api-users/src/schema/user/verifyUser.spec.ts`
- Modify: `apis/api-users/src/schema/user/user.spec.ts`
- Modify: `apis/api-users/src/schema/user/validateEmail.spec.ts`
- Modify: `apis/api-users/src/schema/user/findOrFetchUser.spec.ts`
- Modify: `apis/api-users/src/schema/userDelete/service/lookupUser.spec.ts`
- Modify: `apis/api-users/src/schema/userDelete/service/deleteUserData.spec.ts`
- Modify: `apis/api-users/src/schema/userDelete/service/deleteFirebaseOnlyAccount.spec.ts`
- Modify: `apis/api-users/src/schema/userDelete/service/types.spec.ts`
- Modify: `apis/api-users/src/workers/email/service/service.spec.ts`

**Approach:**

- For each file, in this order:
  1. Add `import { vi, ... } from 'vitest'` (only the names actually used — `vi` always, plus `type Mock`, `type MockedFunction` as needed). Place it as the first import.
  2. Replace tokens using `replace_all` per file, scoped to identifiers (avoid replacing inside string literals or test names):
     - `jest.fn` → `vi.fn`
     - `jest.mock` → `vi.mock`
     - `jest.mocked` → `vi.mocked`
     - `jest.clearAllMocks` → `vi.clearAllMocks`
     - `jest.Mock` (when used as a type cast, e.g. `as jest.Mock`) → `Mock`
     - `jest.MockedFunction` → `MockedFunction`
  3. **`findOrFetchUser.spec.ts` only** — handle the two non-mechanical cases:
     - Convert the `jest.mock('@core/yoga/firebaseClient', () => ({ ...jest.requireActual('@core/yoga/firebaseClient'), auth: { ... } }))` factory to `vi.mock('@core/yoga/firebaseClient', async () => ({ ...(await vi.importActual<typeof import('@core/yoga/firebaseClient')>('@core/yoga/firebaseClient')), auth: { ... } }))`. The inner `jest.fn().mockReturnValue(...)` inside the `auth.getUser` definition becomes `vi.fn().mockReturnValue(...)`.
     - Convert each of the 8 `const { auth } = jest.requireMock('@core/yoga/firebaseClient')` calls in test bodies to `const { auth } = await vi.importMock<typeof import('@core/yoga/firebaseClient')>('@core/yoga/firebaseClient')`. All calling tests are already `async`, so no signature change is needed.
- After per-file edits, run `npx vitest run --config apis/api-users/vitest.config.mts <single-spec-path>` to confirm each file at least loads without resolution errors before moving on. Then `grep -rE "\\bjest\\b" apis/api-users/src --include="*.spec.ts"` to confirm zero residual hits.

**Patterns to follow:**

- `apis/api-analytics/src/scripts/sites-add-goals.spec.ts` (representative migrated spec showing the import style and `as Mock` cast).
- `apis/api-analytics/src/schema/site/siteCreate.mutation.spec.ts` for `vi.mock` with a factory.
- `apis/api-media/**/*.spec.ts` (post-PR-#9179) for `vi.importActual` async factory examples that closely match `findOrFetchUser.spec.ts`'s shape.

**Test scenarios:**

- Test expectation: none — this unit moves existing tests to a new runner without behavior changes. The full-suite green-state in U4 is the verification.
- During the migration, run each migrated spec file individually (`npx vitest run --config apis/api-users/vitest.config.mts <path>`) to catch import or factory-shape regressions early. Spec authors do not write new tests here.

**Verification:**

- `grep -rE "\\bjest\\b" apis/api-users/src --include="*.spec.ts"` returns zero matches.
- `grep -rE "jest-mock-extended|@jest/globals" apis/api-users/src --include="*.spec.ts"` returns zero matches.

---

- U4. **Run the full api-users test suite under Vitest and resolve fallout**

**Goal:** Get `nx test api-users` green under the new toolchain so the migration is complete.

**Requirements:** R6, R7

**Dependencies:** U1, U2, U3.

**Files:**

- Modify: any spec or setup file that surfaces a runtime regression once the suite runs end-to-end.

**Approach:**

- Run `nx test api-users --skip-nx-cache` (or `npx vitest run --config apis/api-users/vitest.config.mts` if Nx caching gets in the way during iteration).
- Triage failures into three buckets and fix in order:
  1. **Module-resolution failures** — usually a `vi.importActual` factory that should have stayed synchronous, or vice versa, or a missing `vitest-mock-extended` import.
  2. **Type-cast failures at runtime** — usually a `jest.Mock`/`jest.MockedFunction` that didn't get its accompanying `vitest` import added.
  3. **Hoisting-related failures** — Vitest hoists `vi.mock` calls similarly to Jest, but a factory that captures a top-level `const` may need an inline `vi.hoisted(() => ...)` wrapper. Apply only when a specific test exposes the issue. The single high-risk case is `findOrFetchUser.spec.ts` — verify its async `vi.mock` factory hoists correctly above the test bodies that consume `auth`.
- Confirm `pnpm exec tsc -p apis/api-users/tsconfig.spec.json --noEmit` is clean.
- Confirm `nx lint api-users` does not regress.

**Patterns to follow:**

- The api-analytics and api-media migrations deliberately changed only what was required to make the suite green; mirror that restraint here. Avoid restructuring tests that already pass.

**Test scenarios:**

- The pre-existing api-users test suite, unchanged in coverage, must pass under Vitest:
  - All 9 spec files load without module-resolution errors.
  - All previously-passing assertions remain green.
  - `findOrFetchUser.spec.ts`'s 8 `await vi.importMock(...)` call sites resolve and return the same `auth` mock that the `vi.mock` factory installed.
  - `prismaMock.ts`'s async `vi.importActual` factory installs the deep-mocked Prisma client before the first spec runs.

**Verification:**

- `nx test api-users --skip-nx-cache` exits zero with the same number of passing tests as before the migration.
- Coverage report writes to `coverage/apis/api-users/`.
- No `jest`/`jest-mock-extended`/`@jest/globals`/`ts-jest` strings remain inside `apis/api-users/**`.

---

## System-Wide Impact

- **Interaction graph:** `nx test api-users` is the only direct consumer; CI calls it via existing pipelines that use `nx affected --target=test`. The Nx executor change is the only contact point.
- **Error propagation:** Vitest reports failures with a different shape than Jest, but CI parses the exit code, not the format. No downstream code reads test output as data.
- **State lifecycle risks:** None — no migrations, no persistent state changes.
- **API surface parity:** None — internal tooling change only. GraphQL schema, resolvers, and Prisma usage are untouched.
- **Integration coverage:** All existing api-users integration tests must keep running unchanged; if any rely on Jest-specific timer or fake-module behavior, surface it during U4 triage rather than papering over.
- **Unchanged invariants:** Runtime code in `apis/api-users/src/**` (non-spec) is not modified. The GraphQL schema, email workers, prisma usage, and Firebase integration are untouched. Other workspaces' Jest setups remain as-is. The `apis/api-users/test/client.ts` GraphQL HTTP executor helper is unchanged.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `jest.requireActual` → `await vi.importActual` change in `findOrFetchUser.spec.ts` introduces async ordering bugs in the `@core/yoga/firebaseClient` factory. | Mirror the api-analytics async-factory pattern; verify per-file with `npx vitest run` before moving on. The factory only needs to install the mocked `auth.getUser` — the spread of the real module is for any non-mocked exports the runtime imports. |
| `jest.requireMock` → `await vi.importMock` conversion in test bodies returns a different module instance than the one the `vi.mock` factory installed (mock-instance identity issue). | All 8 call sites are inside async tests in the same file as the `vi.mock` factory, so Vitest serves the same mocked module from cache. Verify by running `findOrFetchUser.spec.ts` in isolation first; if identity drift surfaces, refactor to capture the mocked `auth` once at the top of the `describe` via `vi.hoisted`. |
| Spec files that rely on Jest's auto-mocking or implicit module resolution behave differently under Vitest. | Triage in U4 individually. Vitest's hoisting model is documented; use `vi.hoisted` only where a specific failure forces it. |
| The `@nx/vitest:test` executor surfaces a different `outputs` or coverage-path expectation than `@nx/jest:jest`. | Mirror api-analytics's `project.json` exactly; CI cache hashing keys off the `test` target spec, so any mismatch fails fast in U4. |
| Hidden duplicate test setup (e.g., a global `jest.setup` referenced via `jest.preset.js`). | The current `jest.config.ts` references only `setupFilesAfterEach: ['<rootDir>/test/prismaMock.ts']` plus the root preset's transform pipeline. The Vitest config replaces both via `setupFiles` and the built-in TS support; no other setup hooks to preserve. |
| A future api-users spec is added with `jest.*` syntax during the open-PR window. | Run a final `grep -rE "\\bjest\\b" apis/api-users/src --include="*.spec.ts"` immediately before merge to catch any drift introduced by other branches. |

---

## Documentation / Operational Notes

- Updating `.claude/rules/running-jest-tests.md` is **not** required — that rule still governs the remaining Jest-running apps (`api-journeys`, `api-journeys-modern`, `api-languages`, plus libs). A separate Vitest rule may follow once more workspaces are migrated; it is out of scope here.
- No rollout, monitoring, or ops impact.

---

## Sources & References

- Reference commit #1: `bc0da938d` ("chore: update dependencies and migrate tests from Jest to Vitest") — full diff for `api-analytics`.
- Reference commit #2: `6c28772e2` (PR #9179, "chore(api-media): migrate test suite from Jest to Vitest") — most recent precedent at scale.
- Prior plan: `docs/plans/2026-05-07-001-chore-api-media-vitest-migration-plan.md` — same recipe applied to api-media.
- Vitest migration docs: https://vitest.dev/guide/migration.html (only consulted for `vi.importActual`/`vi.importMock` async semantics; the in-tree reference is otherwise authoritative).
