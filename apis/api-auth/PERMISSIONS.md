# Permission changes and account retirement

Implements #10550 under PRD #10157, acceptance cases A1, A2, A10, A14, A20 and A21 for the enabled read and private-output participants. Current Admin rights and the original active connection grant must both allow each action. Restoring an Admin role changes no grant, expiry, credential, retention deadline, usage counter or job state. Disconnected or retired authority remains terminal. Ready public media URLs retain their existing delivery behavior.

## Required configuration

Apply the additive auth and Journeys migrations and generate both clients. The auth runtime needs the updated [grants.sql](../../libs/prisma/auth/grants.sql). The Journeys runtime needs SELECT, INSERT, UPDATE and DELETE on `McpPermissionExecution` in addition to its existing tables.

When granted reads are configured, api-auth requires `AUTH_PERMISSION_JOURNEYS_SECRET` and `AUTH_PERMISSION_USERS_SECRET`. They must differ from each other and the introspection, exchange and read-owner credentials. Set the matching Journeys credential as `MCP_PERMISSION_AUTHORITY_SECRET` and use the existing `MCP_READ_AUTHORITY_URL` issuer origin. The Journeys process and anonymous-cleanup worker require these settings when `MCP_READS_ENABLED=true`. A configured participant keeps coordinating when local reads are disabled, so a write-only replica cannot bypass other readers.

Set `MCP_READS_ENABLED=true`, `MCP_ACCOUNT_AUTHORITY_URL` to the issuer origin, and `MCP_ACCOUNT_AUTHORITY_SECRET` to the users credential in api-users. Startup rejects invalid enable flags and incomplete lifecycle configuration. All participating services must be configured before enabling the assembled feature. Keep the users and Journeys coordination credentials out of api-mcp and the gateway. Use private service networking and HTTPS outside local loopback. No runtime receives migration authority.

## Cooperative changes

The explicit `coordinatedPermissionMutations` inventory in [mcpPermissions.ts](../api-journeys/src/lib/mcpPermissions.ts) covers team role/removal, team invitation acceptance, collaborator approval/promotion/removal, journey invitation acceptance, anonymous ownership/team transfer, journey lifecycle/template changes, profile eligibility and the existing Journeys account-deletion mutation. The anonymous-cleanup worker also participates before deleting journeys, memberships or empty teams. Its committed receipt preserves the existing shortlink/media follow-up IDs for recovery; this adds no cleanup to the account-deletion path. A continuation also binds the original SQL user-projection ID and Firebase creation identity, so a recreated projection cannot inherit an old cleanup cycle. Invite requests and opened timestamps confer no access and do not require withdrawal. Ordinary human content edits retain their existing Admin roles and require no MCP grant.

The wrapper checks the current actor and existing ACL before submitting a change. It stores a UUID, exact intent hash, minimal typed mutation arguments, actor identity/creation/revocation evidence, and affected stable gate IDs in the owning database. Credentials, content snapshots and raw errors are excluded. It then calls the service-authenticated auth coordinator:

- `POST /internal/permissions/begin` accepts `changeId`, `gateIds` and `intentHash`. The authenticated service identifies the owner. Exact retries preserve the same intent; changed arguments or a foreign service fail.
- Resource sets above 1,000 gates use pages of at most 250 sorted unique gate IDs. Every page also supplies `page: { offset, gateCount, gateIdsHash }`, where the hash fingerprints the complete sorted resource set. Auth persists this manifest with the change and closes each received page at new generations. During an interrupted upload the durable state is `collecting`, exposed as Pending. Status and completion cannot advance it until every page arrives and the complete hash matches. Recovery resends the original pages under the same change ID, including any page whose response was lost. Repeated pages do not advance generations. There is one owner mutation and receipt for the complete resource set, with no independently executable chunks.
- `POST /internal/permissions/status` accepts `changeId` and returns Pending, Ready, Failed or Complete.
- `POST /internal/permissions/complete` accepts `changeId` and a positive owner outcome, `committed` or `cancelled`. A failed/cancelled owner transaction leaves gates closed and records Failed. It does not report Complete or restore the old ACL.

Auth locks gate IDs in lexical order and closes them at new generations before any rights mutation. It cancels preparations and drains every matching accepted read/output permit. A prepared request has no final authority. No remote service call occurs inside an auth transaction. A timeout, old lease, missing receipt or stopped MCP replica cannot settle an accepted owning executor.

Page ingestion and receipt handling first serialize on the change ID, then acquire gate locks. Database operations use batches of 250 gates. Final manifest acceptance checks all earlier closed generations and drains the complete set; only then can the owner execute. Apply the additive `permission_resource_pages` auth migration before these services start, and deploy compatible auth before Journeys begins submitting large manifests. Existing single-request changes retain their exact retry format.

Journeys rechecks the current Firebase actor, creation/revocation identity, current roles, caller ACL and actual ownership. Under a serializable transaction it locks the owner execution row, then sorted teams and journeys, checks the resource set again, runs the existing resolver and commits the receipt with the actual mutation. Existing nested Prisma transactions join this transaction. The wrapper changes no GraphQL operation or Admin role.

Active identical intents reuse the same change ID across replicas, so retrying a Pending removal cannot queue a second deletion against a removed membership. Even empty invitation discovery closes a stable requester account gate and rechecks the resource set before any upsert.

If accepted work remains, GraphQL returns `PERMISSION_CHANGE_PENDING` with the durable change ID. Gates stay closed. Startup and periodic reconciliation apply the persisted mutation through its real allowlisted resolver after the work drains. Recovery generates only that single allowlisted operation, never a saved arbitrary GraphQL document. A crash after commit retries receipt reporting without repeating the mutation. Auth reopens eligible gates at a new generation only after the owning receipt. An ACL read paused across a completed close/reopen cannot accept against those newer generations, even if the rights have since returned.

Failed owner changes remain closed and visible in both databases. Investigate `McpPermissionExecution` and `PermissionChange` by change ID. `retryFailed(changeId, expectedIntentHash)` is an internal owning-service recovery operation. It takes the same owner row lock, requires the exact intent, rechecks current actor/ACL/state and applies the original requested mutation. It never reopens authority merely because time passed. Do not edit gate rows or discard unresolved permits to clear Pending. Failed entries are isolated so they do not starve later pages of reconciliation.

## Existing account deletion

The Journeys deletion entrypoint keeps its existing delete/transfer/remove classification for exclusive and shared journeys/teams. It coordinates all affected account, journey and team gates and records its receipt. The users deletion subscription keeps its existing authorization and write-first deletion audit. Before removing the User row or any Firebase identity, it calls the users-authenticated `POST /internal/permissions/retire-account` with the exact Firebase UID.

Retirement stores a permanent `RetiredAccount` tombstone, closes the account gate and terminally disconnects every connection owned by that identity. A pending access change is superseded by disconnect without falsely marking that earlier request Complete. Accepted participants must settle before retirement returns Complete. If authority is unavailable or Pending, the destructive deletion stops and a later retry resumes against durable state. A recreated account cannot inherit the retired authority.

Normal self-deletion cannot retire or delete another UID found through an email fallback. Only an authorized superAdmin may explicitly reconcile a different identity. The exact reconciled UID must retire before its deletion too. Other users' connections and shared ownership outcomes remain intact.

Whole disconnect creates durable `ConnectionHistoryPurge` intents after draining. No inverse/result/job payload participant exists in this slice. Their owning tickets must register cleanup/reconciliation, consume and acknowledge these intents, and prove their actual executor fences before enabling those capabilities. Retirement currently means the enabled authority participants have drained, not that future payload cleanup ran. Minimal security audit events retain their original 90-day deadlines. Account deletion adds no image/video cleanup or asset deletion.

## External eligibility and maintenance boundary

Auth calls Firebase `getUser` afresh before new authority acceptance. Disabled/deleted accounts, unverified or missing email, creation-identity mismatch and sign-in revocation deny; Firebase failure also denies. Independent OAuth credentials do not become Firebase refresh tokens. Revocation detection depends on current Firebase account/session evidence, not cached JWT verification alone.

There is no existing backend account-disable or token-revocation command in this repository. The current Firebase `updateUser` entrypoint only verifies an email. For maintenance that needs the cooperative guarantee today, an authorized users-service operator must retire the exact MCP identity, wait for Complete, and only then perform the external account/storage change. This is terminal MCP retirement. Re-enabling the Firebase account does not restore those connections.

Unexpected Firebase Console, privileged direct-SQL or other non-cooperating changes cannot be atomically fenced by this protocol. Fresh checks deny the change when observed. An external change can race a prior successful eligibility read, so do not claim an atomic Pending/Complete boundary for it. Reversible disable/re-enable maintenance would need its own durable users participant before promising that behavior.

## Local verification

Use normal local PostgreSQL at `localhost:5432` with separate `auth_issue_10550`, `auth_issue_10550_reads`, `auth_issue_10550_permissions`, `journeys_issue_10550` and `users_issue_10550` databases. Never reset or migrate the shared journeys database. Run `prisma migrate dev` for new schema changes with the explicit per-issue URL, and `prisma migrate deploy` for the other fixture databases. Auth test URLs must use restricted DML runtime roles; the migration URL is separate. Keep the coordinator database separate from the issuer HTTP fixtures, which reset their tables at startup. No credentials or fixture data belong in the repository.

Export these local URLs and run:

```sh
# Restricted auth role for the first database; migration role used by fault tests.
export AUTH_TEST_DATABASE_URL="$ISSUE_AUTH_RUNTIME_URL"
export AUTH_TEST_MIGRATION_DATABASE_URL="$ISSUE_AUTH_MIGRATION_URL"
export PERMISSIONS_TEST_DATABASE_URL="$ISSUE_PERMISSION_AUTH_RUNTIME_URL"
export READS_TEST_AUTH_DATABASE_URL="$ISSUE_READ_AUTH_RUNTIME_URL"
export READS_TEST_JOURNEYS_DATABASE_URL="$ISSUE_JOURNEYS_URL"
export READS_TEST_USERS_DATABASE_URL="$ISSUE_USERS_URL"
pnpm exec vitest run --config apis/api-auth/vitest.config.mts
pnpm exec vitest run --root apis/api-journeys --config "$PWD/apis/api-journeys/vitest.config.mts" src/lib/mcpPermissions.spec.ts src/workers/anonymousJourneyCleanup --coverage=false
pnpm exec vitest run --root apis/api-users --config "$PWD/apis/api-users/vitest.config.mts" src/schema/userDelete/service --coverage=false
```

The full-path harness uses real MCP HTTP, OAuth issuer/exchange, Hive gateway, owning Journeys GraphQL mutation/read handlers, the existing users deletion subscription, and isolated SQL databases. Firebase identity and human request identity are declared controlled adapters. Provider failures and acceptance barriers are controlled. These are local protocol/application checks. No AWS, normal browser or live Firebase acceptance is implied.

## Deferred feature checks

Under the authorized initial feature buildout policy, normal Admin browser/Firebase flows, real disable/delete/recreation/revocation observations, host container qualification, assembled-service configuration and Claude/ChatGPT staging transcripts remain unexecuted. The designated operations/release owners must complete them before final release. Later write/history/media participants must prove their actual cleanup and fences when implemented. Local automated checks cannot complete those release cases, and no main, stage or production promotion is authorized here.
