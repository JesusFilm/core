# Residual review findings — api-media Vitest migration

**Branch:** 26-00-MA-chore-vitest-media
**Run:** ce-code-review 20260507-204103-09925811 (mode: autofix)
**Plan:** [docs/plans/2026-05-07-001-chore-api-media-vitest-migration-plan.md](../plans/2026-05-07-001-chore-api-media-vitest-migration-plan.md)
**Reviewers:** correctness, testing, maintainability, project-standards, kieran-typescript

All P0 / High findings were auto-fixed and bundled into the main migration commit. The items below are P2 / P3 quality improvements that did not block the migration but are worth follow-up.

## Residual Review Findings

- **[P2] apis/api-media/src/schema/mux/video/video.spec.ts (8 sites)** — `await vi.importMock<any>(...)` drops type information. Refactor to namespace import + `vi.mocked()` for typed access to `./service` and `../../../workers/processVideoDownloads/queue`. *(no_sink — recorded here)*
- **[P2] apis/api-media/vitest.config.mts:34** — `pool: 'forks'` diverges from the api-analytics reference recipe without justification. Either drop the option or add an inline comment naming the media-only reason. *(no_sink — recorded here)*
- **[P2] apis/AGENTS.md → Shared conventions → Testing** — Stale guidance still asserts "Jest + jest-mock-extended for Prisma mocking." Update to reflect the runner split (api-analytics, api-media use Vitest; api-journeys, api-journeys-modern, api-languages, api-users still use Jest). *(no_sink — recorded here)*
- **[P3] apis/api-media/src/workers/dataExport/service/service.spec.ts:99-104** — `vi.mocked(S3Client).mockImplementation(() => ({...}) as unknown as S3Client)` indicates a mock-shape gap. Wire `mockS3Send` inside the `vi.mock` factory and arm via `mockResolvedValue` per test. *(no_sink — recorded here)*
- **[P3] apis/api-media/src/workers/dataExport/service/service.spec.ts:99-108** — `vi.clearAllMocks()` runs after the S3Client `mockImplementation` install. Safe today; future swap to `resetAllMocks` would silently wipe it. Reorder so `clearAllMocks` runs first. *(no_sink — recorded here)*
- **[P3] apis/api-media/src/workers/processImageBlurhash/utils/generateBlurhash.spec.ts:24** — `const mockSharp = sharp as unknown as Mock` discards Sharp's call signature. Try `vi.mocked(sharp)` first; if Sharp's overloads make it awkward, keep the cast and add a comment. *(no_sink — recorded here)*
- **[P3] apis/api-media/src/scripts/data-import.spec.ts and src/workers/dataExport/service/service.spec.ts** — Full fs mock factories drop unmocked surface; future SUT calls into unmocked fs APIs fail with `cannot read X of undefined`. Use `vi.importActual('fs')` and spread overrides on top. *(no_sink — recorded here)*
- **[P3] apis/api-media/tsconfig.spec.json + tsconfig.app.json** — Carries `@nx/react/typings/cssmodule.d.ts` and `image.d.ts`. api-media is a Node service; these typings were dead under Jest too. Remove. *(no_sink — recorded here)*
- **[P3] apis/api-media/tsconfig.app.json:14-19** — `vitest.config.mts` in `exclude` is redundant since `include: ['**/*.ts']` does not match `.mts` files. Cargo-culted from prior jest config. Remove. *(no_sink — recorded here)*
- **[P3] Many spec files (~30 sites)** — `(prismaMock.x.y as Mock).mockResolvedValue(...)` casts strip the `DeepMockProxy<PrismaClient>` typing. Drop the cast — the proxy already exposes `.mockResolvedValue`. *(no_sink — recorded here)*
- **[P3] Most migrated specs** — Bulk migration script may have inserted a blank line between `import { vi } from 'vitest'` and other external imports, violating the project's eslint `import/order` rule (`newlines-between: always`, but `vitest` and `pino` are both external). Run `nx lint api-media --fix` to confirm and resolve. *(no_sink — recorded here)*
- **[P3] apis/api-media/src/yoga.ts** — Four scattered `process.env.NODE_ENV === 'test'` branches. Could be consolidated into a single `const isTest = ...` at module scope. *(no_sink — recorded here)*

## Pre-existing issues (not introduced by this PR)

- `isAi` and `uploaded` type errors in `apis/api-media/src/schema/cloudflare/image/image.ts`, `segmind.ts`, and several specs. Carried forward from the NES-1627 commit on `main` (`2037770d1`). Out of scope for this migration.
- 216 pre-existing `as any` casts across api-media specs.
