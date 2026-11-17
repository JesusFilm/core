# Personal connections and renewal

Implements [#10574](https://github.com/JesusFilm/core/issues/10574), under PRD [#10157](https://github.com/JesusFilm/core/issues/10157). Admin's personal menu opens `/agents`. The owner sees the OAuth client ID, logical connection ID, selected journeys, mode, status and exact stored UTC expiry. Journey titles require current Admin access. An inaccessible journey displays only its grant identifier. Disconnected connections and pending authorization changes cannot be renewed.

## Browser and approval boundaries

The page uses normal Admin server-session authentication, verification and terms routing. Issuer requests require a fresh, verified Firebase token and the configured exact Admin origin. `POST /connections` returns at most 100 owner connections, a cursor and CSRF value, and creates a signed, HttpOnly, SameSite Strict management cookie valid for ten minutes. Keep Admin and issuer on the same browser site, including the same loopback hostname locally. Responses and Admin pages prohibit caching. The cookie binds the user, original Firebase sign-in and account creation identity; possession of an MCP token or connection ID gives no management access.

`POST /connections/:id/review` requires the cookie, matching CSRF value, OAuth client ID and expected connection version. It accepts only day/week/month/year durations. Its single-use review is bound to that session, owner, client, connection and version for one minute. No request accepts a client-supplied expiry, journey selection or mode change. A new list request replaces the management session, so another tab or refresh can invalidate an older review. Refresh the list and review again on conflicts.

Review shows the server's absolute **if-approved-now** deadline and warns when the chosen duration shortens consent. Approval time cannot be predicted exactly before the request and database locks finish. `POST /connections/:id/approve` therefore computes the authoritative expiry from database `clock_timestamp()` after final locks, plus the approved duration. The approval receipt and refreshed list display that exact deadline. Review time and the prior expiry are never the start of the new period. Calendar months and years use the existing UTC month-end/leap-year clamping rules.

Before the authoritative permission read, capture stable account, connection, journey and direct-membership gates. An initial eligibility read discovers teams only; capture team/membership generations, discard that read's permissions, and read eligibility again. A changed ownership relationship requires another review. Acquire gates in code-point order, then the connection, then the review. No remote identity, gateway or provider call runs inside this transaction. After waits, reject closed/changed gates, a stale version, account replacement, expired management/review state or terminal disconnect. Natural consent expiry permits explicit renewal, but gives no data authority while expired.

Approval atomically creates a replacement OAuth grant, deletes the old grant/code/access/refresh artifacts, advances the existing connection version and gate generation, records approval/expiry and marks credentials pending. It retains the same connection ID, user/client, mode and selected journey IDs. Pending authorization withdrawal cannot be cancelled by renewal. Accepted read/output permits retain their original identity and require positive executor settlement; renewal never treats their age as proof of completion. New protected output requires current authorization.

## Reconnect after renewal

Restart connection authorization from the agent. The normal consent page offers **Reconnect connection** only for that verified owner/client's active connections. Select the matching connection ID, review its unchanged resources/mode and exact stored expiry, and approve. Server-side binding and expected-version checks repeat at review and final approval. An abandoned callback or expired authorization code can repeat this flow on the same connection. The OAuth callback issues fresh credentials for the same logical connection. It does not renew consent again. Creating a separate connection instead creates a separate identity and cannot inherit the first connection's history.

Renewal updates only consent/credential state and adds minimal audit events. It does not reset read permits, usage counters, completed-result/audit timestamps or job state, and does not touch saved content or media. Persistent edit/history participants do not exist in this slice. Their owners must verify the retained-history cutoff, cleanup races and exact historical replay against this stable connection identity before enabling those capabilities.

Access changes and explicit disconnect are implemented by #10575. See [WITHDRAWAL.md](WITHDRAWAL.md) for owner approval, durable Pending/Complete changes, real read/output participants and recovery. They share `AgentConnection.version`, gate generations and the deterministic lock order, and close admission before draining accepted participants.

## Reproduce local verification

Use the setup in [README.md](README.md) with separate auth and journeys databases named for this issue. Apply both additive auth migrations and repeat [grants.sql](../../libs/prisma/auth/grants.sql) before starting the new service, including the new `AgentRenewalReview` table. Startup requires its runtime DML grants. Generate the auth client with `pnpm exec nx prisma-generate prisma-auth`. Supply Admin's `AUTH_ISSUER` and start the normal local services. No AWS resource is required.

For automated protocol tests, use two disposable auth databases such as `auth_issue_10574` and `auth_issue_10574_reads`, both with restricted runtime roles and the auth migrations applied. Set `AUTH_TEST_DATABASE_URL` to the first and `READS_TEST_AUTH_DATABASE_URL` to the second. Set `READS_TEST_JOURNEYS_DATABASE_URL` to an isolated `journeys_issue_10574` database with the existing schema; the read harness installs the existing shared-revision triggers if absent. Never point these tests at shared or real data. The suites clear their fixtures, and separate databases prevent parallel suites from deleting one another's state.

```sh
pnpm exec vitest run --config apis/api-auth/vitest.config.mts
pnpm exec vitest run --root apps/journeys-admin --config "$PWD/apps/journeys-admin/vitest.config.mts" src/components/ConnectedAgents src/components/AgentConsent --coverage=false
```

The HTTP suite exercises real issuer replicas and isolated PostgreSQL, with declared controlled Firebase identity and consent-eligibility adapters. The granted-read suite additionally exercises actual MCP HTTP, restricted issuer exchange, Hive gateway and the owning Journeys handler/database before expiry and after renewal/reconnection. It tests denial after current owning-service rights removal. These are local application/protocol checks. They do not qualify a normal Admin browser, live Firebase, AWS deployment or real Claude/ChatGPT sessions.

## Deferred feature checks

Normal Admin browser checks with two approved Firebase accounts remain unexecuted here. Verify personal navigation, owner versus another user/team-manager isolation, all four durations, early/expired renewal, shortening warnings, stale tabs, CSRF/cookie behavior, logout and fresh reconnect through the agent. Verify disabled/deleted/recreated accounts and Firebase revocation through supported account-management paths. Docker image qualification, persistent history/replay/cutoff integration, assembled withdrawal races and actual Claude/ChatGPT transcripts remain with the relevant feature/release owners. No unexecuted check is claimed as passed, and no stage/main/production promotion is performed.
