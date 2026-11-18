# Saved draft edits

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

Gate capture precedes authoritative rights reads. The owning participant locks
its durable execution record, the connection's operation namespace and the journey
before checking current ACLs, ordinary-draft state and the expected shared revision.
The existing coordinator finally accepts the exact request after those waits,
using its current grant, gate generations, Firebase eligibility and database clock.
No coordinator transaction waits for an owning database or a provider.

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
