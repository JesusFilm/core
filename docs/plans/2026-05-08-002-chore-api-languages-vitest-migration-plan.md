---
title: 'chore: Migrate api-languages tests from Jest to Vitest'
type: chore
status: active
date: 2026-05-08
---

# chore: Migrate api-languages tests from Jest to Vitest

## Summary

Finish the Jest → Vitest migration on `apis/api-languages`, mirroring the recipes already proven on `apis/api-analytics` (commit `bc0da938d`), `apis/api-media` (commit `6c28772e2`, PR #9179), and `apis/api-users` (commit `8bafad172`). Replace the Jest config and runner with a Vitest config, swap the single test setup file (`test/prismaMock.ts`) and 9 spec files from `jest`/`jest-mock-extended` to `vi`/`vitest-mock-extended`, and update `project.json`, `tsconfig.spec.json`, and `tsconfig.app.json` to point at the new toolchain. With api-languages, all backend APIs that previously ran Jest (`api-analytics`, `api-media`, `api-users`, now `api-languages`) align on Vitest. `api-journeys` and `api-journeys-modern` keep their existing Jest setup — out of scope here.

---

## Problem Frame

`apis/api-languages` is one of the remaining workspace APIs still running Jest after `api-analytics`, `api-media`, and `api-users` migrated to Vitest. Aligning api-languages on the same runner removes a per-app divergence in test tooling and shrinks the surface that depends on the root `jest.preset.js` / `ts-jest` toolchain.

---

## Requirements

- R1. `apis/api-languages/jest.config.ts` is deleted; a new `apis/api-languages/vitest.config.mts` exists and matches the `api-analytics` shape, adjusted for api-languages's `setupFiles` (only `./test/prismaMock.ts`) and `coverage.reportsDirectory` (`'../../coverage/apis/api-languages'`).
- R2. `apis/api-languages/project.json` `test` target uses `@nx/vitest:test` with `configFile: apis/api-languages/vitest.config.mts`. `outputs` remains `["{workspaceRoot}/coverage/apis/api-languages"]`.
- R3. `apis/api-languages/tsconfig.spec.json` uses `vitest/globals` (and removes `jest`/`@jest/globals`); `apis/api-languages/tsconfig.app.json` removes `jest.config.ts` from `exclude`. `tsconfig.app.json` does not currently list `jest` in `types`, so no edit is needed there for `types`.
- R4. The single test setup file (`apis/api-languages/test/prismaMock.ts`) compiles and runs under Vitest — `jest.*` calls become `vi.*`, `jest-mock-extended` becomes `vitest-mock-extended`, and the synchronous `jest.requireActual` mock factory becomes the async `vi.importActual` form used in `api-analytics`.
- R5. All 9 spec files under `apis/api-languages/src/**/*.spec.ts` compile and run under Vitest — every `jest` global and `jest`-namespaced type is rewritten to its Vitest equivalent.
- R6. `nx test api-languages --skip-nx-cache` passes with the same suites green as before the migration (no test deletions, no skipped suites added).
- R7. The branch carries no remaining references to `jest`, `jest-mock-extended`, `@jest/globals`, `ts-jest`, or `jest.preset.js` from inside `apis/api-languages/**`.

---

## Scope Boundaries

- Out of scope: migrating other apps (`api-journeys`, `api-journeys-modern`) — they keep their existing Jest setup.
- Out of scope: changing test behavior, adding new tests, or fixing pre-existing flakes.
- Out of scope: removing root-level Jest dependencies or deleting `jest.preset.js` (other workspaces still depend on them).
- Out of scope: GraphQL/Pothos schema, runtime, worker, script, or CLI code changes — only test configuration and test files are touched.
- Out of scope: changes to `apis/api-languages/test/client.ts` — it is a runtime helper for the GraphQL HTTP executor, not a Jest construct, so it ports as-is.

---

## Context & Research

### Relevant Code and Patterns

- **Reference migration #1 (the canonical template):** commit `bc0da938d` ("chore: update dependencies and migrate tests from Jest to Vitest") on `apis/api-analytics`. Source of truth for `vitest.config.mts`, `project.json`, `tsconfig.spec.json`, the prisma mock setup, and a representative spec file.
- **Reference migration #2 (most recent at scale):** commit `6c28772e2` (PR #9179, "chore(api-media): migrate test suite from Jest to Vitest"). Confirms the recipe is repeatable across many spec files and surfaces edge cases (`jest.requireActual`, `jest.requireMock`) — neither of which appears in api-languages spec files.
- **Reference migration #3 (immediate precedent):** commit `8bafad172` ("chore(api-users): migrate test suite from Jest to Vitest") on `apis/api-users`. Same recipe applied at similar scale (9 spec files); confirms the structural-identical `prismaMock.ts` pattern works in this repo with only the prisma client package path changing.
- `apis/api-analytics/vitest.config.mts` — config to mirror for api-languages, swapping `setupFiles` to `['./test/prismaMock.ts']` and `reportsDirectory` to `'../../coverage/apis/api-languages'`.
- `apis/api-analytics/test/prismaMock.ts` — pattern for converting `jest-mock-extended` setup files to `vitest-mock-extended` with `vi.importActual` (async factory). The api-languages `prismaMock.ts` is structurally identical except for the package path (`@core/prisma/languages/client` vs `@core/prisma/analytics/client`).
- `apis/api-analytics/tsconfig.spec.json` and `apis/api-analytics/tsconfig.app.json` — the post-migration tsconfig shape to mirror. Note: api-languages's `tsconfig.spec.json` does NOT currently include `**/*.spec.tsx`, and its `tsconfig.app.json` `include` is `["**/*.ts"]` (no `.tsx`). Preserve those scopes — do not add `.tsx` patterns.
- `apis/api-analytics/src/scripts/sites-add-goals.spec.ts` — representative migrated spec showing the `vi.spyOn(process, 'exit').mockImplementation(...)` shape that maps directly onto the api-languages `cli.spec.ts` and `data-import.spec.ts` cases.

### Spec Files To Migrate

`apis/api-languages/src/**/*.spec.ts` — 9 files, ~106 `jest.*` references. Patterns observed (counts via `grep -rE "jest\.[a-zA-Z]+" apis/api-languages/src --include="*.spec.ts"`):

- `jest.fn` (~71) — direct one-to-one replacement with `vi.fn`. Concentrated in `workers/dataExport/service/service.spec.ts` (41) and `scripts/data-import.spec.ts` (26); also in `workers/cli.spec.ts` (4).
- `jest.mock` (14) — direct one-to-one replacement with `vi.mock`. Spread across `data-import.spec.ts` (6), `service.spec.ts` (5), `cli.spec.ts` (3).
- `jest.clearAllMocks` (3) — direct one-to-one replacement with `vi.clearAllMocks`. One occurrence each in `data-import.spec.ts`, `service.spec.ts`, `cli.spec.ts`.
- `jest.spyOn` (4) — direct one-to-one replacement with `vi.spyOn`. Three in `data-import.spec.ts` (`console.log`, `console.error`, `console.warn` spies at top of file) and one in `cli.spec.ts` (`process.exit` spy).
- `jest.Mock` (3) — type-cast usage (`as jest.Mock`). Replace with `Mock` named import from `vitest`. Two in `data-import.spec.ts`, one in `service.spec.ts`.
- **No `jest.MockedFunction`, `jest.requireActual`, `jest.requireMock`, `jest.mocked`, `jest.setTimeout`, `jest.SpyInstance`, `jest.MockedClass`, or `jest.Mocked`** in any spec file. The async `vi.importActual` / `vi.importMock` rewrites that complicated api-users do not arise here.

### Migration Targets — Confirmed Surface

- **~106 `jest.*` occurrences** across **9 spec files**; **1 setup file** (`test/prismaMock.ts`).
- **No spec file currently uses `vi.*`** or imports from `vitest`, so no merge conflict with prior partial migration.
- **`jest-mock-extended` appears only in `test/prismaMock.ts`** — not in any spec file. This narrows U2 to a single file edit.
- **`test/client.ts`** uses no Jest constructs (it just builds an HTTP executor for `yoga.fetch`), so it ports as-is.
- **`tsconfig.app.json` `types`** does not list `jest` today, so the `types` array is not edited; only `jest.config.ts` is dropped from `exclude`.

### Institutional Learnings

- The monorepo has a project rule (`.claude/rules/running-jest-tests.md`) that Jest tests are run via `npx jest --config <config> --no-coverage <path>` rather than `nx test` because `--testPathPattern` is silently ignored. Once api-languages is on Vitest, prefer `npx vitest run --config apis/api-languages/vitest.config.mts <path>` for single-file iteration during the migration to keep the feedback loop tight. Use `nx test api-languages` for the final green-suite verification.
- Recent precedents (api-media PR #9179, api-users commit `8bafad172`) confirmed the recipe is mechanical for the bulk of replacements. api-languages has a strictly simpler surface — no async-factory rewrites are required.

### External References

None required — the recipe is fully captured in the in-tree reference commits.

---

## Key Technical Decisions

- **Mirror the api-analytics + api-media + api-users recipes rather than re-deriving.** Three prior commits in this repo are the source of truth for config shape, dependency choices, and import style. Any deviation must be justified by an api-languages-specific need (in practice, only the prisma package path and the `setupFiles` list change).
- **Use globals (`globals: true` in `vitest.config.mts`) and `vitest/globals` types.** Matches all three prior migrations; means specs can keep `describe`/`it`/`expect`/`beforeEach`/`afterEach` as ambient globals and only need to import `vi` (and `Mock` as a type) from `vitest`.
- **Convert the single setup-file mock factory to async (`await vi.importActual`).** Mirrors `apis/api-analytics/test/prismaMock.ts` exactly. Spec-file `jest.mock(path, () => ({...}))` factories stay synchronous because none of them call `jest.requireActual`. Keeps the diff minimal.
- **Codemod-by-pattern, not blind sed.** The shape `jest.X` → `vi.X` is mostly mechanical, but `jest.Mock` (used as a type cast) → `Mock` requires adding a `import { Mock } from 'vitest'` line. Use `grep` to enumerate, then edit each file with `Edit`/`replace_all` so the `import { vi, type Mock } from 'vitest'` line is added exactly once and only where it's needed.
- **Do not touch root `jest.preset.js` or root `package.json` Jest deps.** Other workspaces (`api-journeys`, `api-journeys-modern`, plus many libs) still rely on them; the api-analytics, api-media, and api-users migrations also left them in place.
- **Preserve `tsconfig.app.json` `exclude` entries that are not Jest-specific** — only drop `jest.config.ts`. Entries like `**/*.spec.ts` and `test/**/*.ts` are unrelated to the runner choice and must remain.
- **Preserve `tsconfig.spec.json` `include` shape** — keep `**/*.spec.ts`, `**/*.d.ts`, `test/**/*.ts`. Add `vitest.config.mts`, drop `jest.config.ts`. Do **not** add `**/*.spec.tsx` — api-languages does not have `.tsx` specs today and the api-analytics precedent does not include it either; matching api-users here would expand the include surface unnecessarily.

---

## Open Questions

### Resolved During Planning

- _Should we delete root Jest dependencies?_ — No. Other workspaces still use Jest; out of scope.
- _Do we need a CHANGELOG or release note?_ — No. Pure tooling migration with no user-visible behavior change.
- _Is there a partial migration in flight?_ — No. Confirmed no `vitest` imports or `vi.*` references under `apis/api-languages/**` yet.
- _Does any spec use `jest-mock-extended` directly?_ — No. Confirmed via `grep -rn "jest-mock-extended" apis/api-languages/` — only `test/prismaMock.ts` imports it.
- _Does any spec use `jest.requireActual`, `jest.requireMock`, `jest.MockedFunction`, or `jest.setTimeout`?_ — No. Pattern-count audit (above) returned only `fn`, `mock`, `clearAllMocks`, `spyOn`, and `Mock` (as a type cast).
- _Does `tsconfig.spec.json` need `**/*.spec.tsx` added?_ — No. api-languages has no `.tsx` specs and the api-analytics precedent does not include it.

### Deferred to Implementation

- Whether the `jest.spyOn(console, ...)` calls in `data-import.spec.ts` (currently at module-top, executed at file load) need to be relocated inside `beforeEach` once converted to `vi.spyOn`. Vitest's hoisting and module evaluation order match Jest's for this pattern, so the expectation is no change is needed — verify by running the file in isolation in U3, and only relocate if a specific failure appears.
- Whether `nx test api-languages --skip-nx-cache` surfaces any per-test ordering or hoisting differences vs. Jest. Triage in U4 only if a specific failure exposes the issue.

---

## Implementation Units

- U1. **Bootstrap api-languages Vitest configuration**

**Goal:** Add the Vitest config and switch the Nx target so `nx test api-languages` invokes Vitest.

**Requirements:** R1, R2, R3

**Dependencies:** None.

**Files:**

- Create: `apis/api-languages/vitest.config.mts`
- Modify: `apis/api-languages/project.json`
- Modify: `apis/api-languages/tsconfig.spec.json`
- Modify: `apis/api-languages/tsconfig.app.json`
- Delete: `apis/api-languages/jest.config.ts`

**Approach:**

- Copy `apis/api-analytics/vitest.config.mts` verbatim, then change `coverage.reportsDirectory` to `'../../coverage/apis/api-languages'`. Keep `setupFiles: ['./test/prismaMock.ts']`, `globals: true`, `environment: 'node'`, `reporters: ['default']`, `passWithNoTests: true`, and the `vite-tsconfig-paths` plugin shape unchanged. Do **not** copy api-media's `resolve.dedupe: ['graphql']` or `pool: 'forks'` — neither was needed for api-analytics or api-users.
- In `project.json`, change the `test` target's `executor` from `@nx/jest:jest` to `@nx/vitest:test` and replace `options.jestConfig` with `options.configFile: 'apis/api-languages/vitest.config.mts'`. Leave `outputs` as `["{workspaceRoot}/coverage/apis/api-languages"]`.
- In `tsconfig.spec.json`, replace `types: ['jest', '@jest/globals', 'node']` with `types: ['vitest/globals', 'node']`. Update `include` to `['**/*.spec.ts', '**/*.d.ts', 'vitest.config.mts', 'test/**/*.ts']` (drop `jest.config.ts`, add `vitest.config.mts`). Do not introduce `**/*.spec.tsx` — no `.tsx` specs exist and the api-analytics precedent does not include it.
- In `tsconfig.app.json`, drop `'jest.config.ts'` from `exclude`. Leave `**/*.spec.ts` and `test/**/*.ts` intact. The `types` array does not currently include `'jest'`, so no edit is needed there.
- Delete `apis/api-languages/jest.config.ts`.

**Patterns to follow:**

- `apis/api-analytics/vitest.config.mts`
- `apis/api-analytics/project.json` (the migrated `test` target)
- `apis/api-analytics/tsconfig.spec.json` and `apis/api-analytics/tsconfig.app.json`

**Test scenarios:**

- Test expectation: none — pure config change. Verification at the end of U4 covers correctness.

**Verification:**

- `apis/api-languages/jest.config.ts` no longer exists.
- `apis/api-languages/vitest.config.mts` exists. Type-check (`pnpm exec tsc -p apis/api-languages/tsconfig.spec.json --noEmit`) is deferred until U2/U3 are done so unmigrated files don't blow up the type-check.

---

- U2. **Migrate the prisma test setup file**

**Goal:** Convert `apis/api-languages/test/prismaMock.ts` to Vitest so `setupFiles` runs cleanly before any spec.

**Requirements:** R4

**Dependencies:** U1.

**Files:**

- Modify: `apis/api-languages/test/prismaMock.ts`

**Approach:**

- Replace `import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended'` with the same names imported from `vitest-mock-extended`.
- Add `import { beforeEach, vi } from 'vitest'` as the first import.
- Convert the synchronous `jest.mock('@core/prisma/languages/client', () => ({ __esModule: true, ...jest.requireActual('@core/prisma/languages/client'), prisma: mockDeep<PrismaClient>() }))` to the async form: `vi.mock('@core/prisma/languages/client', async () => ({ __esModule: true, ...(await vi.importActual('@core/prisma/languages/client')), prisma: mockDeep<PrismaClient>() }))`. The structure should match `apis/api-analytics/test/prismaMock.ts` exactly, with the package path swapped from `@core/prisma/analytics/client` to `@core/prisma/languages/client`.
- Keep `beforeEach(() => { mockReset(prismaMock) })` and the `prismaMock` export unchanged.

**Patterns to follow:**

- `apis/api-analytics/test/prismaMock.ts` for the async `vi.importActual` factory shape.

**Test scenarios:**

- Test expectation: none — this file is a setup helper. Its correctness is verified via the spec suite green-state in U4.

**Verification:**

- `grep -rE "\\bjest\\b|jest-mock-extended" apis/api-languages/test/` returns no hits.

---

- U3. **Migrate all 9 spec files from Jest to Vitest**

**Goal:** Rewrite every `jest.*` reference in `apis/api-languages/src/**/*.spec.ts` to its Vitest equivalent and add the necessary `vitest` imports.

**Requirements:** R5, R7

**Dependencies:** U1, U2.

**Files:**

- Modify: `apis/api-languages/src/scripts/data-import.spec.ts`
- Modify: `apis/api-languages/src/workers/cli.spec.ts`
- Modify: `apis/api-languages/src/workers/dataExport/service/service.spec.ts`
- Modify: `apis/api-languages/src/lib/slugify/slugify.spec.ts`
- Modify: `apis/api-languages/src/lib/parseFullTextSearch/parseFullTextSearch.spec.ts`
- Modify: `apis/api-languages/src/schema/user/user.spec.ts`
- Modify: `apis/api-languages/src/schema/country/country.spec.ts`
- Modify: `apis/api-languages/src/schema/country/countries.spec.ts`
- Modify: `apis/api-languages/src/schema/language/language.spec.ts`

**Approach:**

- For each file, in this order:
  1. Add `import { vi } from 'vitest'` (only the names actually used — `vi` always, plus `type Mock` in the three files that cast with `as jest.Mock`: `data-import.spec.ts` and `service.spec.ts`). Place it as the first import.
  2. Replace tokens using `replace_all` per file, scoped to identifiers (avoid replacing inside string literals or test names):
     - `jest.fn` → `vi.fn`
     - `jest.mock` → `vi.mock`
     - `jest.spyOn` → `vi.spyOn`
     - `jest.clearAllMocks` → `vi.clearAllMocks`
     - `jest.Mock` (when used as a type cast, e.g. `as jest.Mock`) → `Mock`
  3. Files with no `jest.*` references (specs that only consume Pothos schema fixtures via `prismaMock`, e.g. potentially `slugify.spec.ts`, `parseFullTextSearch.spec.ts`, the `schema/**` specs) need no token rewrites — only confirm via `grep "\\bjest\\b" <path>` that nothing remains. Skip the `vitest` import in those files unless globals like `describe`/`it` need to be imported, which they should not because `globals: true` is on.
- After per-file edits, run `npx vitest run --config apis/api-languages/vitest.config.mts <single-spec-path>` to confirm each file at least loads without resolution errors before moving on. Then `grep -rE "\\bjest\\b" apis/api-languages/src --include="*.spec.ts"` to confirm zero residual hits.

**Patterns to follow:**

- `apis/api-analytics/src/scripts/sites-add-goals.spec.ts` (representative migrated spec showing the `vi.spyOn(process, 'exit').mockImplementation(...)` shape and the `as Mock` cast).
- `apis/api-users/src/schema/user/verifyUser.spec.ts` (immediate precedent for a spec that consumes `prismaMock` and adds only `import { vi } from 'vitest'`).

**Test scenarios:**

- Test expectation: none — this unit moves existing tests to a new runner without behavior changes. The full-suite green-state in U4 is the verification.
- During the migration, run each migrated spec file individually (`npx vitest run --config apis/api-languages/vitest.config.mts <path>`) to catch import or factory-shape regressions early. Spec authors do not write new tests here.

**Verification:**

- `grep -rE "\\bjest\\b" apis/api-languages/src --include="*.spec.ts"` returns zero matches.
- `grep -rE "jest-mock-extended|@jest/globals" apis/api-languages/src --include="*.spec.ts"` returns zero matches.

---

- U4. **Run the full api-languages test suite under Vitest and resolve fallout**

**Goal:** Get `nx test api-languages` green under the new toolchain so the migration is complete.

**Requirements:** R6, R7

**Dependencies:** U1, U2, U3.

**Files:**

- Modify: any spec or setup file that surfaces a runtime regression once the suite runs end-to-end.

**Approach:**

- Run `nx test api-languages --skip-nx-cache` (or `npx vitest run --config apis/api-languages/vitest.config.mts` if Nx caching gets in the way during iteration).
- Triage failures into three buckets and fix in order:
  1. **Module-resolution failures** — usually a missing `vitest-mock-extended` import or a stray `jest.*` reference that didn't get rewritten.
  2. **Type-cast failures at runtime** — usually a `jest.Mock` that didn't get its accompanying `import { type Mock } from 'vitest'` added to the file.
  3. **Hoisting-related failures** — Vitest hoists `vi.mock` calls similarly to Jest, but a factory that captures a top-level `const` may need an inline `vi.hoisted(() => ...)` wrapper. Apply only when a specific test exposes the issue. Highest-risk surface is `data-import.spec.ts`, which has 6 `vi.mock` calls; verify it loads in isolation first.
  4. **Top-of-file `vi.spyOn(console, ...)` evaluation order** — `data-import.spec.ts` installs three console spies at module load. If Vitest evaluates them after the first `it()` block runs (unlikely but possible under certain pool configurations), relocate them inside a `beforeAll` or `beforeEach`.
- Confirm `pnpm exec tsc -p apis/api-languages/tsconfig.spec.json --noEmit` is clean.
- Confirm `nx lint api-languages` does not regress.

**Patterns to follow:**

- The api-analytics, api-media, and api-users migrations deliberately changed only what was required to make the suite green; mirror that restraint here. Avoid restructuring tests that already pass.

**Test scenarios:**

- The pre-existing api-languages test suite, unchanged in coverage, must pass under Vitest:
  - All 9 spec files load without module-resolution errors.
  - All previously-passing assertions remain green.
  - `prismaMock.ts`'s async `vi.importActual` factory installs the deep-mocked Prisma client before the first spec runs.
  - `data-import.spec.ts`'s three `vi.spyOn(console, ...)` spies suppress log output as before.
  - `cli.spec.ts`'s `vi.spyOn(process, 'exit').mockImplementation(...)` continues to intercept process.exit without terminating the test runner.

**Verification:**

- `nx test api-languages --skip-nx-cache` exits zero with the same number of passing tests as before the migration.
- Coverage report writes to `coverage/apis/api-languages/`.
- No `jest`/`jest-mock-extended`/`@jest/globals`/`ts-jest` strings remain inside `apis/api-languages/**`.

---

## System-Wide Impact

- **Interaction graph:** `nx test api-languages` is the only direct consumer; CI calls it via existing pipelines that use `nx affected --target=test`. The Nx executor change is the only contact point.
- **Error propagation:** Vitest reports failures with a different shape than Jest, but CI parses the exit code, not the format. No downstream code reads test output as data.
- **State lifecycle risks:** None — no migrations, no persistent state changes.
- **API surface parity:** None — internal tooling change only. GraphQL schema, resolvers, scripts, workers, and Prisma usage are untouched.
- **Integration coverage:** All existing api-languages tests must keep running unchanged; if any rely on Jest-specific timer or fake-module behavior, surface it during U4 triage rather than papering over.
- **Unchanged invariants:** Runtime code in `apis/api-languages/src/**` (non-spec) is not modified. The GraphQL schema, data-import script, dataExport worker, CLI entrypoint, and prisma usage are untouched. Other workspaces' Jest setups remain as-is. The `apis/api-languages/test/client.ts` GraphQL HTTP executor helper is unchanged.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| `data-import.spec.ts`'s top-of-file `vi.spyOn(console, ...)` calls evaluate after the first `it()` body runs and let real console output through. | Verify the file in isolation with `npx vitest run` after migration. If output leaks, relocate the spies into a `beforeAll`/`beforeEach` block — same shape that api-analytics and api-users use for module-load-time spies. |
| `cli.spec.ts`'s `vi.spyOn(process, 'exit').mockImplementation(() => undefined as never)` evaluation order under Vitest causes process to actually exit during tests. | This pattern works in api-analytics's `sites-add-goals.spec.ts`. Run the file in isolation first to confirm; if Vitest evaluates the spy after the worker imports, switch to the `vi.spyOn(...).mockImplementation(((code?: number) => { throw new Error(...) }) as never)` form used in api-analytics. |
| Spec files that rely on Jest's auto-mocking or implicit module resolution behave differently under Vitest. | Triage in U4 individually. Vitest's hoisting model is documented; use `vi.hoisted` only where a specific failure forces it. |
| The `@nx/vitest:test` executor surfaces a different `outputs` or coverage-path expectation than `@nx/jest:jest`. | Mirror api-analytics's `project.json` exactly; CI cache hashing keys off the `test` target spec, so any mismatch fails fast in U4. |
| Hidden duplicate test setup (e.g., a global `jest.setup` referenced via `jest.preset.js`). | The current `jest.config.ts` references only `setupFilesAfterEnv: ['<rootDir>/test/prismaMock.ts']` plus the root preset's transform pipeline. The Vitest config replaces both via `setupFiles` and the built-in TS support; no other setup hooks to preserve. |
| A future api-languages spec is added with `jest.*` syntax during the open-PR window. | Run a final `grep -rE "\\bjest\\b" apis/api-languages/src --include="*.spec.ts"` immediately before merge to catch any drift introduced by other branches. |

---

## Documentation / Operational Notes

- Updating `.claude/rules/running-jest-tests.md` is **not** required — that rule still governs the remaining Jest-running apps (`api-journeys`, `api-journeys-modern`, plus libs). A separate Vitest rule may follow once more workspaces are migrated; it is out of scope here.
- No rollout, monitoring, or ops impact.

---

## Sources & References

- Reference commit #1: `bc0da938d` ("chore: update dependencies and migrate tests from Jest to Vitest") — full diff for `api-analytics`.
- Reference commit #2: `6c28772e2` (PR #9179, "chore(api-media): migrate test suite from Jest to Vitest") — most recent precedent at scale.
- Reference commit #3: `8bafad172` ("chore(api-users): migrate test suite from Jest to Vitest") — immediate precedent at similar scale.
- Prior plans: `docs/plans/2026-05-07-001-chore-api-media-vitest-migration-plan.md`, `docs/plans/2026-05-08-001-chore-api-users-vitest-migration-plan.md` — same recipe applied to api-media and api-users.
- Vitest migration docs: https://vitest.dev/guide/migration.html (only consulted for `vi.importActual` async semantics; the in-tree reference is otherwise authoritative).
