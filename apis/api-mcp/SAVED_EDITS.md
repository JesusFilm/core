# Saved draft edits

## Mounted content and presentation

Issue #10556 extends the same owning participant, replay namespace and persistent
history service with these closed commands:

| Command           | Mounted controls                                                                                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typography_set`  | Plain multiline content, h1–h6/body1/body2/caption, left/center/right and hex RGB color.                                                                                            |
| `button_set`      | Label, text/contained/outlined, small/medium/large, primary/secondary/error and left/center/right/justify.                                                                          |
| `button_icon_set` | An owned start/end slot, mounted icon name or null and inherit/primary/secondary/error color. Missing children are created internally.                                              |
| `spacer_set`      | Integer spacing 20–400 in increments of ten.                                                                                                                                        |
| `card_set`        | Fullscreen layout, nullable hex RGB/RGBA background, nullable integer blur 0–25 and nullable light/dark theme. Selecting a theme writes base; clearing it clears both theme fields. |
| `card_chat_set`   | Explicit enabled/collapse under the current `aiChatEditor` gate. Writes showAssistant and the inverse of collapse to expandChatByDefault.                                           |
| `block_add`       | Complete Typography, Button or Spacer in an existing Card, with explicit before/after/end placement.                                                                                |

Typography variants use the existing journey header/body fonts. The mounted font
editor changes the journey theme, so catalog font selection and owned theme
creation remain with journey appearance. There is no per-block font URL or font
family setter. Media selection, cover replacement, image/video zoom and focal
controls remain with the media owner. Existing media and Host fields survive
presentation changes. Expanded layout rejects Cards containing Video, including
when an inverse would restore that layout. Hidden Icon sizes/colors and deprecated
icon choices remain unchanged unless a mounted field is deliberately replaced.

Each creation supplies a unique lowercase key, up to 32 letters/digits/underscores,
and the server returns its ID in idMap. Button creation also returns
`key.startIcon` and `key.endIcon`. A later command in the batch can use `$key` as
its blockId or placement anchor. Repeated insertions after the same anchor keep
their declared order. At most 200 distinct changed/new blocks are accepted per batch,
including required children and sibling order changes. Oversize expansion rejects
before acceptance. The shared decoded-input and command limits still apply.

Each explicit persisted field can be requested only once in a batch, including a
no-op value and references through a local key or owned Icon slot. Disjoint fields
on one block remain valid. Creation claims its explicitly supplied fields; omitted
server defaults and derived sibling placement do not count as duplicate requests.
New duplicate saves reject before acceptance without content, revision, history,
receipt, audit or effect changes. Retained legacy sequential inverse descriptors
remain safely reversible; they cannot enable a new duplicate request.

Buttons always create both owned Icons and their references in the same
transaction. The first Button on a Card with TextResponse or Multiselect and no
submit control derives the submit role; subsequent Buttons are ordinary.
Standalone content duplication clears submit, while whole-Step duplication keeps
the original role. No independent submitEnabled setter is exposed. Structural
duplicate commands remain owned by the structure slice.

Sparse inverses restore only changed mounted fields and required slot references.
Unknown settings and later unrelated fields, tracking, Host and routes survive.
Creation history records the server-created group and soft-deletes/restores the
same IDs. Later changes to a created child, new descendants, new actions or outside
references conflict atomically instead of being erased. Chat edits and their
inverses require the current flag; the owning participant rechecks it immediately
before acceptance. Firebase identity/flag initialization occurs before the owning
content transaction, and the final check reads the SDK's current local flag state.

The first response returns the persisted receipt. This matters because PostgreSQL
JSONB orders idMap keys differently from insertion order; initial delivery and
replay must hash the same private result before release.

Reproduce the slice checks with
`MCP_EDITS_TEST_ISSUE=10556 node tools/scripts/test-mcp-edits.mjs`. This uses
`auth_issue_10556`, `journeys_issue_10556`, a restricted auth login, actual local
OAuth/MCP HTTP/Hive/Journeys PostgreSQL participants, and controlled Firebase
identity, eligibility and Card-chat flag adapters. It does not qualify normal
Admin browser interaction, live Firebase/LaunchDarkly, containers, AWS or real
Claude/ChatGPT clients. Those remain deferred feature checks.

Deploy compatible shared command contracts, MCP and Journeys participants with
edits disabled, then enable after their automated checks pass. Older binaries
cannot restore the new descriptors; drain or positively fence accepted work and
keep new edit admission off before any binary rollback. Preserve retained history,
receipts and replay markers.

Implements #10553 under PRD #10157. This extends the existing signed data relay
through MCP, api-auth, Hive gateway and api-journeys. It adds `journey_edit` and
`journey_operation_get`. The first command is `typography_set` on an existing
Typography block in an ordinary draft. Its optional fields are plain `content`,
whole-block `variant`, `align` and hex RGB `color`. Empty text is valid. Unknown
fields, arbitrary settings, Host fields, raw GraphQL and other command names are
rejected. A batch cannot supply the same field on the same block twice, even
when one assignment is a no-op. Disjoint fields on one block are allowed.
Existing IDs, legacy fields and unrelated settings survive.

Apply the generated Journeys migration and the existing shared-revision migration
before enabling `MCP_EDITS_ENABLED=true` in api-journeys. The setting defaults to
false. Keep the distinct service credentials and restricted network paths in
[GRANTED_READS.md](GRANTED_READS.md). Tokens require `journeys:edit` plus the current
connection's edit mode for edits. Historical lookup still requires current
read authority. Disabling new edits must not discard accepted-key evidence or
prevent authorized recovery of a committed result.

## Save, replay and recovery

The shared executable registry in `libs/yoga/src/mcp/editContract.ts` defines input,
validation, the actual patch, inverse fields and fixtures. Later capabilities must
extend that registry with their own owning checks, dependencies, effects and tests.
They cannot bypass the atomic save by forwarding independent GraphQL mutations.

Gate capture precedes authoritative rights reads. The owning participant checks
current ACLs, then obtains final acceptance from the coordinator before opening
the content transaction. Acceptance checks the current grant, gate generations,
Firebase eligibility and database clock. The content transaction locks its durable
execution record, the connection's operation namespace and the journey, then
rechecks the execution fence, namespace, current ACLs, ordinary-draft state and
expected shared revision. A competing Admin save or publication during the HTTP
round trip can complete; the later local checks reject a stale or published edit.
Recovery can fence an accepted executor before it obtains its local lock. Supported
permission changes close admissions and drain accepted work before their owning
mutation. No content transaction waits for coordinator HTTP, and no coordinator
transaction waits for an owning database or a provider.

Content, shared revision, operation marker, historical receipt, inverse and durable
effect record commit in one owning transaction. Provider calls do not belong in
that transaction. Typography has no provider dispatch or attachment. Its effect
record states that the local content change was recorded; it does not claim an
external effect occurred or can be reversed. Future media commands must provide
their own dispatch/attachment participants and provider reconciliation evidence.

An operation key belongs to the verified user, client and stable logical
connection, and binds the canonical payload, including the journey and expected
revision. Concurrent duplicates serialize against that namespace. Exact retry
returns the original receipt and IDs after fresh authorization. The receipt's
committed revision is historical. Read again to learn the current journey state.
A different payload fails. A stale or rejected new edit saves no content, history
or effect. Never use a new key to escape an uncertain response.

Execution and recovery acquire the same durable owner row lock. Recovery either
observes its committed outcome or records a terminal fence before reporting that
executor stopped. Timeout, missing response, process age and absent receipt are
not settlement evidence. Withdrawal remains Pending while an accepted save can
still commit. A bounded action finally accepted before consent expiry may finish
after it, while subsequent result disclosure needs a new check. Buffered MCP
output uses its own accepted release permit and guarded sender settlement.

## Retention and cleanup

Detailed receipts expire 30 days after the original completion time. Replay and
renewal do not slide that cutoff. Minimal accepted-key/fingerprint records remain
for the logical connection's lifetime, independently of result details and inverse
payloads. An expired or evicted result never becomes another execution.

History retains at most five batches per connection and journey. Its separate
natural-expiry window ends 30 days after consent expiry. Resource removal retains
inaccessible eligible history. Whole disconnect drains accepted work, then purges
reversible payloads. The owner acknowledges the durable disconnect purge only after its cleanup transaction commits. Account retirement removes private results and recovery
payloads after authority closes. The owning cleanup retains a permanent retired
namespace tombstone before deleting accepted-key details. It does not delete saved
journey content or media, affect another user, reopen authority or restart work.

Security audits use the existing identity-owned 90-day expiry, independently of
result and inverse retention. Events contain typed actions, identifiers, timestamp
and outcome. Content, prompts, files, credentials and raw errors are excluded.
Cleanup is retryable; uncertain accepted actions retain their reconciliation state.

## Read pages

Content pages contain at most 100 objects and 512 KiB of serialized structured
output, including metadata and continuation cursor. A page may contain fewer than
100 objects to satisfy the byte limit. A single object exceeding the bound fails
without silently skipping it. Continue with the returned signed cursor. Cursors
bind identity, logical connection and grant version, filters, resource and shared
revision. If content changes, restart after `REVISION_CONFLICT`. Omitted fields
and an incomplete subtree are never a whole-journey replacement document.

## Local checks

Use isolated `auth_issue_10553` and `journeys_issue_10553` PostgreSQL databases.
`node tools/scripts/test-mcp-edits.mjs` creates these databases, generates clients, applies migrations and grants, and runs the full-path suite. Override `MCP_EDITS_TEST_POSTGRES_URL` for a different loopback PostgreSQL port. Apply normal Prisma migrations with the migration role, then apply the auth
runtime grants to a restricted login. Do not use the shared local `journeys`
database. The checks use synthetic content and declared controlled Firebase
identity/eligibility adapters, alongside the actual OAuth/HTTP/gateway/owning
participants and real PostgreSQL transactions.

Saved edit integration tests run through `vitest.edits.config.mts`, rather than
the default auth config used by the read/issuer coverage route. The edit runner
provides their separate databases and rejects skipped tests.

The runner also executes the shared command/credential and read-page tests. It
collects owning-service and shared-module coverage in
`coverage/integration/mcp-edits`, separately from workspace and shard reports.
It fails if any required test skips or an owning/shared module has no execution
hits. CI preserves the test counts and reports as artifacts and uploads the
repository-relative Cobertura report to Codecov for the checked-out PR head.

```sh
EDITS_TEST_AUTH_DATABASE_URL="$ISSUE_AUTH_RUNTIME_URL" \
EDITS_TEST_JOURNEYS_DATABASE_URL="$ISSUE_JOURNEYS_URL" \
pnpm exec vitest run --config apis/api-auth/vitest.edits.config.mts
```

These checks do not establish normal Admin browser behavior, live Firebase,
container hosting, AWS deployment or Claude/ChatGPT compatibility. Those checks
remain on the assembled feature's acceptance checklist. This slice exposes no
Step deletion, route edit or media-provider command; their capability owners must
supply their own command and provider evidence when extending this registry.

## Persistent undo and redo

Issue #10562 adds `journey_history`, `journey_undo` and `journey_redo` for the
registered Typography family. History belongs to the verified logical connection
and journey, independently of chats, MCP replicas, owner restarts and renewed
grant versions. The list exposes at most five safe labels and stable entry/operation
IDs, the current revision and the next entry in each direction. It never exposes
inverse payloads. View only can list eligible entries but cannot move the cursor.
Published journeys cannot use history tools.

Undo/redo inputs contain only journeyId, expectedRevision, entryId and an
idempotencyKey. Reuse the exact payload after an uncertain response, including the
original revision. Accepted keys share the edit namespace and bind the tool name
for history actions, so undo cannot become redo under the same key. Fresh authority
is required even for replay and for buffered private results. Rejected actions
consume no key or capacity. Result expiry never authorizes another transition.

One saved batch is one entry. Undo reverses its command order; redo applies the
forward order, with projected state for repeated targets. The owning transaction
checks every recorded affected field and the same live Card/Step IDs before any
write. A refreshed inverse preserves unrelated text, settings, layout, Host and
route work. A changed affected field or required parent returns HISTORY_CONFLICT.
Missing, expired, evicted or unsupported inverse descriptors return
HISTORY_UNAVAILABLE. No old operation is rerun to reconstruct history.

The cursor, content, shared revision, receipt, local effect and minimal owning audit
commit together. New successful saves delete the redo tail and evict the oldest
payload beyond five entries. Replay and rejected/rolled-back saves leave it alone.
No-op saves accept their key and clear redo, but add no inverse or provider effect.
McpEditAudit retains operation IDs and typed action names for 90 days, independently
of 30-day detailed results and the history stack. Inverse eviction never deletes
accepted-key markers. Audit expiry never moves the cursor.

Existing connection history generations implement the exact post-consent 30-day
renewal cutoff. Eligible early or late renewal keeps the generation; renewal at or
after the cutoff advances it. Listing/restoration filter by that generation,
without using the inverse row's original deadline as a new timer. Resource removal,
View only and role loss preserve inaccessible entries; restoring access requires
current rights and an explicitly covering active grant. Whole disconnect closes
access, drains accepted participants, then requests and acknowledges payload purge.
The namespace lock and permanent retirement prevent a final accepted inverse from
reappearing. Account retirement cleans private history/results through the existing
lifecycle; these participants never delete content or image/video assets.

Apply both additive #10562 migrations before deploying the new owner binary.
Deploy compatible command-contract participants together and leave
MCP_EDITS_ENABLED=false until migrations and authority/gateway/owner/MCP are ready.
Descriptors from an older binary without recorded parent IDs are explicitly
unavailable rather than guessing structural history. Rollback must stop new
admission, drain/fence accepted actions and retain schema/replay markers. Never
resume an older writer against a stack that contains undone entries.

Run this issue's isolated local route with:

```sh
MCP_EDITS_TEST_ISSUE=10562 node tools/scripts/test-mcp-edits.mjs
```

This uses auth_issue_10562 and journeys_issue_10562 on loopback PostgreSQL with
controlled Firebase identity/eligibility adapters, actual OAuth/MCP HTTP/Hive/owning
transactions and generated migrations. It does not qualify Admin browser behavior,
real Firebase/providers, containers, AWS or real Claude/ChatGPT clients. Step deletion,
route repair and media attachment are future command families; their handlers must
extend the closed descriptor planner and executable registry with their own stable
IDs, dependency/conflict checks, effect summaries and full-path tests. Typography
undo restores content fields and truthfully reports that it has no external media
provider effect to reverse.
