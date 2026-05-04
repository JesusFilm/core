---
title: 'Backend: Per-card showAssistant + expandChatByDefault (NES-1556)'
type: feat
status: active
date: 2026-05-03
linear: https://linear.app/jesus-film-project/issue/NES-1556/backend-per-card-showassistant-field
scope: backend-only
related:
  - NES-1554 — Slice 1 prototype base (apologist chat)
  - NES-1557 — Editor UI for per-card controls (deferred)
  - NES-1585 — Production showAssistant migration script (7 journeys)
  - NES-1603 — Footer spacing reconciliation (hasAiChatButton vs flag)
follow_up_plans:
  - docs/plans/2026-05-04-001-feat-per-card-showassistant-frontend-plan.md (new ticket — frontend swap; depends on this PR being deployed first)
---

## Scope

**Backend-only.** Per the team's deploy-order convention (one ticket → one PR → backend ships before frontend so there is no cross-stack dependency at deploy time), this ticket lands the schema, the GraphQL exposure, and the mutation input only. The frontend swap (chat-visibility per card, drawer auto-open, controlled overlay state) lives in a separate ticket — see the linked follow-up plan.

After this ticket merges and deploys, **production behaviour is unchanged**: `Journey.showAssistant` is annotated `@deprecated` but still functional, and the existing frontend continues to read it. Direct DB `UPDATE`s to the new card columns are inert until the frontend ticket reads them.

## Enhancement Summary

**Deepened on:** 2026-05-03 with 13 parallel reviewers (architecture, data integrity, data migration, frontend races, TypeScript, pattern consistency, simplicity, security, schema-drift/federation, deployment verification, performance, best-practices research, learnings, spec flow). The frontend-specific findings have been moved to the sibling frontend plan; backend findings retained here.

### Material changes from the v1 draft (backend-relevant)

1. **Drop `@default(false)` on the new Prisma columns — keep them as bare `Boolean?`.** With a `false` default, every newly created `CardBlock` ships as `false` (not `null`), and the per-card / per-journey transition fallback in the frontend plan collapses (a brand-new card in a legacy journey would lose chat). Bare nullable also matches the codebase precedent (`fullscreen`, `themeMode`, `customizable`, etc.).
2. **Mark `Journey.showAssistant` `@deprecated` in this PR** (with `reason: "Use CardBlock.showAssistant"`). This unblocks GraphOS Studio usage tracking so we can know when it's safe to remove. Field stays in the schema for the frontend's transition fallback.
3. **Match the existing CardBlock field exposure style** in Pothos: `t.boolean({ nullable: true, resolve: (block) => block.showAssistant })` rather than `t.exposeBoolean(...)`. Consistent with how `themeMode` / `themeName` / `fullscreen` are exposed in `card.ts`.
4. **Drop the new fields from `CardBlockCreateInput`.** YAGNI — no caller sets them today. Add when NES-1557 (editor UI) needs them.
5. **Promote the World-Cup SQL `UPDATE` into a hardened runbook** (transactional, `lock_timeout`, `RETURNING`, audit-table snapshot, mandatory `journeyId` + `typename = 'CardBlock'` predicates). Note: the runbook only takes effect once the frontend ticket has deployed.
6. **Add a federation composition smoke step** after `nx generate-graphql api-gateway`: grep `apis/api-gateway/schema.graphql` for the new fields on `CardBlock` to confirm `@shareable` composed across both subgraphs. Required-commit list now includes all three regenerated `schema.graphql` files.

---

# Backend: Per-card `showAssistant` + `expandChatByDefault`

## Overview

Add two nullable Boolean columns to `CardBlock` (`showAssistant`, `expandChatByDefault`); expose both on the federated supergraph; accept them on `CardBlockUpdateInput`; mark `Journey.showAssistant` `@deprecated`. World-Cup launch values can be set via direct DB `UPDATE` after the frontend ticket lands; that runbook is included here so it ships alongside the schema.

## Problem Statement / Motivation

Today `Journey.showAssistant` is a journey-wide flag — every card in a journey either gets the chat button or none do. The World-Cup apologist-chat experience needs per-card control. The frontend already gates the chat behind the `apologistChat` LD flag (engineering rollout) AND `Journey.showAssistant` (creator opt-in); only the second of those needs to move to per-card granularity (memory: `apologistChat` flag vs `showAssistant`).

This ticket lands the data model and API surface that the frontend ticket will consume. Because the journey-level field stays (`@deprecated`), nothing in production changes when this PR deploys.

## Proposed Solution

1. Add two **bare nullable** Boolean columns to `Block` (`showAssistant Boolean?`, `expandChatByDefault Boolean?`) — no `@default(false)`. They are only meaningful for `Block` rows with `typename = 'CardBlock'`; on every other typename they are dead columns. This mirrors the existing CardBlock-only column convention (`fullscreen`, `themeMode`, `themeName`, `customizable`).
2. Expose both fields on `CardBlock` in **both** GraphQL surfaces (`api-journeys` SDL-first and `api-journeys-modern` Pothos), `@shareable` so the gateway composes them as a value-type field with parallel ownership. Use the resolver style already used for sibling CardBlock-only fields (explicit `resolve` returning `block.showAssistant`), not `t.exposeBoolean`.
3. Extend `CardBlockUpdateInput` to accept both fields. **Do not** add them to `CardBlockCreateInput` — no caller sets them today, and NES-1557 (editor) will add them when it ships.
4. Mark `Journey.showAssistant` `@deprecated` on both subgraphs. Field stays in the schema and the journey fragment.

## Decisions

1. **Column nullability — bare `Boolean?`, no default.** A `null` value means "not yet decided / fall back to `Journey.showAssistant`" during the transition window the frontend ticket will own. An explicit `false` means "creator opted this card out." A default of `false` would erase that distinction and break the frontend's fallback path on any newly created card.
2. **`expandChatByDefault=true` with `showAssistant=false`** is silently accepted by the mutation — no validation error. The semantics are owned by the frontend ticket (no-op render). Spec asserts persistence still works.
3. **`CardBlockCreateInput`** does not get the new fields in this ticket (YAGNI). NES-1557 adds them when the editor needs them.

## Schema changes

### Prisma — `libs/prisma/journeys/db/schema.prisma`

Append to the `Block` model:

```prisma
// CardBlock-only fields (per NES-1556). Bare nullable: a `null` value means
// "not yet decided / fall back to Journey.showAssistant" during the transition
// window; an explicit `false` means "creator opted this card out".
showAssistant         Boolean?
expandChatByDefault   Boolean?
```

Generate + migrate:

```bash
nx prisma-generate prisma-journeys
nx prisma-migrate prisma-journeys
```

If the migrate command hits the "non-interactive environment" error, use the manual fallback documented in `.claude/rules/backend/database-schema-changes.md` (Troubleshooting).

#### Migration safety

- PostgreSQL 11+ executes `ALTER TABLE Block ADD COLUMN ... BOOLEAN` as a metadata-only catalog update — no table rewrite, instant on a hot table. Safe under live writes.
- `ALTER TABLE` still acquires `ACCESS EXCLUSIVE` for the duration. On an idle table this is microseconds; under heavy load it can queue behind long selects/writes and then block everyone. **Set `lock_timeout` before the DDL** so the migration aborts cleanly rather than stalling production:

  ```sql
  -- Wrap the Prisma-generated migration body
  SET lock_timeout = '3s';
  -- ... ALTER TABLE statements ...
  ```

- After rebase against `main`, re-check `libs/prisma/journeys/db/migrations/` for any newer journeys-domain migration. If present, regenerate this migration with a fresh timestamp so lexical ordering matches merge order. Drift will surface as a `migration was applied after ...` warning on environments that already ran the other branch.
- Confirm the journeys DB has PITR enabled before any direct production `UPDATE` runs (see the World-Cup runbook below for the audit-table belt-and-braces).

### Pothos (`api-journeys-modern`)

`apis/api-journeys-modern/src/schema/block/card/card.ts` — add to `fields` (mirror `themeMode` / `themeName` style):

```ts
showAssistant: t.boolean({
  nullable: true,
  description: 'When true, this card displays the AI chat button.',
  resolve: (block) => block.showAssistant
}),
expandChatByDefault: t.boolean({
  nullable: true,
  description: 'When true, the chat drawer auto-opens on first visit to this card.',
  resolve: (block) => block.expandChatByDefault
})
```

`apis/api-journeys-modern/src/schema/block/card/inputs/cardBlockUpdateInput.ts` — add:

```ts
showAssistant: t.boolean({ required: false }),
expandChatByDefault: t.boolean({ required: false })
```

(Do not set `defaultValue` on input fields — that would silently overwrite an unset field on every update.)

`apis/api-journeys-modern/src/schema/block/card/cardBlockUpdate.mutation.ts` already spreads `...input`, so no resolver change.

`apis/api-journeys-modern/src/schema/journey/journey.ts:169` — add `deprecationReason` to the existing `showAssistant` exposure:

```ts
showAssistant: t.exposeBoolean('showAssistant', {
  nullable: true,
  deprecationReason: 'Use CardBlock.showAssistant. Removed once NES-1585 backfill completes.'
})
```

### SDL-first (`api-journeys`)

`apis/api-journeys/src/app/modules/block/card/card.graphql` — add inside `type CardBlock`:

```graphql
"""
When true, this card displays the AI chat button.
"""
showAssistant: Boolean @shareable
"""
When true, the chat drawer auto-opens on first visit to this card.
"""
expandChatByDefault: Boolean @shareable
```

`apis/api-journeys/src/app/modules/journey/journey.graphql:82` — annotate the existing field:

```graphql
showAssistant: Boolean
  @deprecated(reason: "Use CardBlock.showAssistant. Removed once NES-1585 backfill completes.")
```

`apis/api-journeys/src/app/modules/block/card/card.resolver.ts` — no change needed (CardBlock fields auto-resolve from the Prisma row in this resolver; only `fullscreen` has a custom resolver because its SDL is non-null and needs `?? false`). Skip the resolver-spec edit — passthrough is automatic.

### Codegen sequence (per `.claude/rules/backend/database-schema-changes.md`)

```bash
# 1. Prisma
nx prisma-generate prisma-journeys
nx prisma-migrate prisma-journeys

# 2. api-journeys requires a running server for Rover introspection (port 4001)
nf start                          # or: nx serve api-journeys
nx generate-graphql api-journeys
nx generate-graphql api-journeys-modern   # static, no server needed

# 3. Recompose the supergraph
nx generate-graphql api-gateway

# 4. Federation composition smoke test (REQUIRED)
grep -E "showAssistant|expandChatByDefault" apis/api-gateway/schema.graphql
# Expect: both fields on `type CardBlock`, each with two
# `@join__field(graph: API_JOURNEYS)` and `@join__field(graph: API_JOURNEYS_MODERN)`
# directives. If only one subgraph appears, composition silently picked one
# side — investigate before merging.

# 5. Frontend codegen — emits no changes here because no fragment yet selects
#    the new fields. Run anyway to confirm zero diff in __generated__.
nx run-many -t codegen
```

**Commit all three regenerated supergraph files** alongside the SDL/Pothos sources:
- `apis/api-journeys/schema.graphql`
- `apis/api-journeys-modern/schema.graphql`
- `apis/api-gateway/schema.graphql`

## Tests

Run with `npx jest --config <api-path>/jest.config.ts --no-coverage <spec>` per `.claude/rules/running-jest-tests.md`.

- `apis/api-journeys-modern/src/schema/block/card/cardBlockUpdate.mutation.spec.ts`:
  - Persists `showAssistant: true`.
  - Persists `expandChatByDefault: true`.
  - Persists `expandChatByDefault: true` while `showAssistant: false` without error (semantics owned by frontend; mutation is a passthrough).
  - Anonymous user without a `userJourney` ACL link → `FORBIDDEN`.
  - Authenticated user from an unrelated team → `FORBIDDEN`.
- `apis/api-journeys-modern/src/schema/block/blockDuplicate.mutation.spec.ts` — duplicating a CardBlock preserves both new fields. The `{...block, ...updatedBlockProps}` spread at `service.ts:261` should already cover this; the spec locks the behaviour against future refactors.
- `apis/api-journeys-modern/src/schema/journeyAiTranslate/getCardBlocksContent/getCardBlocksContent.spec.ts` — assert the new boolean fields are not serialised into the AI-translation prompt context (extractor only emits text/labels today; lock the boundary).
- `apis/api-journeys/src/app/modules/block/card/card.resolver.spec.ts` — light passthrough assertion that the new fields appear in the resolved CardBlock when set on the Prisma row.

## Acceptance criteria

- [ ] Prisma schema updated with per-card `showAssistant` and `expandChatByDefault`, both bare `Boolean?` (no default).
- [ ] Migration runs cleanly against the local journeys DB.
- [ ] GraphQL schema (both `api-journeys` and `api-journeys-modern`) exposes both fields on `CardBlock` with `@shareable`.
- [ ] `Journey.showAssistant` is annotated `@deprecated` on both subgraphs (not removed).
- [ ] `CardBlockUpdateInput` accepts both fields; `cardBlockUpdate` mutation persists them.
- [ ] After `nx generate-graphql api-gateway`, the gateway schema lists both new fields on `CardBlock` with **two** `@join__field` directives (one per subgraph).
- [ ] All three regenerated `schema.graphql` files (api-journeys, api-journeys-modern, api-gateway) are committed.
- [ ] Backend specs pass: cardBlockUpdate.mutation, blockDuplicate.mutation, getCardBlocksContent, card.resolver.
- [ ] Existing frontend in production continues to render the chat button identically (verified by spot-check on the 7 opt-in journeys after deploy — Journey.showAssistant is still the active gate).

## System-wide impact

- **Interaction graph.** No frontend behaviour change. `cardBlockUpdate` accepts new fields and writes them to `Block` rows. `Journey.showAssistant` continues to be readable by the existing journeys frontend — `@deprecated` is a schema directive, not a runtime behaviour change.
- **Error propagation.** No new server failure modes. `cardBlockUpdate` is a passthrough write; existing `authorizeBlockUpdate` covers auth (verified — same gate as `themeMode` / `fullscreen`).
- **State lifecycle risks.** None — backend-only change.
- **API surface parity.** `@shareable` requires identical types across subgraphs. Both definitions are nullable `Boolean`; descriptions can differ but types/nullability/arguments must match. The composition smoke step above is the catch.
- **Apollo client cache normalisation.** New fields ship in the schema but no fragment selects them yet (the frontend ticket adds the fragment edit). Existing cached `CardFields` entities are untouched.

## Migration & rollout

### This ticket

- Schema migration is additive (two nullable boolean columns) — safe under live writes. PG 11+ metadata-only.
- This ticket does **not** include the production data backfill. NES-1585 ships that.
- World Cup direct-`UPDATE`s should be **scheduled to run after the frontend ticket deploys** — running them before is harmless (the data sits unread) but operationally confusing. Holds them in the runbook below.

### NES-1585 hand-off requirements (separate ticket; gates the fallback-removal PR)

- **Idempotent and replay-safe.** Use `WHERE "showAssistant" IS NULL` — never unconditional `SET`. Wrap in `BEGIN; ... COMMIT;` with a `SELECT COUNT(*) ...` preview.
- **Scope by `journeyId`, not by current card list.** Cards created **after** the backfill but **before** `Journey.showAssistant` is removed are otherwise at risk. Two options:
  - (a) Re-run the script as a scheduled job until removal — drift-prone.
  - (b) Install a Prisma `Block.create` middleware that copies `journey.showAssistant` onto new CardBlocks for the 7 journey ids — single source of truth, no cron drift. **Recommended.**
- **Final step: bump ISR revalidate key (or purge CDN cache) for the 7 journey slugs** so `apps/journeys` doesn't keep serving stale HTML.

### Fallback removal (deferred follow-up PR — separate ticket)

Removes `Journey.showAssistant` from the schema and the `(card?.showAssistant ?? journey?.showAssistant)` fallback in the frontend. PR description must include these results before merge:

```sql
-- Must return 0 rows
SELECT j.id, COUNT(b.id) AS null_cards
  FROM "Journey" j
  JOIN "Block" b ON b."journeyId" = j.id
 WHERE j."showAssistant" = true
   AND b."typename" = 'CardBlock'
   AND b."showAssistant" IS NULL
 GROUP BY j.id;

-- Sanity: per-journey vs per-card agreement
SELECT j.id, j."showAssistant" AS journey_val,
       BOOL_OR(b."showAssistant") AS any_card_true
  FROM "Journey" j
  JOIN "Block" b ON b."journeyId" = j.id AND b."typename" = 'CardBlock'
 WHERE j."showAssistant" = true
 GROUP BY j.id;
```

## World Cup direct-UPDATE runbook

**Run after the frontend ticket has deployed.** Two-engineer review required. PITR confirmed. Audit-table snapshot before write. All SQL must include `"journeyId" = ...` AND `"typename" = 'CardBlock'` AND a non-empty `id = ANY(...)` predicate — defence in depth against accidental bulk update.

```sql
-- 0. Snapshot — gives a one-line revert
CREATE TABLE block_showassistant_audit_20260503 AS
SELECT id, "journeyId", "showAssistant", "expandChatByDefault"
  FROM "Block"
 WHERE "journeyId" = $WORLD_CUP_JOURNEY_ID
   AND "typename" = 'CardBlock';

-- 1. Transactional write
BEGIN;
SET lock_timeout = '3s';

-- 1a. Pre-image for the PR description
SELECT id, "showAssistant", "expandChatByDefault"
  FROM "Block"
 WHERE "journeyId" = $WORLD_CUP_JOURNEY_ID
   AND "typename" = 'CardBlock'
   AND id = ANY($CARD_IDS)
 ORDER BY "parentOrder"
 FOR UPDATE;

-- 1b. The write itself
UPDATE "Block"
   SET "showAssistant" = true,
       "expandChatByDefault" = false
 WHERE "journeyId" = $WORLD_CUP_JOURNEY_ID
   AND "typename" = 'CardBlock'
   AND id = ANY($CARD_IDS)
RETURNING id, "showAssistant", "expandChatByDefault";

-- 1c. Operator inspects RETURNING output. Row count MUST equal len($CARD_IDS).
-- COMMIT only if the diff matches expectations; otherwise ROLLBACK.
COMMIT;

-- 2. Global guardrail: nothing outside the intended journey was touched
SELECT COUNT(*) FROM "Block"
 WHERE "typename" = 'CardBlock'
   AND ("showAssistant" = true OR "expandChatByDefault" = true)
   AND "journeyId" <> $WORLD_CUP_JOURNEY_ID;
-- Expected: 0.
```

## Deployment & rollback

### Pre-deploy verification SQL (read-only baseline)

```sql
-- Confirm columns do NOT yet exist (sanity: migration not run)
SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
 WHERE table_name = 'Block'
   AND column_name IN ('showAssistant', 'expandChatByDefault');
-- Expected pre-migration: 0 rows.

-- Block-row baseline (compare post-migration)
SELECT COUNT(*) AS total_blocks,
       COUNT(*) FILTER (WHERE typename = 'CardBlock') AS card_blocks
  FROM "Block";

-- Existing per-journey opt-ins (should be 7 per NES-1585)
SELECT id, title, "showAssistant" FROM "Journey" WHERE "showAssistant" = true ORDER BY id;
```

### Strict deploy order (within this ticket)

1. `nx prisma-migrate prisma-journeys` (additive, nullable, no default).
2. Deploy **api-journeys** (SDL + `@shareable`).
3. Deploy **api-journeys-modern** (Pothos).
4. Redeploy **api-gateway** (recompose supergraph). Composition before both subgraphs publish = composition error.
5. **No frontend deploy in this ticket.** Production frontend continues to read `Journey.showAssistant` and renders identically.

Reordering risks: migrate-after-API → Prisma errors on missing columns; gateway-before-both-subgraphs → composition rejects subgraph with missing field → 5xx on every gateway query.

### Rollback

- **API regression on `cardBlockUpdate`**: roll back **api-journeys-modern** first; roll back `api-journeys` if needed. Gateway will recompose against whichever subgraph version is live — leave gateway as-is unless composition errors appear, then redeploy gateway against the rolled-back subgraphs.
- **Schema rollback**: not recommended. Columns are nullable with no default — zero cost to leave them. Dropping would force a second migration and break the just-deployed APIs.

### Monitoring (first hour, then +4h, +24h)

| Signal | Source | Alert if |
|---|---|---|
| `cardBlockUpdate` mutation 5xx rate | api-journeys-modern logs / Datadog | > 0.5 % over 5 min |
| Gateway composition errors | api-gateway startup logs | any occurrence |
| Prisma error rate `column does not exist` | api-journeys + api-journeys-modern logs | any occurrence (deploy-order violation) |
| Chat-button render count on the 7 legacy journeys | GTM `chat_button_visible` | drops > 5 % vs 24h prior baseline (this ticket should be invisible to users — any drop indicates a regression) |

## Sources & References

### Internal references

- Prisma model: `libs/prisma/journeys/db/schema.prisma:457` (`Journey.showAssistant`); `libs/prisma/journeys/db/schema.prisma:537` (`Block` model — append-point for new columns; precedent for bare `Boolean?` at lines 557, 578, 586, 587, 590, 600, 611, 634)
- Modern Pothos CardBlock: `apis/api-journeys-modern/src/schema/block/card/card.ts:13` (precedent for `t.boolean({ resolve, nullable })` style at `fullscreen`, `themeMode`, `themeName`)
- Modern CardBlockUpdate input: `apis/api-journeys-modern/src/schema/block/card/inputs/cardBlockUpdateInput.ts:5`
- Modern Journey type (for `@deprecated`): `apis/api-journeys-modern/src/schema/journey/journey.ts:169`
- Block-update auth gate: `apis/api-journeys-modern/src/schema/block/service.ts:32` (`authorizeBlockUpdate` → `journeyAcl(Update)`)
- Auth scope rules: `apis/api-journeys-modern/src/schema/authScopes.ts:99` (`isAnonymous`)
- Block duplicate spread: `apis/api-journeys-modern/src/schema/block/service.ts:261` (`{...block, ...updatedBlockProps}`)
- AI translation extractor: `apis/api-journeys-modern/src/schema/journeyAiTranslate/getCardBlocksContent/getCardBlocksContent.ts`
- Legacy CardBlock SDL: `apis/api-journeys/src/app/modules/block/card/card.graphql:1`

### Rules

- `.claude/rules/backend/database-schema-changes.md` — Prisma + GraphQL codegen sequence (Steps 1–7 must all run; both APIs share the `journeys` domain).
- `.claude/rules/backend/apis.md` — Pothos / Yoga / Prisma stack conventions; always type, early returns.
- `.claude/rules/running-jest-tests.md` — `npx jest --config <api>/jest.config.ts --no-coverage <file>`; never `nx test`.
- `.claude/rules/backend/customizable-blocks.md` — **does not apply** here (we are not adding a `customizable` field).

### Past learnings (`docs/solutions/`)

- `integration-issues/federation-subgraph-scalar-registration-hidden-prerequisites.md` — supergraph composition gotchas. Mitigated here by the explicit grep step on `apis/api-gateway/schema.graphql` after composition.
- `logic-errors/pothos-query-parameter-ignored-nested-resolution-failure.md` — `_query` vs `...query` anti-pattern. Verify the `cardBlockUpdate` resolver and any read-side resolver spread `...query` (not `_query`) so the new field selections survive nested resolution.

### External best-practice references

- Apollo: [Schema Deprecations](https://www.apollographql.com/docs/graphos/schema-design/guides/deprecations) — using `@deprecated` to enable usage tracking via GraphOS Studio before field removal.
- Apollo: [Value Types in Apollo Federation](https://www.apollographql.com/docs/graphos/schema-design/federated-schemas/sharing-types) — `@shareable` is the right primitive when both subgraphs independently resolve the field from the same data source.

### Related Linear work

- NES-1554 — Slice 1 prototype base (apologist chat E2E pipe)
- NES-1557 — Editor UI for per-card showAssistant + expandChatByDefault (deferred, separate ticket)
- NES-1585 — Production migration script for 7 existing journeys (must include the Prisma `Block.create` middleware described above)
- NES-1603 — Footer spacing reconciliation between `hasAiChatButton` and the `apologistChat` flag — addressed in the frontend ticket.
- **NES-1622** — Frontend swap ticket — `docs/plans/2026-05-04-001-feat-per-card-showassistant-frontend-plan.md`. Depends on this PR being deployed first.

### Memory carried forward

- `apologistChat` flag (engineering rollout) AND `showAssistant` (creator opt-in) are both required to render the chat — both checks must remain after the frontend swap.
- `apps/journeys` is a public no-auth viewer; CDN-cached. Implication owned by the frontend ticket and NES-1585.
