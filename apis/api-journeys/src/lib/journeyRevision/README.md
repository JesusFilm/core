# Shared journey revisions

Issue [#10552](https://github.com/JesusFilm/core/issues/10552), part of
[#10153](https://github.com/JesusFilm/core/issues/10153).

`JourneyRevision.revision` is an opaque decimal string at service boundaries.
It starts at zero for existing journeys. PostgreSQL advances it once per
transaction that changes authoring state. It is neither an edit count nor a
timestamp. A transaction that changes several blocks/actions advances once;
existing Admin gestures spanning transactions can advance several times.
No-op updates, rejected statements and rolled-back transactions do not advance.

The database owns advancement so old Admin binaries, workers, nested Prisma
writes, direct actions and compact replacements cannot bypass it. The revision
write is in the content transaction, including autocommit statements. Existing
Admin role checks and published-content editing behavior remain unchanged.

## Writer classification

| Writer                                                                                                    | Owning transaction and coverage                                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Every mounted block create/update, including image/video attachment, AI chat settings and API-only fields | `Block` trigger covers the shared block service and direct/nested writes. Grid and video-trigger content use the same table.                                                                                                                                    |
| Order/position, delete/restore, duplicate, owned image/menu/cover/poster/icon references                  | `Block` and `Journey` triggers. Existing multi-transaction gestures retain their existing atomicity.                                                                                                                                                            |
| `blockUpdateAction`, the five direct action mutations and `blockDeleteAction`                             | `Action` trigger derives ownership from `parentBlockId`. `Action.journeyId` is a legacy destination, not ownership. All five generic action branches participate.                                                                                               |
| `journeyUpdate`, `journeySimpleUpdate`                                                                    | `Journey`, `Block`, `Action` and `JourneyTag` triggers, including nested writes and complete compact replacements.                                                                                                                                              |
| Theme create/update/delete                                                                                | `JourneyTheme` trigger.                                                                                                                                                                                                                                         |
| Chat button create/update/remove, including reassignment                                                  | `ChatButton` trigger invalidates both old and new owners.                                                                                                                                                                                                       |
| Customization values, publisher replacement, customization recalculation, translation workers             | `JourneyCustomizationField`, `Journey` and `Block` triggers. Derived customizable changes may form an additional transaction.                                                                                                                                   |
| Publish, archive, trash, soft delete, restore, template conversion and feature changes                    | `Journey` trigger shares the journey row lock used by compare-and-save. Physical deletion removes its revision by cascade.                                                                                                                                      |
| Creation, whole-journey duplication, anonymous adoption and transfer                                      | Existing Admin operations remain available. Inserts initialize revisions; subsequent content or team changes participate. These are not MCP operations.                                                                                                         |
| Shared block references and existing integration configuration                                            | Referencing journeys also advance when a shared block or locally stored integration changes. Reverse lookups have indexes. No referenced resource is overwritten to resolve a conflict.                                                                         |
| Host records and `Journey.hostId` alone                                                                   | Excluded. A narrow content patch preserves the current assignment and Host, including later human changes. MCP has no Host write authority.                                                                                                                     |
| `updatedAt`, Plausible tokens and block `exportOrder` alone                                               | Excluded maintenance and analytics state. Visitor/events, notifications, roles, invitations, QR/domains, collections and campaigns do not author this journey's supported content. Current rights and integration eligibility still require independent checks. |

Shared references are invalidated by the database where their mutable content
lives in the journeys database. Reference installation locks the source block
at the same strength used for ancestor locking. Mutable containment and slot
dependencies are followed recursively, including actions inside a shared menu.
This prevents a new attachment from committing between source invalidation
and its commit. External images/videos, provider facts,
languages and remote integration routes remain reference-only dependencies.
Journey editing does not update those resources. Their owning handlers must
resolve authorized ready references and recheck eligibility before acceptance;
a journey revision cannot promise a snapshot of a separate database/provider.
Cross-journey references do not grant read or write rights. A later command
must enforce same-journey ownership before changing a block or owned slot.

## Internal read and compare-and-save contract

These functions are local transaction prerequisites. They expose no GraphQL or
MCP capability and grant no authority. The first edit executor in #10553 owns
the complete grant participant, exact replay, history, receipt and audit.

1. Read current rights, grant and content within an authorized owning-service
   read. Use a `RepeatableRead` transaction and `readJourneyRevision(tx, id)`
   in that same transaction so returned content and revision share a snapshot.
   Page continuation must reject a changed revision. Never add this revision
   to public `Journey` field resolution or use a public-template/guest fallback.
2. For an edit, open an owning transaction at `ReadCommitted` or stricter.
   Capture coordinator gate generations before authoritative rights reads.
   Call `lockDraftJourneyRevision(tx, id, expectedRevision)` before any writes.
   It takes `FOR NO KEY UPDATE` on the journey, then checks ordinary draft
   state and the shared revision. Every participating content write and
   lifecycle update must acquire that same row lock before committing.
3. After acquiring locks, the executor must freshly verify current Admin
   rights, active resource/operation grant, matching generations, current
   flags/state and current time strictly before expiry. The local helper
   does not perform these checks. Complete the content/history/receipt/effect
   intent in that transaction. Do not call providers inside it. Later dispatch,
   attachment and private output release need their own fresh checks.
4. Read the resulting revision in the transaction for the saved receipt.
   Return that historical commit revision without claiming it is current.
   Exact replay must not run the content transaction again. Stale ordinary
   edits fail without writes; a new read permits an explicit replacement of
   previously human-authored content. Patch only the requested fields.

Once the local lock is held, a competing publication/archive/delete waits.
If lifecycle commits first, compare-and-save observes its new state and rejects.
Concurrent Admin statements may already hold child row locks before their
triggers request the journey lock. PostgreSQL can abort a deadlock victim;
content and revision both roll back. Treat deadlock/serialization failure as
a failed transaction, never as an accepted edit or proof an external executor
stopped. Do not retry provider side effects through this transaction helper.

## Migration and rollout

The additive migration locks all participating tables, creates/backfills the
revision table and installs all triggers in one transaction. Old writers wait
until the whole migration commits and then execute through the same triggers.
There is no interval with a backfilled revision and an unfenced participating
writer. No Admin input or output contract changes are required. Missing
revision state fails closed. The application must run with normal triggers
enabled; disabling triggers/replication mode is an administrative operation,
never an application rollout mechanism.

The migration includes reverse-reference indexes and a backfill while holding
write locks. Measure its duration against staging data before production
rollout and schedule the migration accordingly. A failed migration rolls back
the table, backfill, indexes and triggers together. Rolling back API binaries
does not require removing this additive migration. Keep it installed until
all MCP writers are disabled and accepted participants have settled or been
positively fenced. An elapsed timeout is not evidence of settlement.

MCP writing remains unavailable in this slice. Do not enable an executor before
the migration and writer tests pass, and before its actual authorization and
acceptance participant is implemented and tested. Replacing application
binaries alone cannot bypass the installed database triggers. A deployment
that omits the migration or permits a participating writer to disable triggers
must keep MCP effects disabled.

## Verification

The dedicated integration configuration uses real PostgreSQL, Prisma and the
owning GraphQL schema, with synthetic identities and queue stubs. It creates
and drops a uniquely named database. Provide a local test server with
`CREATEDB` rights, not an application or production database credential.

```bash
JOURNEY_REVISION_TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres \
  pnpm exec vitest run --root apis/api-journeys \
  --config "$PWD/apis/api-journeys/vitest.integration.config.mts"
```

The `Journey revision integration` workflow runs the suite on pull requests.
It verifies all mounted block writers, all seven action entry points and every
generic branch, themes/chat/customization, compact updates, lifecycle writes,
rollback, stale/fresh replacement, real lock waits in both lifecycle orderings,
shared image invalidation, Host preservation, backfill and an old writer blocked
by the uncommitted migration. The later MCP HTTP/authentication and executor
integration belongs to #10553 and must use this boundary. These service tests
do not claim staging, browser, client or complete-release acceptance.
