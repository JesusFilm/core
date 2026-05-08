---
title: 'chore: Migrate apps/arclight from Jest to Vitest'
type: chore
status: active
date: 2026-05-08
---

# chore: Migrate apps/arclight from Jest to Vitest

## Summary

Switch the Nx test runner for `apps/arclight` from Jest to Vitest so the app aligns with the rest of the monorepo's ongoing migration (`apps/journeys` shipped 2026-05-06 in #9132; `apis/api-media` shipped 2026-05-07 in #9179). Because `apps/arclight/src/**` currently contains zero spec files, this is a pure configuration swap — no test bodies to rewrite — but the config must already mirror the `apps/journeys` Next.js + React Vitest shape so future tests added under arclight land on the new toolchain.

---

## Problem Frame

`apps/arclight` is the only remaining Next.js app in the monorepo still wired to `@nx/jest:jest` after `apps/journeys` migrated last week. Even though the app has no spec files today, leaving it on Jest forces the root toolchain to keep the Jest preset hot path for one workspace and means the first developer who writes a test against arclight will be solving a migration on a deadline. Closing it out now is cheap and keeps the apps tier consistent with the API tier.

---

## Requirements

- R1. `apps/arclight/jest.config.ts` is deleted; a new `apps/arclight/vitest.config.mts` exists matching the `apps/journeys` shape (jsdom env, `@vitejs/plugin-react`, `vite-tsconfig-paths`, cobertura coverage to `coverage/apps/arclight`).
- R2. `apps/arclight/project.json` `test` target uses `@nx/vitest:test` with `configFile: apps/arclight/vitest.config.mts` and the same `outputs` shape used by `apps/journeys`.
- R3. `apps/arclight/tsconfig.json` `types` array drops `jest` in favor of `["node", "vitest/globals"]`; the `exclude` array drops `**/*.spec.ts` (Vitest doesn't need TypeScript to ignore specs in the app tsconfig).
- R4. `apps/arclight/tsconfig.spec.json` uses `types: ["vitest/globals", "node"]` and references `setupTests.ts` in `include`.
- R5. `apps/arclight/eslint.config.mjs` ignores `vitest.config.mts` (and removes the now-stale `jest.config.ts` ignore if present elsewhere).
- R6. A minimal `apps/arclight/setupTests.ts` exists with the same imports `apps/journeys` uses — `@testing-library/jest-dom/vitest`, the `stream/web` polyfill, the `next-router-mock` for `next/router`, and `configure({ asyncUtilTimeout: 2500 })` from `@testing-library/react` — so the very next spec file dropped in works without additional setup.
- R7. `nx test arclight --skip-nx-cache` exits 0 (Vitest with `passWithNoTests: true`) and reports no spec files run.
- R8. The branch carries no remaining references to `jest`, `@jest/globals`, `ts-jest`, `babel-jest`, or `jest.preset.js` from inside `apps/arclight/**`.

---

## Scope Boundaries

- Out of scope: migrating any other app (`apps/journeys-admin`, `apps/cms`, `apps/watch`, `apps/watch-modern`, `apps/videos-admin`, `apps/short-links`, `apps/resources`, `apps/docs`, `apps/player`, `apps/video-importer`) — all keep their existing Jest setup.
- Out of scope: writing new spec files for arclight to "prove" the migration. R7 is the sufficient quality gate; if the team wants tests, they belong in a follow-up.
- Out of scope: removing root-level Jest dependencies (`jest`, `babel-jest`, `@nx/jest`, `jest-environment-jsdom`, `jest.preset.js`) — other apps still depend on them.
- Out of scope: any change to the runtime Next.js app (`src/**` outside test config), Vercel deployment, or the e2e suite under `apps/arclight-e2e`.
- Out of scope: babel/SWC migration. The Jest config used `babel-jest` with `@nx/next/babel`; the Vitest config replaces this with `@vitejs/plugin-react`, matching `apps/journeys`. No explicit babel preset is needed for tests post-migration.

### Deferred to Follow-Up Work

- Removing root Jest dependencies once every app and api has migrated: tracked separately, not in this plan.
- Optional: a CI rule that fails if a new `apps/arclight/jest.config.ts` reappears — out of scope here.

---

## Context & Research

### Relevant Code and Patterns

- **Reference migration #1 (the template):** PR #9132 / commit `55dd5e540` — `apps/journeys` Jest → Vitest. Same Next.js stack, same `@vitejs/plugin-react` + `vite-tsconfig-paths` shape, same setupTests pattern. Use this as the canonical Next.js app recipe.
- **Reference migration #2 (sibling):** `apps/journeys/vitest.config.mts`, `apps/journeys/setupTests.ts`, `apps/journeys/tsconfig.json`, `apps/journeys/tsconfig.spec.json`, `apps/journeys/eslint.config.mjs` — read these in full and mirror the structure exactly, swapping `journeys` → `arclight` in path strings and removing the journey-specific `styled-jsx` alias (arclight has no styled-jsx usage in tests; preserve only the polyfills and `next/router` mock that are universally useful).
- **Reference migration #3 (api-tier recipe):** `docs/plans/2026-05-07-001-chore-api-media-vitest-migration-plan.md` and the resulting #9179. Demonstrates how to file a clean migration plan in this repo and the residual-findings format the team has standardized on.
- **Current arclight test setup to replace:**
  - `apps/arclight/jest.config.ts` — minimal Jest config using `@nx/react/plugins/jest` + `babel-jest` with `@nx/next/babel`, `coverageDirectory: '../../coverage/apps/arclight'`, no setup files.
  - `apps/arclight/project.json` `test` target uses `@nx/jest:jest` with `jestConfig: apps/arclight/jest.config.ts`.
  - `apps/arclight/tsconfig.json` declares `types: ["jest", "node"]` and excludes `**/*.spec.ts`.
  - `apps/arclight/tsconfig.spec.json` declares `types: ["jest", "@jest/globals", "node"]` and `jsx: "react"` (Vitest-side it inherits `jsx: "preserve"` from `tsconfig.json` and types drop to `["vitest/globals", "node"]` — matches `apps/journeys`).
- **Spec surface to migrate:** `find apps/arclight -type f \( -name "*.spec.*" -o -name "*.test.*" \) -not -path "*/node_modules/*" -not -path "*/.next/*"` returns zero matches. Confirmed twice during research. The migration is config-only.
- **Root vitest deps already installed:** `@nx/vitest@22.7.1`, `@vitejs/plugin-react@^4.7.0`, `vitest@^2.1.9`, `@vitest/coverage-v8@^2.1.9`. No new dependencies need to be added to `package.json` — the same versions `apps/journeys` uses are already present in `pnpm-lock.yaml`.

### Institutional Learnings

- `.claude/rules/running-jest-tests.md` mandates `npx jest --config <path> --no-coverage <file>` for single-file iteration (the `nx test` executor's `--testPathPattern` is silently dropped). Post-migration the analogue is `npx vitest run --config apps/arclight/vitest.config.mts <path>`. This rule does not block the migration but is worth knowing when verifying R7.
- `apis/api-media` migration plan documented that `jest.requireActual` becomes `await vi.importActual` (async) and that `jest.MockedFunction` becomes a value imported from `vitest`. Not relevant for arclight today (no specs), but worth preserving as a forward-looking note for when tests are added.
- The `apps/journeys` `setupTests.ts` includes a `stream/web` polyfill for `ReadableStream`/`TransformStream`/`WritableStream` — required because jsdom doesn't ship them and several Next.js code paths rely on them. Arclight imports the same Next.js + Apollo stack, so the same polyfill is the safe default.
- Coverage in vitest configs across the repo is currently `enabled: true` with `provider: 'v8'` and `reporter: ['cobertura']` for CI compatibility. Mirror this default rather than turning coverage off for arclight.

### External References

None required — every pattern needed is in-repo (`apps/journeys/*` and `apis/api-media/vitest.config.mts`).

---

## Key Technical Decisions

- **Mirror `apps/journeys` exactly, don't re-derive.** PR #9132 settled the Next.js + React Vitest shape for this monorepo a week ago. Any deviation must be justified by an arclight-specific need; today there is none.
- **Use `globals: true` and `vitest/globals` types.** Matches both reference migrations. Future spec authors keep `describe`/`it`/`expect`/`beforeEach` as ambient globals; only `vi` (and concrete types) need to be imported.
- **Drop the `styled-jsx` alias from `setupTests.ts`-adjacent `vitest.config.mts` `alias` block.** The journeys migration kept it because journeys uses styled-jsx. Arclight does not import `styled-jsx` anywhere in `src/**` (verified during research). Carrying the alias forward would be cargo-culting — leave it out, and it can be added in 30 seconds if a future arclight test ever needs it.
- **Keep `passWithNoTests: true`.** Required because the app currently has zero specs; without it, `nx test arclight` exits non-zero in CI and breaks the affected-tests pipeline. Already standard in the repo's vitest configs.
- **Add `setupTests.ts` even though there are no tests yet.** R6 is forward-looking: the very next test will need `@testing-library/jest-dom/vitest` matchers and the `next/router` mock. Materializing the file now eliminates a "second migration" later and keeps the diff close to journeys.
- **`retry: process.env.CI === 'true' ? 3 : 0` is journeys-specific (mitigates Conductor flake) — DO NOT carry it forward to arclight.** Arclight has no flaky integration tests today; turning on retries by default would mask real failures the moment a test is added. Leave the field out; it can be added later if a real flake appears.
- **Do not touch root `jest.preset.js`, root `package.json` Jest deps, or `apps/__mocks__/`.** Other apps still rely on them. The journeys migration also left them in place. The `apps/__mocks__/swiper/css.ts` change in #9132 was journeys-specific, not a global behavior change.
- **`tsconfig.json` `exclude` of `**/\*.spec.ts` should be removed\*\*, matching journeys. Vitest uses its own resolver via the spec tsconfig, and leaving the broad exclude in place causes editor tooling to flag spec files as not-in-program.

---

## Open Questions

### Resolved During Planning

- _Are there any spec files we'd silently break?_ — No. Verified twice with `find`. Migration is config-only.
- _Do we need to add new vitest dependencies to `package.json`?_ — No. `pnpm-lock.yaml` already pins the versions journeys uses; arclight inherits via the workspace.
- _Should we keep `babel-jest` / `@nx/next/babel` for SSR test transforms?_ — No. `@vitejs/plugin-react` plus the Next.js `tsconfig` paths are sufficient; this is exactly what journeys runs on.
- _Should `setupTests.ts` include the `styled-jsx` alias from journeys?_ — No (decision above).

### Deferred to Implementation

- The exact `outputs` array syntax in `project.json` after the swap. Journeys uses `["{workspaceRoot}/coverage/apps/journeys"]`; mirror with `["{workspaceRoot}/coverage/apps/arclight"]` unless the diff in U2 reveals an alternate convention preferred by `@nx/vitest:test` 22.7.1.
- Whether to delete or keep `apps/arclight/tsconfig.spec.json`'s `jsx: "react"` setting. Journeys removed it; if arclight's `tsconfig.json` already declares `jsx: "preserve"`, the spec config can rely on inheritance. Confirm by reading both files in U1.

---

## Implementation Units

- U1. **Add Vitest config and setup file**

**Goal:** Materialize `apps/arclight/vitest.config.mts` and `apps/arclight/setupTests.ts` matching the journeys shape, scoped to arclight's coverage path. This is the foundation other units depend on.

**Requirements:** R1, R6

**Dependencies:** None.

**Files:**

- Create: `apps/arclight/vitest.config.mts`
- Create: `apps/arclight/setupTests.ts`

**Approach:**

- Read `apps/journeys/vitest.config.mts` and `apps/journeys/setupTests.ts` first; copy verbatim then apply the diffs in this unit.
- `vitest.config.mts`: keep `react()` plugin, keep `tsconfigPaths({ root: resolve(__dirname, '../..') })`, keep `environment: 'jsdom'` with `url: 'http://localhost'`, keep `globals: true`, keep `passWithNoTests: true`, keep cobertura coverage to `'../../coverage/apps/arclight'`. **Drop** the `alias` block (no styled-jsx in arclight). **Drop** the `retry: process.env.CI === 'true' ? 3 : 0` setting (decision above).
- `setupTests.ts`: include `@testing-library/jest-dom/vitest`, the `stream/web` polyfill block, `configure({ asyncUtilTimeout: 2500 })`, and the `vi.mock('next/router', ...)` block exactly as in journeys.

**Patterns to follow:**

- `apps/journeys/vitest.config.mts`
- `apps/journeys/setupTests.ts`

**Test scenarios:**

- Test expectation: none — pure config and setup file creation. Verification is via U4's `nx test arclight` end-to-end run.

**Verification:**

- File `apps/arclight/vitest.config.mts` exists, parses as a valid TS module (no syntax errors), and references `coverage/apps/arclight` (not `coverage/apps/journeys`).
- File `apps/arclight/setupTests.ts` exists and imports `@testing-library/jest-dom/vitest`.

---

- U2. **Switch Nx test target and remove jest config**

**Goal:** Repoint the `test` Nx target at the new Vitest config and delete the now-orphaned Jest config.

**Requirements:** R1, R2

**Dependencies:** U1.

**Files:**

- Modify: `apps/arclight/project.json`
- Delete: `apps/arclight/jest.config.ts`

**Approach:**

- In `project.json` `targets.test`, change `executor` from `@nx/jest:jest` to `@nx/vitest:test`, and replace `options.jestConfig: "apps/arclight/jest.config.ts"` with `options.configFile: "apps/arclight/vitest.config.mts"`. Keep the existing `outputs: ["{workspaceRoot}/coverage/{projectRoot}"]` shape (note: journeys uses the literal `coverage/apps/journeys`; either form works — use `{projectRoot}` since the existing arclight `project.json` already does, to minimize diff).
- Delete `apps/arclight/jest.config.ts`.

**Patterns to follow:**

- The journeys `project.json` `test` target stanza in commit `55dd5e540`.

**Test scenarios:**

- Test expectation: none — config-only change. Behavioral verification is U4.

**Verification:**

- `apps/arclight/jest.config.ts` does not exist.
- `apps/arclight/project.json` contains `"executor": "@nx/vitest:test"` and `"configFile": "apps/arclight/vitest.config.mts"` and contains zero `jest` references.

---

- U3. **Update TypeScript and ESLint configs**

**Goal:** Align type roots and lint ignores so the editor and lint pipeline don't fight the new test runner.

**Requirements:** R3, R4, R5, R8

**Dependencies:** U1 (so `setupTests.ts` exists for `tsconfig.spec.json` to reference).

**Files:**

- Modify: `apps/arclight/tsconfig.json`
- Modify: `apps/arclight/tsconfig.spec.json`
- Modify: `apps/arclight/eslint.config.mjs`

**Approach:**

- `tsconfig.json`: change `types: ["jest", "node"]` to `types: ["node", "vitest/globals"]`; remove `**/*.spec.ts` from `exclude`. Leave the rest (next plugin, jsx preserve) untouched.
- `tsconfig.spec.json`: replace `types: ["jest", "@jest/globals", "node"]` with `types: ["vitest/globals", "node"]`; remove `module: "commonjs"` if present (journeys did); remove `jsx: "react"` (inherits `jsx: "preserve"` from `tsconfig.json`); add `"setupTests.ts"` to `include`; remove `jest.config.ts` from `include`.
- `eslint.config.mjs`: change the existing `ignores: ['apps/arclight/next.config.js']` to `ignores: ['apps/arclight/next.config.js', 'apps/arclight/vitest.config.mts']`. (No prior `jest.config.ts` ignore exists in arclight's eslint config to remove.)

**Patterns to follow:**

- `apps/journeys/tsconfig.json`, `apps/journeys/tsconfig.spec.json`, `apps/journeys/eslint.config.mjs` post-migration.

**Test scenarios:**

- Test expectation: none — config-only change. Verification is via U4.

**Verification:**

- `grep -r "jest\|@jest" apps/arclight/tsconfig*.json apps/arclight/eslint.config.mjs` returns zero matches.
- `apps/arclight/tsconfig.spec.json` `include` contains `"setupTests.ts"`.

---

- U4. **Run final verification and confirm green pipeline**

**Goal:** Prove the migrated workspace runs cleanly end-to-end and leaves no Jest references behind.

**Requirements:** R7, R8

**Dependencies:** U1, U2, U3.

**Files:**

- Touch: none (verification only).

**Approach:**

- Run `nx test arclight --skip-nx-cache`. Expected: Vitest banner prints, `passWithNoTests: true` allows exit 0, coverage directory is created at `coverage/apps/arclight`.
- Run `nx lint arclight --skip-nx-cache`. Expected: clean (no `vitest.config.mts` lint errors, no leftover Jest type references).
- Run `nx type-check arclight --skip-nx-cache` (if the target exists in `project.json` — it does). Expected: clean.
- Run `grep -rE "jest|@jest|babel-jest|ts-jest" apps/arclight/ --include="*.ts" --include="*.tsx" --include="*.json" --include="*.mjs" --include="*.js"` excluding `node_modules` and `.next`. Expected: zero matches.

**Test scenarios:**

- Happy path: `nx test arclight` exits 0 with output indicating Vitest ran (not Jest) and zero specs were collected.
- Edge case: re-run with `--skip-nx-cache` confirms the result is not cache-stale from a prior Jest run.
- Error path (negative): introduce a stub `apps/arclight/src/lib/cache.spec.ts` containing `it('compiles', () => expect(true).toBe(true))`, run `nx test arclight`, confirm Vitest collects and passes the spec, then **delete the stub** before commit. This validates that the rig works end-to-end without committing a placeholder test.

**Verification:**

- All four shell checks above produce expected output.
- The stub-test smoke check (run only locally during U4; not committed) passes.

---

## System-Wide Impact

- **Interaction graph:** Only the `test` and `lint` Nx targets for `arclight` are touched. No runtime code paths, no Vercel build target, no e2e harness, no shared library.
- **Error propagation:** None — config-only migration. CI affected-test pipeline picks up the new executor automatically because Nx reads `project.json` at graph construction time.
- **State lifecycle risks:** None. No persisted state, no caches outside `.cache/arclight/eslint` (untouched).
- **API surface parity:** The CI workflow under `.github/workflows/` invokes `nx test` / `nx affected --target=test` — both remain valid with `@nx/vitest:test`. Verified by the journeys migration shipping in the same workflows without CI changes.
- **Integration coverage:** None needed — no behavioral change.
- **Unchanged invariants:** The runtime Next.js build, the deploy target, the eslint rules themselves (only the `ignores` list changes), the e2e suite under `apps/arclight-e2e`, and every other app's test runner all remain untouched. This plan explicitly does not change them.

---

## Risks & Dependencies

| Risk                                                                                                                                          | Mitigation                                                                                                                                                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nx/vitest:test` 22.7.1 has a different `outputs` glob shape than `@nx/jest:jest` and silently fails to upload coverage in CI.               | U4 includes a `--skip-nx-cache` test run that materializes `coverage/apps/arclight`; CI parity is also confirmed by the journeys migration shipping under the same Nx version on the same workflow.                                                                                             |
| A future arclight test relies on a `@nx/next/babel`-only transform (e.g., MDX, `next/font` macro) that `@vitejs/plugin-react` doesn't handle. | Out of scope — no such test exists today. The journeys migration solved this for an equivalent stack and provides the recipe if it ever surfaces. The plan ships with `passWithNoTests: true`, so the worst case is "the next test author needs a 5-line vitest plugin tweak", not a broken CI. |
| `setupTests.ts` polyfills `stream/web` globally and a future arclight test conflicts with that polyfill.                                      | Low risk — journeys uses the identical polyfill in production for ~70 spec files. Documented in U1 so the next author sees the rationale.                                                                                                                                                       |
| Forgotten Jest reference in a generated file or `.cache/`.                                                                                    | U4's grep sweep covers the source tree. `.cache/` is excluded by `.gitignore` and rebuilt fresh — not a real risk.                                                                                                                                                                              |
| `nx test` cache picks up a stale Jest pass and lies about success.                                                                            | U4 mandates `--skip-nx-cache` for the verification run.                                                                                                                                                                                                                                         |

---

## Documentation / Operational Notes

- No README updates needed — `apps/arclight/` has no `AGENTS.md` (verified) and no test-runner-specific README. If one is added in a future PR, document the Vitest setup at that time.
- No CI workflow changes needed — the workflow already invokes `nx test` / `nx affected --target=test` without naming the executor.
- Doppler / Vercel / deployment targets are untouched. The `serve`, `build`, `deploy`, `vercel-alias`, `upload-sourcemaps`, `fetch-secrets`, and `extract-translations` targets in `project.json` are all unchanged.
- Coverage uploads in CI: the cobertura reporter and reportsDirectory mirror journeys exactly; downstream Datadog/Codecov ingestion (if any) needs no change.

---

## Sources & References

- Reference PR (Next.js sibling): #9132 — `refactor: journeys vitest` (commit `55dd5e540`, merged 2026-05-06).
- Reference PR (api tier): #9179 — `chore(api-media): migrate test suite from Jest to Vitest` (commit `6c28772e2`, merged 2026-05-07).
- Plan template: `docs/plans/2026-05-07-001-chore-api-media-vitest-migration-plan.md`.
- Related code:
  - `apps/journeys/vitest.config.mts`
  - `apps/journeys/setupTests.ts`
  - `apps/journeys/tsconfig.json`
  - `apps/journeys/tsconfig.spec.json`
  - `apps/journeys/eslint.config.mjs`
  - `apps/journeys/project.json` (test target stanza)
  - `apps/arclight/jest.config.ts` (to be deleted)
  - `apps/arclight/project.json` (test target to be replaced)
  - `apps/arclight/tsconfig.json` and `apps/arclight/tsconfig.spec.json` (to be updated)
  - `apps/arclight/eslint.config.mjs` (to be updated)
- Project rule: `.claude/rules/running-jest-tests.md` — note Vitest analog (`npx vitest run --config <path> <file>`) for future single-file iteration.
