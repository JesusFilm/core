# Saved draft edits

## Journey metadata, appearance and menus

`appearanceCommandRegistry` in `libs/yoga/src/mcp/appearanceContract.ts` registers
every enabled command below and extends the shared `commandRegistry`. Each row
records its mounted controls, schema, owner, role/grant/feature checks, source
checks, complete write set, effects, inverse, fixtures and automated/deferred
evidence. The appearance contract suite requires all ten entries.

Language changes resolve the exact target ID through the existing trusted gateway
catalog client before acceptance, outside owning locks. The locked write must
match that validated target. Unknown IDs and catalog failures leave content,
revision and history unchanged. Undo/redo validates the restored language, while
exact replay returns its retained receipt without another catalog lookup.

Issue #10561 extends `journey_edit` with the following mounted controls. All use
the existing Admin rights, edit grant, ordinary-draft, revision, exact-replay and
private-output checks. Undo and redo recheck current rights and feature gates.

| Command                                                    | Owned fields and behavior                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `journey_details_set`                                      | Required nonempty title, nullable description and language ID. Omitted fields are retained.                                                                                                                                                                                                                                                      |
| `journey_social_set`                                       | Social title and description, bounded to 49 and 179 characters. Empty text clears them.                                                                                                                                                                                                                                                          |
| `journey_fonts_set`                                        | Header/body/label choices from the corresponding Admin font catalogs. Creates an owned theme when absent; otherwise patches only requested fonts.                                                                                                                                                                                                |
| `journey_appearance_set`                                   | Website mode under `websiteMode`, nullable display title, website menu icon, and flow-mode share/like/dislike reaction switches. Null display title restores the social-title fallback; empty text hides it.                                                                                                                                     |
| `menu_create`                                              | In website mode under `websiteMode`, creates one Step, one dark/base Card, heading, subheading and three actionless Buttons. Returns all seven IDs and sets the journey menu reference. The batch key supports 32 characters; descendant receipt keys use `.card`, `.heading`, `.subheading` and `.button1`, `.button2` and `.button3` suffixes. |
| `menu_remove`                                              | Resolves the current owned menu, soft-deletes its complete subtree, clears its reference and reports surviving inbound links.                                                                                                                                                                                                                    |
| `chat_button_add`, `chat_button_set`, `chat_button_remove` | Owned platform/link rows, at most two. Uses the mounted platform enum, nullable clears and safe HTTP/email/phone/SMS link normalization. Template customization is preserved and cannot be set.                                                                                                                                                  |
| `tracking_set`                                             | Card, Button, RadioOption and inline Video event labels under `editJourneyTrackingMetrics`; Video also supports an end label. Explicit null clears a label.                                                                                                                                                                                      |

`card_slug_set` writes the owning Step's website slug, with current website
eligibility and journey-scoped uniqueness. `media_slot_set` and `media_slot_clear`
reuse #10559's owned logo/social-image participants. `card_chat_set` remains owned
by Card presentation under `aiChatEditor`. Card starters belong to #10555.

The font catalogs come from `libs/shared/ui/src/libs/fontFamilies/fontFamilies.ts`.
The menu recipe follows Admin's `MenuActionButton`. Generic Journey palettes,
visibility fields without mounted writers, creator/template/lifecycle settings,
Host profiles and assignments, public slugs/domains, sharing administration,
analytics, visitor data and integration credentials remain excluded. The share
reaction configures player presentation only.

History stores affected journey fields and owned theme/chat rows. It restores the
same IDs, checks complete rows before entity removal, and preserves later changes
to unrelated fields. A child-write failure rolls the gesture, revision, receipt,
history and effect record back together. Successful library assets are retained.

Run `node tools/scripts/test-mcp-appearance.mjs` for isolated issue 10561 PostgreSQL
setup and the OAuth/MCP/gateway/Journeys integration suite. Only identity, selection,
feature flags and explicit fault hooks are controlled. Required tests cannot skip.
Its dedicated `coverage/integration/mcp-appearance` report includes executed owning
and shared modules and uploads separately in the `appearance` CI job. Admin
GraphQL assertions are automated; browser rendering, private playback and real
client qualification remain deferred to the assembled feature.

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
fields, arbitrary settings, Host fields, raw GraphQL and unregistered commands are
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
remain on the assembled feature's acceptance checklist. The structural participant
below extends the same transaction. Media-provider commands remain unavailable.

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
real Firebase/providers, containers, AWS or real Claude/ChatGPT clients. Media
attachment remains a future command family requiring its own closed descriptor,
dependency/conflict checks, effect summaries and full-path tests. Typography
undo restores content fields and truthfully reports that it has no external media
provider effect to reverse.

## Steps, structure and navigation

Issue #10557 adds the owning structural participant. The strict schemas and
command metadata live in `libs/yoga/src/mcp/structureContract.ts`; the owner plans
the whole batch before acceptance in `mcpStructure.ts`. These commands share the
same authority, ordinary-draft, revision, replay, history and private-output gates
as Typography edits. Structural history checks recorded affected state and current
dependencies before restoring anything.

Supported content and presentation commands can accompany structural commands
in one save. For example, relabel a Button and change its action destination in
the same batch. The owner projects every command before acceptance and commits
one revision, receipt and reversible history entry. Local references, overlap
checks, current feature gates and the combined 200-object limit apply to the
whole batch. Undo and redo preserve later unrelated presentation and settings.

| Command                                                          | Saved gesture                                                                 |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `step_add`                                                       | One Step, its Card and ordered typed content, with required Button icons      |
| `block_add`                                                      | Typography, Button, Spacer or empty Image/Video inside an owned Card          |
| `step_duplicate`, `block_duplicate`                              | Copy descendants with new owned IDs and complete reference mapping            |
| `step_remove`, `block_remove`                                    | Soft-delete the requested subtree and record its inverse                      |
| `steps_reorder`, `content_reorder`                               | Validate and order the complete live sibling set; Step order determines start |
| `step_default_set`, `action_set`                                 | Change only the specified continuation or action                              |
| `step_position_set`, `social_position_set`, `graph_auto_arrange` | Persist graph coordinates, using Admin layout behavior for arrangement        |
| `card_slug_set`                                                  | Normalize or clear a Step's website Card slug and enforce uniqueness          |

References are exactly `{id}` or `{local}`. Creation keys are unique lowercase
letters, digits and underscores, up to 32 characters. The reserved object key
`__proto__` is rejected before acceptance. IDs are allocated before
resolving local references, including a destination declared later in the batch.
Placements are `end`, or `before`/`after` with an actual same-parent anchor.
Multiple insertions at an anchor preserve declared order. Receipts contain local
`idMap` and source-to-copy `duplicateIdMap` mappings. `duplicateMaps` contains
complete `{sourceId, blockId}` entries per local copy key, including when the same
source is copied several times. Opaque source IDs remain values in these entries.

Step copies clear their default continuation and retain authorized action
destinations according to Admin's source rules. Standalone Video duplication is
unavailable; a whole-Step copy may include Video and preserved legacy descendants.
Standalone submit Button copies become ordinary Buttons. Host state is preserved.
This slice does not create poll/response families or acquire/attach media sources;
existing synthetic poll/response content exercises routing and structural copies.

Actions are whole subtype replacements: None, Step, external link, email, chat,
phone or SMS. Unrelated tracking fields survive. Submit Buttons allow only None
or Step. New destinations must be live Steps in the same authorized journey.
Default continuations must target a different Step, including through local
references. Explicit null still clears an existing continuation.
Unsafe navigation schemes and hidden owner/Host fields reject the entire batch.
Duplicate writes to one field or route, duplicate keys, invalid placements and
overlapping destructive gestures also reject without a partial save.

Deleting a Step leaves incoming default/action rows unchanged, including their
timestamps. The protected receipt reports those `affectedLinks`; reads identify
owned deleted destinations as unresolved. Unrelated edits remain valid. Proposing
a repair performs no write. Apply only requested or accepted repairs as explicit
route commands, either in a separate save or atomically with deletion. Delete-only
undo restores the same descendant IDs without touching incoming routes. A combined
inverse checks its recorded route values, so a later human route edit rejects the
whole undo instead of being overwritten. Redo of a removal compares every recorded
block field and the complete action state, including absence, inside the restored
subtree. Newer edits there reject with HISTORY_CONFLICT before changing content or
the history cursor; edits outside that subtree remain independent. Older removal
descriptors without action snapshots return HISTORY_UNAVAILABLE for redo rather
than hiding potentially newer work.

The save bound is 50 commands, 20 new Steps and 200 affected content objects,
including required descendants and duplicate/delete expansion. Oversized complete
gestures fail without partial effects. Structural restoration has no external
upload, generation or provider effect to reverse; successful media assets remain.

Run the actual OAuth/MCP HTTP/Hive/owning-PostgreSQL structural tests with:

```sh
node tools/scripts/test-mcp-structure.mjs
MCP_EDITS_TEST_ISSUE=10557 node tools/scripts/test-mcp-edits.mjs
# Content/presentation review fixes can run structural regressions in their own databases.
MCP_STRUCTURE_TEST_ISSUE=10556 node tools/scripts/test-mcp-structure.mjs
```

Both routes use issue-specific loopback PostgreSQL databases and restricted auth
runtime grants. Firebase identity and eligibility are controlled test adapters.
The structural suite also exercises normal Admin delete/restore mutations after
MCP deletion and the existing issuer HTTP, replica and storage-failure cases in a
separate isolated auth database. It collects owning-service and shared-module coverage and test counts
in `coverage/integration/mcp-structure`, separately from the saved-edit and workspace
reports. The runner rejects skipped tests and missing execution hits in structural
planning, history and Admin deletion/restoration modules. CI uploads both integration
reports to Codecov alongside the standard workspace reports for stacked PRs.
Normal Admin browser flows, real Firebase, host/container qualification, AWS and
Claude/ChatGPT checks remain deferred to the assembled feature. Promote code and
migrations, never these synthetic identities, credentials or local data.

## Polls, response fields and form destinations

Issue #10558 extends the same owning transaction and structural history participant.
Structural `block_add` and `step_add` accept `poll`, `multiselect` and `response`
content. Poll and multiselect options supply unique batch-local keys and labels.
Multiselect starts with at least two options. Responses and multiselects create
one shared submit Button and two distinct owned Icons when their Card lacks one.
The generated Button is returned as `<field-key>.submit` and accepts only None
or Step navigation. Existing legacy SignUp supports edits, never creation.

`poll_set`, the `poll_option_*` and `multiselect_option_*` commands,
`multiselect_set` and `options_reorder` preserve untouched option IDs and routes.
Deleting the final option is valid. Deletion clamps each nonnull bound in the
same saved batch and inverse, preserving null bounds. Explicit invalid bounds
reject the whole batch. Option images follow their owned subtree on removal;
media source selection belongs to the separate media participant.
The named Add-option gesture keeps the editor's 12-option limit. Existing larger
questions remain editable, and generic duplication retains its existing behavior.
Undo can restore recorded legacy bounds while rejecting a restoration that would
invalidate later human bounds it did not record.

`response_set` preserves omitted fields and clears nullable fields on null.
An explicit `responseType` resets the label using the supplied Admin `locale`,
defaulting to English, unless the command supplies a replacement label. Changing
to freeForm or phone clears both destination references. The mounted field limit
is 250 characters and rows are null or 1 through 4. `signup_set` and
`signup_icon_set` edit only the existing legacy submit label and owned icon.

Read `journey_read` with `view: form_destinations` for current safe integration IDs
and route names. No credential fields or visitor responses are returned.
`form_destination_set` accepts an existing integration ID and optional route ID,
or null to clear. Switching integration clears an omitted route. Only name/email
responses can select destinations. The owner checks current team membership,
actual journey team ownership, Growth Spaces availability and route membership
after owning locks, on forward writes and restoration. Integration rows remain
locked against local replacement/deletion until commit. Provider route GETs are
bounded and fail closed. Configuration creates no submissions, deliveries or syncs.

Run the isolated PostgreSQL route with:

```sh
MCP_STRUCTURE_TEST_ISSUE=10558 node tools/scripts/test-mcp-structure.mjs
```

The suite executes actual OAuth, MCP HTTP, gateway, owning transactions, replay
and undo/redo. Firebase identity is controlled. A loopback Growth Spaces adapter
serves routes and controlled revocations; production credential decryption and
route fetching execute against it. No real provider delivery is attempted.
Coverage and test counts go to `coverage/integration/mcp-forms`, separately from
other suites, and CI uploads that report to Codecov. The runner rejects missing
execution coverage and skipped tests. Browser inspection, real Firebase/provider
qualification, host/container checks and Claude/ChatGPT remain deferred feature
checks. Local results do not establish deployment or release acceptance.
