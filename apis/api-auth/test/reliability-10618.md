# Saved-edit and structural reliability recheck

Investigation for [#10618](https://github.com/JesusFilm/core/issues/10618).
The PR base is `feature/11-12-SC-journeys-mcp`.

## Baseline and isolation

The feature head tested on 2026-11-26 was
`14d37d7aa26bebbdc8aaf84c078aa576eee99690`. No product code, assertions,
retries or timeouts were changed for these runs.

The runner used Node 24.22.1, pnpm 10.33.4, Vitest 4.1.10 with V8 coverage,
and local PostgreSQL 13.23. CI uses PostgreSQL 16, so these results do not
establish identical timing on CI runners.

Each invocation used newly created Auth and Journeys databases with all
committed migrations applied using `prisma migrate deploy`. Auth ran with a
separate role granted schema usage and table DML, without ownership or DDL,
as in `tools/scripts/test-mcp-edits.mjs` and
`tools/scripts/test-mcp-structure.mjs`. All identities and content were synthetic.
The full structural route also used a separately migrated Auth issuer database
for `http.spec.ts` and its storage-permission test.

Database pairs used these suffixes after `auth_issue_` and `journeys_issue_`:

- Saved edits: `10553_10618focused1`, `10553_10618focused2`,
  `10553_10618focused3`, `10553_10618full1`.
- Structure: `10618_smoke1`, `10618_smoke2`, `10618_smoke3`, `10618_smoke4`,
  `10618_full1`. The full route's issuer database added `_issuer`.

The saved-edit fixture currently accepts a fixed list of historical issue
prefixes. Its `10553_` prefix was retained and the `10618` suffix isolated this
investigation's databases. No shared development databases were used.

## Focused checks

The existing commands, with the matching restricted Auth and Journeys database
URLs exported for each fresh database pair, were:

```sh
pnpm exec vitest run --config apis/api-auth/vitest.edits.config.mts \
  apis/api-auth/test/grantedEdits.spec.ts \
  -t 'counts distinct affected objects when repeated insertions shift the same siblings'

STRUCTURE_TEST_ISSUE=10618_smoke1 \
  pnpm exec vitest run --config apis/api-auth/vitest.structure.config.mts \
  apis/api-auth/test/grantedStructure.spec.ts \
  -t 'reads stable IDs and implemented structural capabilities'
```

The saved-edit command requires `EDITS_TEST_AUTH_DATABASE_URL` and
`EDITS_TEST_JOURNEYS_DATABASE_URL`. Structure requires
`STRUCTURE_TEST_AUTH_DATABASE_URL`, `STRUCTURE_TEST_JOURNEYS_DATABASE_URL` and
the matching `STRUCTURE_TEST_ISSUE`.

| Case                                                | Run | Passed | Failed | Excluded by name filter | Test duration |
| --------------------------------------------------- | --- | ------ | ------ | ----------------------- | ------------- |
| Saved-edit distinct affected objects, undo and redo | 1   | 1      | 0      | 253                     | 4.985 s       |
| Saved-edit distinct affected objects, undo and redo | 2   | 1      | 0      | 253                     | 4.898 s       |
| Saved-edit distinct affected objects, undo and redo | 3   | 1      | 0      | 253                     | 3.994 s       |
| Structural protected-route smoke                    | 1   | 1      | 0      | 91                      | 0.486 s       |
| Structural protected-route smoke                    | 2   | 1      | 0      | 91                      | 0.461 s       |
| Structural protected-route smoke                    | 3   | 1      | 0      | 91                      | 0.457 s       |
| Structural protected-route smoke                    | 4   | 1      | 0      | 91                      | 0.599 s       |

These focused runs intentionally excluded other tests. They are separate from
the full-route runs below. After each invocation exited, `pg_stat_activity`
contained no sessions connected to that invocation's databases.

A fourth fresh-database smoke run used an external Vitest reporter to time
`onHookStart`/`onHookEnd` events without editing the fixture. The shared
`beforeAll` completed in 4.100 seconds and `afterAll` in 2.919 seconds;
the complete invocation took 10.71 seconds. The process exited normally and
left no database sessions. This checks teardown as well as initialization.

## Complete routes

Both complete configurations ran with coverage enabled and zero skipped tests.
The commands used freshly migrated databases and the same database environment
variables as the focused checks, without a file or test-name filter:

```sh
pnpm exec vitest run --config apis/api-auth/vitest.edits.config.mts
pnpm exec vitest run --config apis/api-auth/vitest.structure.config.mts
```

The structural route additionally requires `AUTH_TEST_DATABASE_URL` and
`AUTH_TEST_MIGRATION_DATABASE_URL` for its separate issuer database.

| Route                                       | Files | Passed | Failed | Skipped | Vitest duration |
| ------------------------------------------- | ----- | ------ | ------ | ------- | --------------- |
| Saved edits, read page and shared contracts | 10    | 499    | 0      | 0       | 196.92 s        |
| Structural integration and issuer HTTP      | 2     | 129    | 0      | 0       | 68.61 s         |

The saved-edit integration file passed all 254 tests. Its reported undo case
passed in 3.766 seconds within the complete run. The structural integration
file passed all 92 tests and the issuer HTTP file passed all 37 tests.
After both route processes exited, `pg_stat_activity` showed no connections
to any of their databases.

The shared structural fixture was not changed, so the conditional requirement
to rerun the form route did not apply.

## Interpretation

The original `DEPENDENCY_UNAVAILABLE` response did not recur in the three
focused undo runs. The existing test still inserts 100 siblings, checks 103
affected objects and requires successful undo and redo receipts. No dependency
phase can be identified from a failure that did not recur.

The current structural fixture already uses
`options.startupTimeoutMs ?? 120000`, introduced by #10619. Its four focused
runs initialized, executed the protected-route check and exited cleanly.
The historical explicit 30-second startup limit is absent at the tested head.

Repeated passes do not establish a root cause for an intermittent failure or
prove it cannot recur. There is no evidence here to justify a production fix,
a retry or another timeout increase. Account retirement and approval-review
expiry remain outside this investigation, tracked in #10629 and #10634.
