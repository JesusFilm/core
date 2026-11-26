# Journeys MCP operations

Implements the local artifact phase of [#10564](https://github.com/JesusFilm/core/issues/10564) under [#10157](https://github.com/JesusFilm/core/issues/10157). These instructions target the assembled feature on AWS stage without a production merge. They do not establish that AWS, ingress, live providers or clients have passed qualification. [#10583](https://github.com/JesusFilm/core/issues/10583) supplies the AWS deployment route; [#10565](https://github.com/JesusFilm/core/issues/10565) owns the complete registry and final client/release gate.

## Local checks

From the repository root, with Node 24, pnpm and an isolated local PostgreSQL server:

```sh
node tools/scripts/test-mcp-operations.mjs
VITEST_MAX_WORKERS=1 node tools/scripts/test-mcp-video-upload.mjs
pnpm exec vitest run --config apis/api-mcp/vitest.config.mts
node tools/scripts/mcp-release.mjs tools/scripts/mcp-operations.stage.example.json
```

`MCP_OPERATIONS_TEST_POSTGRES_URL` defaults to the local postgres/postgres server. The runner creates randomly suffixed `*_issue_10564_*` databases and a restricted auth role, replays committed migrations, applies `libs/prisma/auth/grants.sql`, runs the owning HTTP/database suite with coverage and removes only its own databases/role. It rejects remote database hosts, failed tests, required skips, missing owning execution hits and non-relative Cobertura paths. Reports go to `coverage/integration/mcp-operations`, independently of other projects/shards. The workflow uploads that report for the checked-out PR head. Firebase, storage and provider adapters in the integration fixture are controlled; OAuth, gates, MCP HTTP, gateway, owning service code and PostgreSQL are real.

Run video qualification separately on the same checkout with its current parent integrated. The operations suite covers image uploads and operational controls; it does not execute the video suite. The video runner exercises both exact 1,000,000,000-byte ingress paths, staged reads, Mux transfer, cancellation and recovery. It requires local PostgreSQL through `MCP_UPLOAD_TEST_POSTGRES_URL`, uses isolated `*_issue_10554*` databases and writes its own report to `coverage/integration/mcp-video-upload`. Record each suite's tested head, parent, pass/fail/skip counts and coverage separately. A passing operations report does not clear a failing video run.

The existing runtime suite checks two child processes, round-robin protocol requests, abrupt replacement, graceful drain, hard transport deadlines, dependency failures and redacted logs. Owning integration tests exercise exact upload bounds, provider uncertainty, lost responses, recovery and successful-asset retention. Passing these checks establishes local behavior only. An elapsed deadline or dead transport does not establish that an owning executor stopped.

## Shared operational controls

Provision a new random `AUTH_OPERATIONS_SECRET` only to auth and the operator's protected environment. Auth refuses to enable nonlocal data access without it. It must differ from exchange, introspection, owning-service and permission credentials. Do not give it to MCP, Admin, agents or a browser. An ingress rule must restrict `/internal/operations` to the approved operator network. The endpoint additionally requires the configured issuer Host, no browser Origin and the operator credential. It offers aggregate counts only, without journey, connection, file or prompt data. It cannot grant access, accept work or report executor fences.

Load `AUTH_ISSUER` and `AUTH_OPERATIONS_SECRET` from the approved secret manager into the operator environment. Keep shell tracing disabled. The command never accepts a secret on its command line or prints raw error bodies. Query status first:

```sh
node tools/scripts/mcp-operations.mjs status
```

To change a control, pass its returned generation. For example, if effects is currently generation 7:

```sh
node tools/scripts/mcp-operations.mjs set effects false 7
```

A stale generation returns a failure. Refresh status and decide again; do not retry an old enable command blindly. Both stop and reopen advance the durable generation. The auth database is authoritative across replicas and replacement. No task restart or environment toggle reopens a closed durable gate.

| Control                       | Stops new final acceptance of                                                                    | Work already accepted                                                                                                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `admission=false`             | Exchanges, owning reads/saves/history, media admission/transfer/actions and final private output | Bounded participants can finish. Later output, attachment and dispatch need new acceptance.                               |
| `effects=false`               | Image/video/generation provider dispatch, including queued work in a replacement worker          | Accepted dispatch follows ordinary settlement/reconciliation. Reads, ordinary edits and upload transfer remain available. |
| `MCP_ADMISSION_ENABLED=false` | Transport requests to that MCP task even if ingress ignores readiness                            | Existing bounded requests follow drain/settlement rules. It does not control another replica or a backend worker.         |
| Ingress deny rule             | New external MCP requests at the route                                                           | Does not cancel queued/provider work or recall released bytes.                                                            |

Final acceptance checks the captured operational generation under the same locks as the grant and current expiry checks. A prepared permit from before close/reopen fails. Permits created by old code without operational generations also fail new final acceptance. The switches never rewrite accepted permits, completed receipts, usage, history, withdrawal or provider state. Cancellation and withdrawal still require settlement or positive fencing.

For a complete stop, close effects, close admission, deny the external MCP route, verify every replica's settings, then drain/replace tasks through the approved deployment route. Retain auth and owner reconciliation workers and their protected service connectivity. Keep Admin connection management/disconnect available under its own normal authorization. Dependency outage means fail closed; readiness alone is insufficient. The status count is an observation of auth's accepted permits, not proof that every external effect has finished. Also inspect media's durable `McpMediaExecution` and `McpMediaJob` states through the restricted owner/operator route.

## Reconciliation and escalation

| Durable owner | Work and evidence                                                                                                                                                                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| api-auth      | `ConnectionChange`, account/permission gates, accepted `ReadPermit` and permanent executor fences. Reconcile only after every accepted participant settles or has positive stop evidence.                                                                 |
| api-journeys  | `McpReadExecution` and `McpEditExecution` receipts. Acquire the same execution lock to observe a committed receipt or persist a fence before reporting to auth. Exact replay returns an authorized historical receipt without a second save/history step. |
| api-mcp       | Buffered output sender. Socket closure fences only that guarded sender. A process killed before reporting can leave auth Pending.                                                                                                                         |
| api-media     | `McpMediaExecution` for staging, dispatch and output; `McpMediaJob` for the shared image/video/generation pipeline. Reconcile through authoritative storage/provider status and executor identity.                                                        |

Do not settle by editing a status row, lease expiry, readiness, timeout, disappearance from a load balancer or a missing provider response. For an orphaned MCP sender, correlate `mcp_output_executor_started.executorId` and `processId` with its exact task/process. Positively prove that executor stopped before a matching service identity reports `/internal/reads/fence`. An MCP fence cannot settle a Journeys or media executor. If task identity is unavailable or ambiguous, keep Pending and escalate to the service owner.

Media uses boot/PID namespace/start-time identity locally and recorded ECS task identity for AWS STOPPED verification. `ecs:DescribeTasks` failure, a remote namespace or an unreadable process supplies no positive proof. Provider work can outlive the task. Unknown upload allocation/dispatch remains active until authenticated provider status or a proven pre-send fence resolves it. Do not allocate another provider job or clear shared usage. Generations and exact keys survive task replacement. Generation observation escalates to `reconciling` at its configured bound and exposes `escalateAfter`; video uncertainty also stays reconcilable rather than timing out to success. Record the job/receipt identifier and fixed outcome category in the incident record, without its prompt, source, file or raw provider error. Escalate provider uncertainty to the media on-call owner; reopen effects only after reviewing all unsent and uncertain work.

## Cleanup and redaction

Each durable task has one owning service. Multiple replicas retry that service's idempotent work against the same durable intent/row locks; do not install a second cross-service cleanup scheduler.

| State                              | Owner and retention                                                                                                                                                                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Minimal security audit             | api-auth `SecurityAudit`. Identifiers, typed action, occurrence time and outcome only. Expiry is exactly occurrence plus 90 days, independently of use/renewal. Startup and periodic cleanup delete expired rows.                                                                          |
| Completed journey results          | api-journeys, 30 days from completion; retain accepted-key markers for the connection namespace. Inverse/history cleanup has its own grant/history rules.                                                                                                                                  |
| Completed media results            | api-media, 30 days from completion; preserve reconciliation evidence, accepted-key protection, ready library assets and shared quotas as required.                                                                                                                                         |
| Disconnect/account private cleanup | Auth creates durable withdrawal/history-purge intents; owning services acknowledge only after cleanup commits. Account deletion adds no image/video deletion.                                                                                                                              |
| Incomplete transfer objects        | api-media owns the immutable original one-hour cutoff and safe cleanup. Do not add a blanket S3 object TTL that can delete unresolved or successfully transferred processing input. Multipart-abort lifecycle can target abandoned uncommitted multipart uploads only after qualification. |

CloudWatch, Datadog, export stores and backups must be inventoried explicitly. Configure MCP-specific telemetry/security-audit sinks at the declared 90-day policy without changing unrelated logs. CloudWatch retention is not proof of exact occurrence-based security-audit expiry in every copy. Keep durable security audit only in stores with occurrence-based deletion; if a secondary sink contains audit records, qualify its per-event deletion at the same cutoff or stop exporting audit records there. Telemetry remains a fixed allowlist of event/status/duration/counters and executor correlation. Never enable request/response/header, text/prompt/file, token, URL query or raw exception logging for MCP routes.

On restore, keep admissions/effects and ingress closed. Run owner expiry/retirement reconciliation before reads can serve restored state, restore revoked gates/retired namespaces, then repeat current-rights and negative smoke checks. Restoring a backup must never reopen access, extend retention, redispatch a job or discard unknown work. Observe cleanup failures through the fixed `cleanup_unavailable`, `withdrawal_reconciliation_pending`, `output_settlement_pending` and owner receipt/backlog counters. Alert on stale pending changes, reconciling provider jobs, failed cleanup, rejected operational commands and unavailable dependencies. Alert destination/delivery remains a deployed check.

## Stage assembly and previous-digest rollback

Copy `tools/scripts/mcp-operations.stage.example.json` to a protected release evidence directory. Every value in the committed example is synthetic. Populate the complete actual component revisions, ECR manifest digests, Admin/viewer revisions, database migration-set commit IDs, explicit previous-version readable migration sets, environment origins, IAM role ARNs, SSM parameter ARNs, storage and sink inventory. Do not put secret values, tokens, user data or private source metadata in a manifest. SSM aliases here name separate task injections; corresponding issuer/caller credentials are wired by the deployment owner, without duplicating secret values in artifacts.

```sh
node tools/scripts/mcp-release.mjs "$MCP_CANDIDATE_MANIFEST"
node tools/scripts/mcp-release.mjs "$MCP_CANDIDATE_MANIFEST" "$MCP_PREVIOUS_MANIFEST"
```

The second command checks a rollback and prints previous digests while retaining the installed database versions and closed gates. A declaration of readable migrations needs migration/recovery test evidence; the tool cannot prove deployed compatibility. It rejects cross-environment or incompatible rollback and never rolls a database backward. It does not publish images, update ECS, manipulate routes or deploy Admin. Use #10583's approved stage route once available, passing this pinned feature commit and digest set explicitly. Do not substitute a default `main`/production deployment. Stage can redeploy later feature/client fixes before any production merge.

1. Record current and previous compatible task definitions, image digests, app revisions and migration sets. Retain previous images/task definitions for the rollback window. Build MCP and auth independently of Hive publication. Publish schemas for actual subgraphs only.
2. Verify actual stage/prod DNS, TLS, issuer/audience, Firebase projects and separate databases. Task execution roles read exact SSM SecureString/KMS resources at task start. Deployment roles can update only approved stage services/pass only their task roles. MCP's runtime role has no database, Firebase admin, signing keys, general interop or provider credentials. Auth owns its keys/database. Media alone gets the required prefix-scoped private storage and provider credentials. Inspect actual IAM policies and security groups; role-name validation is insufficient.
3. Keep ingress denied and gates closed throughout migration/private-reader/revision-writer rollout. Disable older MCP readers/writers and remove incompatible tasks from service before enabling access. Include Admin, public viewer/cache, gateway, users, Journeys/media owners and auth in the version record. Warmed private caches and old writers must not bypass protections. Flush incompatible cached private data through the owning route.
4. Apply forward compatible migrations with the migration role, reapply runtime grants, rotate injected secrets with task replacement and deploy at least two replicas by digest. Preserve Host and path; restrict internal service/operator routes, configure private encrypted temporary storage and egress. Verify the measured request/drain/deregistration/task-stop budgets. The manifest's bounds are hypotheses until measured at ingress.
5. Through a restricted synthetic smoke route, verify metadata issuer/audience, current-rights plus operation/resource grant, ordinary-draft save/replay/history, media dispatch/recovery and private output. Include signed-out, wrong user/client/audience/environment, revoked/expired grant and published-draft denials. Use normal Admin for human publication. Never use a public URL or guest fallback as smoke authority.
6. Exercise independent stops with accepted work, two replicas, replacement, SIGTERM, abrupt stop, owner/coordinator/provider outages and pending recovery. Record authoritative receipts/fences. Reopening admission is a separate generation-checked action after reviewing pending work. Reopening effects can resume eligible queued work; review that queue first.
7. On failure, retain both durable stops and deny ingress. Select the recorded previous compatible digest/app set using the validator. Reapply that set through the same approved stage route, without changing database migrations. Wait for stable tasks and inspect actual digests; rerun authenticated positive/negative smoke and recovery checks before separately reopening gates/ingress. A failed smoke leaves access closed.

## Deferred feature checks

Record evidence by tested commit and manifest, date, operator, command/job, pass/fail counts and sanitized receipt/task identifiers. Retain failures and subsequent reruns. The following remain unexecuted until real environment qualification:

- #10583 provisioning/deployment route, actual IAM/SSM/KMS/security groups/egress, DNS/TLS/issuer separation, private bucket policies and recorded registry/task digests.
- Assembled Admin/gateway/owning-service/database migration compatibility, old reader/writer exclusion, warmed-cache/private-preview checks and normal human Manage-only Publish.
- Real ingress limits/timers/stream behavior, two ECS replicas, rolling replacement/drain/abrupt stop, dependency/coordination outages and cross-service pending recovery.
- Live Cloudflare/Mux dispatch, callbacks, provider-unknown escalation and positive stop evidence; reconcile accepted effects across independent stops.
- All telemetry/audit copies, exact occurrence-based 90-day deletion, retry/restore cleanup, actual alert delivery, key rotation and owner incident response.
- Deployment of a known digest, previous-digest rollback and authenticated positive/negative smoke through AWS ingress.
- Complete registry rerun and actual ChatGPT/Claude sessions, including same-job Admin upload, private preview, human Publish and client-fix redeployment, owned by #10565.
