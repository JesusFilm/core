# Connection access changes and withdrawal

Implements #10575 under PRD #10157, acceptance cases A1, A10, A14, A20 and A21 for the existing read and private-output participants. Connected agents at `/agents` offers owner-approved journey/mode changes and disconnect. Access changes retain the logical connection ID and absolute expiry. The approval rotates OAuth credentials, so reconnect from the agent to obtain credentials for the changed grant. Removed journeys and View only retain eligible history identity. Whole disconnect permanently retires the identity and schedules history purge after draining. Saved content and successful media are untouched.

## Owner management

All management uses the existing Firebase-backed Admin sign-in, exact configured Origin, signed HttpOnly management cookie, CSRF and expected `AgentConnection.version`. Team management confers no ownership of another person's connection. Refresh the list after a stale request or changed browser session. During an owning-API outage, listing repeats the current identity check and returns owner grant metadata with all journey titles hidden. This preserves access to disconnect without allowing a journey-data read or expansion.

- `POST /connections/:id/access-options` returns current eligible journeys. Discovery obtains resource/ownership IDs, then captures gates before the authoritative permission read.
- `POST /connections/:id/access-review` accepts only `csrf`, `clientId`, `expectedVersion`, `journeyIds` and `mode`. Its one-minute, single-use token binds the server's canonical selection to the owner/client/connection/version/session. Replacing a review invalidates its predecessor. Expansions require current rights at review and approval; forged approval selection/expiry fields fail validation.
- `POST /connections/:id/access-approve` accepts only the management binding and review token. It rechecks expansion permissions and matching generations. Pure reductions and disconnect need current identity eligibility but do not depend on the owning API's availability or on retaining removed rights.
- `POST /connections/:id/disconnect` accepts only the management binding. The UI requires explicit confirmation. OAuth whole-grant revocation uses the same durable withdrawal coordinator.

Approval first locks gates in sorted ID order, then the connection and review rows. In one auth transaction it closes the connection gate, advances its generation/version, stores `ConnectionChange` with the intended mutation and cancels prepared permits. Disconnect also retires credentials and sets terminal `revokedAt`. While Pending, this implementation conservatively blocks the whole changed connection. Other connections retain their grants and gates. Renewal/reconnect cannot pass that closed gate or cancel the withdrawal.

`ConnectionChange.status` is authoritative. It remains Pending until every accepted registered permit settles or has positive fencing evidence. Auth startup, periodic maintenance, settlement and owner listing retry completion. Reconciliation scans pages by change ID and isolates failed rows, so unresolved older changes cannot starve unrelated connections. Completion applies the access grant and reopens it at a new generation, or keeps disconnect terminal and atomically creates `ConnectionHistoryPurge`. Both mutations are auth-owned, so there is no remote mutation between these commits. Neither operation changes expiry, original session evidence, retained operation identity, audit deadlines, usage or jobs. A retry with the old version fails instead of repeating the mutation.

## Real participants and recovery

The only enabled data-bearing stages are `read` at Journeys and `output` at MCP. Both register durable exact `ReadPermit` rows before authoritative rights reads and condition acceptance on matching current gates/state after all locks. Current database `clock_timestamp()` governs expiry; admission and queue time give no grace. Accepted rows never expire as a substitute for settlement.

The lock order in auth is sorted gates, connection, request executor, then permit. Fencing locks executor then permits and releases that transaction before reconciling connection gates. No auth transaction waits for a remote API/provider or owning database.

Journeys persists `McpReadExecution` before running a read and holds its row lock through the owning transaction, current ACL/state checks, exact snapshot and authority acceptance. The transaction stores its completion receipt. Recovery acquires that same row lock: either it observes completion, or it durably fences the execution before a delayed transaction can run. It then reports the per-request Journeys executor fence to auth. A lost report leaves the receipt unreported for retry on startup or periodic reconciliation. Recovery scans all unreported pages, isolates individual failures and prevents overlapping periodic passes. A timeout alone proves nothing; acquiring the execution lock and recording the terminal fence supplies the evidence.

MCP has a separate executor identity for each HTTP request. Logs record `mcp_output_executor_started` with that request executor ID and its process ID for operational correlation. Its response stays buffered until the owning service rechecks rights, the exact data hash and final output acceptance. The sender checks the abort/socket state before releasing bytes. A socket-close callback permanently stops that guarded sender and reports its executor fence; this can precede a delayed prepare/accept. Auth persists the fence even when the permit does not exist yet and serializes later registration/acceptance against it. Report failures are retried while the process remains alive. Metadata-only and failed-authentication requests never report or persist a sender fence. Closure before output authorization prevents that authorization from starting. A closed MCP sender cannot settle a Journeys executor. An accepted bounded output may release after withdrawal starts, keeping it Pending until the sender settles. Bytes already handed to the OS/network remain outside recall.

`POST /internal/reads/fence` is service-authenticated, never browser/MCP bearer authenticated. Only the matching participant may report `{executorId, executor}` after positive local stop evidence. The executor is an exact guarded request, not a lease or a process heartbeat. Unknown executor outcomes after a process dies remain Pending. Operators must positively verify termination of that specific sender before reporting its fence through the matching service identity. Do not infer this from request timeout, lease expiry, Kubernetes/ECS status of another executor, or a restarted MCP replica. Keep these records for reconciliation rather than deleting accepted rows to unblock a change.

Future write, preview and media stages must register their real owning participant and settlement/fence evidence with this drain before being enabled. A queued job is not an accepted action. Provider dispatch, attachment and private result retrieval each need fresh checks. They must not reuse the read executor fence as proof that a write or external provider stopped.

## Local verification and setup

Apply the additive auth and journeys migrations, generate the Prisma clients, and repeat auth runtime [grants.sql](../../libs/prisma/auth/grants.sql). The Journeys runtime needs DML on `McpReadExecution`. Follow the existing local service configuration in [README.md](README.md) and [GRANTED_READS.md](../api-mcp/GRANTED_READS.md). No AWS provisioning is needed. Use isolated `auth_issue_10575`, `auth_issue_10575_reads` and `journeys_issue_10575` databases on the normal local PostgreSQL service. Never use the shared `journeys` database.

Set `AUTH_TEST_DATABASE_URL` to a restricted role on the first auth database, `AUTH_TEST_MIGRATION_DATABASE_URL` to its local migration role, `READS_TEST_AUTH_DATABASE_URL` to the second restricted auth database and `READS_TEST_JOURNEYS_DATABASE_URL` to the isolated Journeys database. Then run:

```sh
pnpm exec vitest run --config apis/api-auth/vitest.config.mts
pnpm exec vitest run --config apis/api-mcp/vitest.config.mts src/reads.spec.ts src/runtime.spec.ts
pnpm exec vitest run --root apps/journeys-admin --config "$PWD/apps/journeys-admin/vitest.config.mts" src/components/ConnectedAgents --coverage=false
```

The full-path suite runs actual MCP HTTP, issuer/OAuth exchange, Hive gateway, owning Journeys handler and both databases with synthetic data. Firebase authentication/eligibility are declared controlled adapters. Its authority proxy injects network barriers and report failures while forwarding the real service requests. Smaller issuer tests cover process replacement, versions, owner/session/CSRF binding, review replacement, cross-session approval, expiry after the access-review row lock wait, stale membership generations, more than 100 unresolved changes and per-row failure isolation. A separate real MCP child process is killed while its accepted Journeys read remains paused; the change stays Pending until the surviving owning executor positively settles. These are local checks, not live Firebase, AWS or real-client evidence.

### Reproducible CI coverage

The [MCP read coverage workflow](../../.github/workflows/mcp-read-coverage.yml) runs on relevant pull requests, including stacked bases. Its disposable PostgreSQL service supplies an administrator URL to a command that creates three randomly named issue databases and a restricted auth runtime role, replays the complete committed migration histories and applies the production auth grants. Reproduce it against a local test PostgreSQL server with database/role creation rights:

```sh
DISABLE_ERD=true pnpm exec nx run-many -t prisma-generate --all
MCP_READS_TEST_POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/postgres pnpm exec nx run api-auth:test-coverage
```

The command removes only the databases and role it created, including after test failure. It supplies every database variable required by the issuer and full-path suites, rejects skipped tests, and verifies execution hits in the owning receipt reconciler and read handler. The receipt test crosses 100 pending rows, fails one authenticated fence report, checks that later rows report successfully, and retries the retained row. No live Firebase/provider credentials are used.

Auth's V8 configuration collects imported sources outside its workspace, so the real Journeys execution is present in `coverage/apis/api-auth/cobertura-coverage.xml` and `coverage-final.json`. The workflow retains those reports and the test JSON as an artifact, then uploads Cobertura to Codecov with the `apps.api-auth` flag. Codecov merges these owning-source hits with the ordinary project reports for the same commit. No coverage thresholds or source exclusions are relaxed. Child-process execution is not claimed as covered by the parent Vitest collector.

## Deferred feature checks

Normal Admin browser/Firebase cases remain unexecuted: use two approved accounts to verify owner versus team-manager isolation, selection review, View only downgrade/upgrade, lost rights, stale tabs, CSRF/logout and Pending/Complete refresh through real connection/reconnection flows. Verify disable/delete/recreation/revocation through supported account paths when #10550 joins the coordinator. Host container qualification, assembled service configuration, AWS operation and Claude/ChatGPT staging transcripts remain with their designated owners. Browser QA was not requested in this coding run.

History and result payloads do not exist in this slice. #10553/#10562 and the private-result owners must consume the durable disconnect purge intent, erase all inverse/result payloads including a final accepted write, and acknowledge `completedAt`. They must verify retained removed-journey history, limits/cutoffs and no resurrection after reconnect. Account deletion integration belongs to #10550 and introduces no media cleanup. These unexecuted checks remain required before final release. The parent #10574 renewal-deadline review decision is unchanged and remains unresolved.
