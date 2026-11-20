# Granted journey reads

Implements #10573 under PRD #10157. This document covers `journeys_list`, `journey_read` and `journey_preview`. Reads support ordinary draft and published journeys under both current Admin rights and the connection's selected resources. The shared relay also supports the [saved Typography edit and operation lookup](SAVED_EDITS.md) from #10553. Source discovery, media and undo/redo tools remain unavailable.

## Service configuration

Keep each service's environment separate. Supply secrets at runtime. The MCP launcher admits only its `MCP_*` settings, so gateway and owning-service secrets deliberately have other prefixes.

| Process      | Settings                                                                                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| api-auth     | Existing issuer/database/Firebase configuration, plus `AUTH_EXCHANGE_CLIENT_SECRET`, `AUTH_READ_OWNER_SECRET`, `AUTH_READ_GATEWAY_AUDIENCE`, `AUTH_PERMISSION_JOURNEYS_SECRET`, `AUTH_PERMISSION_USERS_SECRET`                       |
| api-mcp      | `MCP_AUTH_MODE=granted-reads`, `MCP_PUBLIC_URL`, `MCP_ISSUER_URL`, `MCP_GATEWAY_URL`, `MCP_EXCHANGE_CLIENT_SECRET`                                                                                                                   |
| api-gateway  | `MCP_READS_ENABLED=true`, `MCP_READ_ISSUER`, `MCP_READ_GATEWAY_AUDIENCE`, `MCP_READ_ENVIRONMENT`, `MCP_READ_PUBLIC_KEY`, `MCP_READ_OWNER_URL`, `GATEWAY_MCP_INTERNAL_SECRET`                                                         |
| api-journeys | The same public issuer/audience/environment/key and enable setting, plus `MCP_READ_AUTHORITY_URL`, `JOURNEYS_MCP_INTERNAL_SECRET`, `JOURNEYS_MCP_AUTHORITY_SECRET`, `MCP_PERMISSION_AUTHORITY_SECRET`, existing `JOURNEYS_ADMIN_URL` |

`AUTH_READ_GATEWAY_AUDIENCE` is a distinct internal audience, for example `http://127.0.0.1:4000/mcp/reads`. It must equal both APIs' `MCP_READ_GATEWAY_AUDIENCE`; the external OAuth resource remains `AUTH_AUDIENCE`, matching `MCP_PUBLIC_URL`. `MCP_READ_PUBLIC_KEY` is the public RSA JWK corresponding to the issuer's RSA signing key. Never provide private signing material to MCP, gateway or Journeys. Owner and authority URLs are respectively the exact `/mcp/reads` endpoint and the issuer origin. Outside loopback, use HTTPS and private service networking.

The shared contract has an explicit Node ES-module scope inside Yoga. Its module-only `package.json` is excluded from pnpm workspace and Nx project inference; its code remains part of the Yoga library and caller checks.

Configure the users retirement participant and distinct permission-change credentials described in [PERMISSIONS.md](../api-auth/PERMISSIONS.md) before enabling reads. These are required in addition to the read credentials.

Use three different read service credentials. The exchange secret matches MCP's exchange secret. The owner secret matches `JOURNEYS_MCP_AUTHORITY_SECRET`. The gateway internal secret matches `JOURNEYS_MCP_INTERNAL_SECRET`. None is a Firebase/interop credential. Apply the generated additive auth migration and rerun `libs/prisma/auth/grants.sql` for the runtime role before starting the new issuer. The issuer rejects incomplete configurations and database roles missing `ReadPermit` permissions.

The external token is opaque, issued through the existing OAuth consent/PKCE flow. Exchange validates that token's subject, client, resource audience, scope and current durable grant, then issues a separate signed credential lasting at most 60 seconds. That credential binds the exact typed request, user, connection/version, resources, mode, environment and gateway audience. MCP cannot select another user. Gateway verifies the credential and signs the internal request body. The owning service verifies both signatures. These credentials cannot execute arbitrary GraphQL, federation entities, batches, mutations or public fallback paths. Analytics retains its existing Bearer authentication.

## Acceptance and output

The owner resolves resource teams, captures stable account/connection/journey/team and user-membership gate generations, then locks journeys in ascending ID order. It reads authoritative ACLs, lifecycle state, accepted terms and the shared revision in a repeatable-read transaction. The coordinator locks gate IDs in lexical order, then the connection, then the permit. It checks current Firebase eligibility before that transaction and checks matching generations, grant/version/resources/mode and authoritative `clock_timestamp()` after lock waits. No coordinator transaction waits for an owner or external service.

Each accepted bounded read has a durable `ReadPermit`, including its real owner or MCP executor boot UUID. MCP logs its boot UUID at startup; deployment/recovery must preserve the mapping needed for positive process fencing. The owner acknowledges settlement only after its read transaction succeeds. A lost response leaves an unresolved permit. There is no lease, timeout or absent-receipt rule that declares an accepted executor stopped. These reads change no owning content/history/effect state; mutation receipts remain with the write participant. Before MCP releases its bounded response, the owner repeats the current checks and verifies that a fresh authorized page has the buffered data's hash. The output permit additionally binds the exact response hash and MCP boot UUID. MCP acknowledges only once its socket closes, after the guarded sender can no longer release more bytes, including when acceptance returns after the close. A bounded action accepted before expiry may settle later; every later output acceptance must still be current.

Connection withdrawal and coordinated account/ACL changes remain owned by #10575 and #10550. Those participants must close the named gates, advance generations, and include accepted read/output permits in Pending until they settle or their executor is positively fenced. Accepted permits are never removed by timed cleanup. Unaccepted preparations expire after a day; settled permits and security audits expire after 90 days. This slice does not implement connection-management or recovery UI. Direct SQL/Firebase Console changes cannot provide the coordinated Pending/Complete guarantee; subsequent current checks deny observed loss of authority.

Every successful read page and expected tool-error result includes `contractVersion: "1"` in `structuredContent`, independently of the MCP transport version. The owning service includes this field before applying the 512 KiB structured-result bound and computing the data hash checked at output acceptance. MCP rejects missing or unsupported result versions from the owner.

Invalid tool arguments return the same versioned `VALIDATION_FAILED` envelope with the tool's fixed JSON Schema in `fieldRules`. Rejected values and unknown field names are never echoed, and no read is admitted. Malformed MCP messages and unknown tools or methods remain protocol errors on both supported profiles.

Read pages contain at most 100 content objects, explicit Step selection caps at 20, list limits default to 20 and cap at 50, query text caps at 200 characters, and structured results cap at 512 KiB. Signed cursors bind user, connection/version, filters, resource and shared revision. Changed revisions return `REVISION_CONFLICT`. Foreign block references are cleared; unrelated memberships, analytics tokens, source credentials and form destinations are omitted. Settings include the current Host's display fields without exposing a Host mutation. Omitted/unmodeled fields have preservation warnings. Ready image/video URLs keep their existing public delivery behavior. No asset creation or cleanup occurs.

## Local verification

Use isolated `auth_issue_10573*` and `journeys_issue_10573*` databases. Deploy auth migrations with its migration role, grant the restricted runtime role the listed table permissions, and initialize the Journeys test database from its current Prisma schema. The test installs the existing shared-revision migration's real triggers when absent. It rejects database names outside this issue's namespace.

```sh
READS_TEST_AUTH_DATABASE_URL="$ISSUE_AUTH_RUNTIME_URL" \
READS_TEST_JOURNEYS_DATABASE_URL="$ISSUE_JOURNEYS_URL" \
pnpm exec vitest run --config apis/api-auth/vitest.config.mts apis/api-auth/test/grantedReads.spec.ts
```

The suite uses actual OAuth authorization codes and token issuance for separate Alice/Bob identities, the actual MCP HTTP runtime, Hive gateway and the production owning-service read handler over HTTP, real Prisma/PostgreSQL and the shared Admin revision triggers. Firebase identity and consent-eligibility lookup are declared controlled adapters. Generic GraphQL resolver execution is unnecessary for the closed read relay; direct/entity/batch requests with restricted credentials are separately rejected. Local results are not normal Admin browser, live Firebase, AWS or Claude/ChatGPT evidence. Those remain with their existing owners.

## Private preview and human publication

Issue #10563 adds `journey_preview` under the same View or Edit grant as reads.
Pass an authorized `journeyId`, the saved `expectedRevision` and optionally an
owned `startStepId`. The bounded route checklist and Admin playback/editor links
use the real owning read and final MCP output participants. A buffered preview
result needs fresh rights, matching gate generations, grant state and expiry.
Withdrawal counts its accepted reader and sender until positive settlement.
A preview locator carries no credential. Opening it checks the human's current
Admin session and rights independently of the connection grant.

Admin serves `/journeys/<id>/preview` through request-time authentication and
an uncached owning-service check. Page props contain no journey or Apollo cache.
The client fetches current saved content with `no-cache`; denied reads cannot
hydrate warmed content. Legacy `/api/preview?slug=...` locators resolve current
Admin access and redirect to this private route. There is no public-viewer fallback.
Playback uses the shared Conductor or website shell in `preview` mode. Branches,
forms, media and the existing Host render; visitor events, analytics, submissions,
chat and external actions are disabled. Known public media files stay public.
Publish is offered in the ordinary editor only after a current Manage check.
The ordinary publication mutation independently enforces that right and uses the
existing permission coordinator and shared database publication/revision fence.
MCP has no Publish operation.

Run the real MCP/auth/gateway/owning-service coverage route locally without
running every UI workspace during iteration:

```sh
MCP_READS_TEST_POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/postgres \
  pnpm exec tsx apis/api-auth/test/runCoverage.ts --preview
```

It creates uniquely named issue 10563 logical databases and a restricted runtime
role, migrates them, runs every Auth integration test without required skips and
verifies owning-service execution hits. Default invocation still collects every
workspace for CI. Add `--ready` to run the foreground Phoebe ready gate against
those same isolated dependencies. Reports retain their existing separate project
locations; do not replace other shards' reports.

The browser cases are in
`apps/journeys-admin-e2e/src/e2e/agents/private-preview.spec.ts`. They use normal
Firebase sign-in and real Admin/gateway/Journeys endpoints. They require three
synthetic accounts in an approved development project or supported emulator.
`admin` is the manager, `admin2` is a journey-only Editor and `admin3` has no
access. Set the normal `PLAYWRIGHT_EMAIL/PASSWORD` pairs for those accounts.
No fixed test identity header is browser evidence.

Create the synthetic content in a fresh local database:

```sh
PRIVATE_PREVIEW_TEST_POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/postgres \
PRIVATE_PREVIEW_MANAGER_UID=<manager-firebase-uid> \
PRIVATE_PREVIEW_EDITOR_UID=<editor-firebase-uid> \
PRIVATE_PREVIEW_STRANGER_UID=<stranger-firebase-uid> \
  pnpm exec tsx apis/api-journeys/test/seedPrivatePreview.ts
```

The seed accepts loopback PostgreSQL only and prints its new database name and
two journey IDs. Point local Journeys at that database, use normal local gateway,
Users, identity and Admin configuration, and point the viewer at the same backend.
Set `PRIVATE_PREVIEW_JOURNEY_ID`, `PRIVATE_PREVIEW_WEBSITE_ID` from the output and
`PRIVATE_PREVIEW_PUBLIC_URL` to the first journey's public slug on that viewer.
With Admin running on `http://localhost:4200`:

```sh
cd apps/journeys-admin-e2e
pnpm exec playwright test src/e2e/agents/private-preview.spec.ts --grep @manual --workers=1
```

These tests publish the first synthetic draft. Reseed for another run. Dispose
only the printed fixture database after stopping its local services. The cases
cover branch playback, form/external-effect suppression, page and serialized-data
denial after warming, website routes, Editor/stranger denial and normal human
Manage publication. The backend suites separately exercise direct-invocation
rejection and publication fencing. Record media-player, identity, browser and
assembled delayed edit/history/attachment observations with the final release
owner after all participants are integrated. Local automated evidence does not
claim staging, AWS, Claude or ChatGPT acceptance. The final gate reruns the same
browser cases against compatible staging services and records deployed versions.
