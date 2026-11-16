# Agent sign-in and consent

Implements first approval in [#10549](https://github.com/JesusFilm/core/issues/10549), under [#10157](https://github.com/JesusFilm/core/issues/10157). `api-auth` owns OAuth state and application grants in the separate auth logical database. It does not replace api-users. [Granted reads and restricted exchange](../api-mcp/GRANTED_READS.md) are implemented by #10573. [Personal connections and renewal](CONNECTIONS.md) are implemented by #10574. Withdrawal and account-change coordination remain with their implementing slices.

The pinned implementation is [oidc-provider 9.15.0](https://github.com/panva/node-oidc-provider/tree/v9.15.0). Development interactions and in-memory persistence are disabled. Supports pre-registered public web clients, public DCR and allowlisted CIMD draft-03. Requires PKCE S256 and exact redirects, binds the MCP resource audience, authenticates introspection and rotates refresh tokens. External clients receive opaque five-minute MCP tokens, never Firebase credentials.

## Local startup

Use Node 24 and the repository pnpm toolchain. Reuse the approved development Firebase project, normal local gateway/Journeys services and Admin. No new project or emulator is needed. Start the existing backend with `pnpm dev:api` and Admin normally. Use the same hostname for Admin and issuer, such as `127.0.0.1`, for browser cookie site matching.

Create a separate auth logical database on the PostgreSQL sidecar. Never use the shared journeys database. For this issue use `auth_issue_10549` or a new issue-specific suffix.

1. As database administrator, execute [roles.sql](../../libs/prisma/auth/roles.sql) against auth only. Supply `migration_role`, `runtime_role`, `migration_password` and `runtime_password` as psql variables, using fresh external credentials.
2. Supply the migration-role URL as `PG_DATABASE_URL_AUTH_MIGRATION`, then run `pnpm exec nx prisma-migrate prisma-auth`.
3. As the migration role, execute [grants.sql](../../libs/prisma/auth/grants.sql), supplying `runtime_role`. Repeat after migrations introducing tables. Runtime gets DML on the auth tables, without DDL, ownership or access to Prisma's migration journal.
4. Remove the migration URL from the runtime environment. Supply the restricted role as `PG_DATABASE_URL_AUTH`. Startup/readiness reject elevated or owning roles and a database bound to a different issuer/environment.

Run `pnpm exec nx prisma-generate prisma-auth`, then `pnpm dev:mcp`. `Procfile.mcp` starts the separate issuer and MCP processes. The MCP launcher inherits only MCP settings and basic execution settings, excluding auth database, issuer and Firebase secrets. Supply configuration through the existing secrets workflow. Also set Admin's server-side `AUTH_ISSUER`.

| Setting                                                             | Purpose                                                                                                   |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `AUTH_ENVIRONMENT`                                                  | `local`, `stage` or `production`, each with separate state/credentials.                                   |
| `AUTH_ISSUER`                                                       | External origin, e.g. `http://127.0.0.1:4011`. No path/query/credentials.                                 |
| `AUTH_ADMIN_ORIGIN`                                                 | Exact browser origin, e.g. `http://127.0.0.1:4200`.                                                       |
| `AUTH_AUDIENCE`                                                     | Exact MCP URL, e.g. `http://127.0.0.1:4010/mcp`.                                                          |
| `AUTH_GATEWAY_URL`                                                  | Existing GraphQL gateway URL. Eligibility uses the owner's Firebase token.                                |
| `AUTH_FIREBASE_PROJECT_ID`                                          | Approved Firebase project for this environment.                                                           |
| `GOOGLE_APPLICATION_JSON`                                           | Existing Firebase service-account JSON with matching project.                                             |
| `PG_DATABASE_URL_AUTH`                                              | Restricted runtime URL. Stage/production require `sslmode=verify-full` and the trusted CA.                |
| `AUTH_JWKS`                                                         | Private signing JWK set with `kid`, `kty` and private key material.                                       |
| `AUTH_COOKIE_KEYS`                                                  | Comma-separated signing keys, at least 32 characters each, newest first.                                  |
| `AUTH_INTROSPECTION_CLIENT_ID` / `AUTH_INTROSPECTION_CLIENT_SECRET` | Dedicated confidential resource-server credentials, secret at least 32 characters.                        |
| `AUTH_CLIENTS`                                                      | JSON public registrations containing `client_id`, `client_name`, exact `redirect_uris`. Defaults to `[]`. |
| `AUTH_CIMD_ORIGINS`                                                 | Explicit trusted HTTPS metadata origins. Empty denies CIMD fetching. Excludes issuer/resource origins.    |
| `AUTH_HOST` / `AUTH_PORT`                                           | Bind address/port, default `127.0.0.1:4011`. Containers use `0.0.0.0`.                                    |
| `MCP_AUTH_MODE` / `MCP_PUBLIC_URL`                                  | Keep the baseline at `disabled`, or configure the granted-read participants documented above.             |

Stage/production require HTTPS. Their trusted ingress must preserve Host and overwrite forwarded transport headers. Browser identity never trusts forwarded user headers. Metadata fetches reject IP literals before connection and use a TLS agent whose DNS lookup rejects special-use addresses and connects using the validated results. Fetches have a 2.5-second timeout, no redirects and 16 KiB metadata / 8 KiB JWKS/sector limits. Public clients cannot register remote JWKS/sector/request URIs. DCR allows at most five HTTPS redirects and a 16 KiB body. Only local permits loopback HTTP callbacks.

`/health` reports process liveness. `/ready` checks the database, role and persisted environment binding. Firebase/gateway failure denies the affected request; readiness does not certify live sign-in. Retain previous signing/cookie keys during rotation. Promote code/migrations, never local identities, grants, clients or keys. Deployment owns backups and operational log retention.

## Consent and persistence

The signed issuer interaction cookie binds the browser to `/interaction/:id`, which redirects to authenticated Admin `/agents/connect`. Existing sign-in, verification and terms flows preserve that return path. The page sends a fresh Firebase ID token. Server verification checks revocation, disabled/deleted/unverified accounts and original account creation time. Existing authenticated gateway profile and `adminJourneys` reads enforce current eligibility. Ordinary Read/Update ACL roles are identical; templates/deleted journeys are excluded and published journeys cannot receive editing consent.

Select up to 50 journeys and View only or draft editing. One week is preselected, with day/week/month/year choices. Calendar periods use UTC and clamp month ends/leap years. Review binds the chosen period to an immutable server deadline and single-use token valid for one minute. Approval uses that displayed deadline; waiting/use/refresh cannot extend it. Stale review requires another review. Final approval time is recorded separately. Denial is available before resource selection and issues no code/grant.

Client/account bindings come from verified interaction state. Capture account/journey generations before eligibility reads; lock gates in code-point order, then the interaction row. After locks, check generations and current database time, consume the review once and persist application/OAuth grants atomically. No remote call runs inside that transaction. Later permission-change slices must coordinate every supported mutation through these gates before exposing data capabilities. This slice does not claim their Pending/Complete or private-output participants.

The adapter durably stores artifacts, expiry, consumption and grant associations. Client registrations have no time expiry, so an older registration remains available for newly approved consent. Tokens and interactions require explicit lifetimes. Registration management and registration access tokens are disabled. Conditional atomic consumption prevents duplicate redemption across issuers. Credential lookups consult the current grant and Firebase state, bound to original sign-in and account creation. Replay retires the OAuth grant. Access/refresh/code persistence checks current expiry after its grant row lock; refresh never moves consent expiry. Required authority unavailable fails closed.

Audit contains typed action/outcome, original event/expiry time and verified user/client/journey identifiers only. No content, headers, credentials or raw errors. Startup and minute-based cleanup remove expired artifacts/reviews and security events after their original 90-day window. No audit browser is exposed. Operational copies/backups need the deployment owner's retention configuration.

## Verify and build an image

```sh
pnpm exec nx build api-auth
pnpm exec nx type-check api-auth
AUTH_TEST_DATABASE_URL="$PG_DATABASE_URL_AUTH" pnpm exec vitest run --config apis/api-auth/vitest.config.mts
pnpm exec vitest run --root apps/journeys-admin --config "$PWD/apps/journeys-admin/vitest.config.mts" src/components/AgentConsent/AgentConsent.spec.tsx --coverage=false
docker build --platform linux/amd64 -f apis/api-auth/Dockerfile -t journeys-auth:10549 .
docker run --rm --env-file /path/to/private-auth-env -p 4011:4011 journeys-auth:10549
```

Use a disposable issue-specific auth database for HTTP tests: they clear their auth tables. Without `AUTH_TEST_DATABASE_URL`, that suite explicitly skips. The storage-permission fault test also requires its isolated migration URL in `AUTH_TEST_MIGRATION_DATABASE_URL`; it temporarily removes and restores the runtime role's read permission. A skip is not verification. Tests exercise real OAuth HTTP, PostgreSQL, separate Node replicas/replacement and concurrent redemption with declared synthetic identity/eligibility adapters imported only by test entrypoints. Metadata tests include real private-destination listeners plus controlled oversized, redirect and timeout responses. Component tests verify UI behavior. Neither supplies normal-browser/live-Firebase/owning-backend end-to-end evidence.

The bundle was executed from an isolated directory containing only `main.mjs`, with a synthetic Firebase service-account key for startup and the restricted database role. Readiness returned 200. The image contains only that bundle, runs as the Node user and receives configuration externally. Docker execution and the normal Admin browser flow with approved Firebase and actual local owning APIs remain unexecuted in this runner, which has no Docker/Doppler CLI or configured Firebase credentials. These remain local acceptance requirements. AWS and actual Claude/ChatGPT staging proof belong to the designated deployment/release owners.

## Browser qualification

The manual [browser suite](../../apps/journeys-admin-e2e/src/e2e/agents/connection.spec.ts) runs normal Firebase sign-in from the OAuth redirect, Admin resource/mode selection, approval, token exchange/introspection/rotation, another user's tampered selection and denial. It controls only its synthetic OAuth callback and the tampered outgoing form. Firebase, Admin, issuer, gateway and owning-service responses remain real. Traces, screenshots and video are disabled to avoid recording credentials.

Prepare two existing approved development Firebase test accounts with verified email and accepted terms, and three synthetic ordinary drafts in the local journeys database. The first account owns drafts A/B; the second owns C and cannot access A. Supply `PLAYWRIGHT_EMAIL`/`PLAYWRIGHT_PASSWORD`, `PLAYWRIGHT_EMAIL2`/`PLAYWRIGHT_PASSWORD2`, `AUTH_E2E_JOURNEY_A_TITLE`, `AUTH_E2E_JOURNEY_A_ID`, `AUTH_E2E_JOURNEY_B_TITLE`, and `AUTH_E2E_STRANGER_JOURNEY_TITLE` for C. Supply the configured issuer introspection client ID/secret to the test process. Set `DEPLOYMENT_URL` to the local Admin origin, `AUTH_E2E_ISSUER` to the issuer origin and `AUTH_E2E_AUDIENCE` to the MCP URL. Admin and issuer must share a loopback hostname. Start all normal services first, then run from the repo root:

```sh
pnpm exec playwright test --config apps/journeys-admin-e2e/playwright.config.ts apps/journeys-admin-e2e/src/e2e/agents/connection.spec.ts --grep @manual
```

The suite is intentionally outside smoke and excluded from unattended full runs by the existing `@manual` convention. It fails when required local configuration is missing. Listing or type-checking it is not browser qualification. It has not been executed in this runner.
