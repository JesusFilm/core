# Journeys MCP acceptance

This is the initial local artifact phase of [#10565](https://github.com/JesusFilm/core/issues/10565), under [#10153](https://github.com/JesusFilm/core/issues/10153). The [canonical cases](https://github.com/JesusFilm/core/issues/10157) and the issue's original acceptance criteria still apply. A3 is absent from that specification. Neither this document nor a passing local command qualifies AWS stage, Claude, ChatGPT web or production.

## Reproduce the local checks

Use the repository's supported Node version, pnpm and local PostgreSQL. From the repository root:

```sh
mkdir -p /tmp/phoebe-issue-10565
pnpm exec vitest run --config apis/api-mcp/vitest.acceptance.config.mts
pnpm exec tsx tools/scripts/mcp-acceptance.mjs local /tmp/phoebe-issue-10565/local
```

`MCP_ACCEPTANCE_POSTGRES_URL` defaults to `postgresql://postgres:postgres@localhost:5432/postgres`. Remote hosts are rejected. Each suite gets randomly suffixed `*_issue_10565_*` databases, committed migrations and a non-superuser auth runtime role with the real `grants.sql`. The runner removes only its own databases and role in `finally`. It never resets another database. The saved-edit/read fixture guards explicitly admit #10565. A focused rerun appends suite names, for example `local /tmp/phoebe-issue-10565/retest video-upload operations`.

The runner reuses the implementing slices' Vitest configurations and test bodies. Read, expiry, renewal, withdrawal, account deletion, edits/history, structure/routes, forms, appearance, Card starters, existing media, image/video uploads, generation, operational stops and protocol/process tests run through their existing boundaries. `admin-components` runs the existing connection, upload and private-preview component suites. These component tests do not execute a normal browser. OAuth, MCP HTTP, Hive gateway, owning handlers and PostgreSQL are real in the integration suites. Firebase, storage, providers, feature gates and explicit fault/clock hooks are controlled as documented in those suites. This runner adds no production clock override or new content operation.

Every required test must pass. A skip, todo, missing/empty report, nonzero process exit or missing owning-module execution hit fails the run. Output goes to the selected directory, with separate test/coverage reports per suite and SHA-256 hashes of copied test results. Use a fresh output directory for each invocation. Exclusive invocation and plan files prevent accidental replacement of earlier evidence. A failure writes a failed aggregate naming the failed suite. Partial selections always remain incomplete. Existing workspace/shard reports are preserved.

The focused evidence suite itself executes the real saved-edit integration path and an unavailable-database retry. Its coverage belongs in `coverage/integration/mcp-acceptance`, separately from the capability coverage under the selected output directory. Preserve JSON counts and Cobertura together. The acceptance workflow uploads the focused report against the checked-out PR head and collects an actual-base MCP workspace baseline. Inspect Codecov patch and project results for that head. Missing uploads or baselines are collection failures, not passing coverage. Report inherited capability gaps to their implementing tickets before refreshing the stack. Do not lower thresholds or omit changed code.

## Pin a candidate and create its pending ledger

After all required feature changes are assembled and deployed to AWS stage through #10583's approved route, populate the actual manifest described in [OPERATIONS.md](./OPERATIONS.md). Include every backend image digest, source/app revision, database migration set, origin, Firebase project and operational/storage configuration. The committed example is synthetic and is never deployment evidence.

```sh
pnpm exec tsx tools/scripts/mcp-acceptance.mjs plan "$MCP_CANDIDATE_MANIFEST" /tmp/phoebe-issue-10565/stage-evidence
```

The output `plan.json` contains every executable tool/command and nested starter/action variant, four outcomes per registry row, all canonical cases, both named client workflows, browser checks and operational checks. `ledger.json` starts with no records. Freeze `notBefore` at the start of complete-candidate acceptance. Do not move it backward to reuse subset evidence. A client fix, new participant or redeployment changes the manifest fingerprint and requires a new plan. Preserve the failed run and link its retest in redacted evidence. Repeat affected checks and obtain complete current-candidate evidence before final review.

Registry outcomes are accepted, denied, interrupted and replayed. For read-only rows, interruption/replay mean cancel/lose the response and repeat the same authorized read without leaking data or changing content; they do not invent write receipts. For aggregate saves, record each exercised typed command and nested variant. A schema inventory is not proof that an owning handler ran. Review the actual suite/test IDs and artifacts associated with each claim.

## Synthetic stage setup

Prepare these through normal Admin or an approved isolated test fixture, never a new MCP create/adopt tool. Give records recognizable synthetic titles and redacted aliases in evidence.

| Alias          | Required state                                                                                                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Team A, Team B | Independent teams with a manager, member/editor and stranger; no real customer data                                                                                                                        |
| Draft A        | Ordinary never-published draft in Team A; start, answer and default Steps; Yes points to an existing video Step, No to the default branch; extra text, style, IDs, routes and an existing Host to preserve |
| Draft B        | Ordinary draft in Team B; editing user can edit it, first client grant excludes it                                                                                                                         |
| Published P    | Ordinary published journey; authorized reads only and no MCP save/history attachment                                                                                                                       |
| Website W      | Private website draft with Card slugs and the same two preview branches                                                                                                                                    |
| Media          | Ready shared and personal unattached image/video assets, pending/failed assets, owned/foreign IDs and synthetic files at the exact byte limits and one byte over                                           |
| Integration    | Existing permitted form destination plus a foreign destination; no visitor records, secrets or outbound sync                                                                                               |
| Accounts       | User with edit rights to A/B; independent manager with Manage but no journey-only role; journey-only Editor; stranger; second user with independent grants and quotas                                      |
| Connections    | Claude edit grant for A; ChatGPT independently selected grant; first-party View only on an Admin editor; controlled short-lived/renewable connections and wrong-client/account attempts                    |

For normal-browser preview reuse `apps/journeys-admin-e2e/src/e2e/agents/private-preview.spec.ts`. Supply its `PRIVATE_PREVIEW_JOURNEY_ID`, `PRIVATE_PREVIEW_WEBSITE_ID`, `PRIVATE_PREVIEW_PUBLIC_URL` and normal test-user configuration from the implementing preview runbook. Inspect that spec and its actual required settings before execution. Use the normal Playwright configuration and approved synthetic accounts. Its `@manual` cases require deliberate execution; an excluded tag or skipped test cannot qualify A8. Keep traces, videos and screenshots disabled where they could capture credentials or private content. Final AWS preview/publication belongs to this ticket, even if local preview tests passed earlier.

Record the baseline graph/IDs and Admin revision before edits. Do not publish A or revoke its connection until prior scenarios have finished; use fresh synthetic drafts/connections where a case permanently retires authority. Never recreate retired namespaces to reset limits, history or accepted keys.

## Real Claude and ChatGPT conversations

Run separately in the actual Claude web product and ChatGPT web product with their supported custom-MCP connection route. Use the creator's available subscription and record the actual plan/capability and observed settings; do not assume a tier, menu name or registration mode. API, SDK, Inspector and Codex sessions do not count. Record date, redacted account/client/connection/conversation aliases, product build or explicitly observed version identifier, browser/platform, actual Node/SDK versions, negotiated protocol and registration mode. Retain a redacted discovery response and correlate it to deployed digests. If the product exposes no build identifier, record the observable release identifier and limitation for reviewer disposition rather than inventing one.

Use a new conversation for each major run and one fresh chat on the same connection for history. In at least one full workflow, disable optional prompts/resources and invoke only ordinary tools using their descriptions. Record that setting as `toolsOnly: true`. Both clients must complete these instructions and the required scenarios below:

1. Sign in through the deployed issuer. Inspect consent with one week preselected, all four durations of one day, one week, one month and one year, selected journeys/mode and server-derived expiry. Approve only A. List journeys and read its current structure, dependencies and revision. Try B by ID/slug/nested reference and retain the denial.
2. Ask: "In existing draft A, replace the heading with 'Synthetic branch review'. Add a two-answer poll and connect Yes to the existing video Step. Preserve No, other content, routes and Host. Read first and keep the requested gesture atomic." Compare Admin IDs/routes/fields and receipts. Exercise the rest of the planned registry rows through named synthetic scenarios, retaining actual tool calls/results.
3. Read, edit the same target through Admin, then ask the client to save its stale instruction. Observe conflict and no write. Refresh and apply still-clear intent while preserving unrelated human work. Lose a response through the controlled fault route, retry the exact key/payload and prove one effect. Do not ask the model to fabricate a historical key or assume its summary is the durable receipt.
4. Start a fresh chat on the same connection. Read retained history and undo/redo with stable IDs. Commit six batches, inspect the shared five-entry capacity and replay the pruned key. Perform View only, journey removal/re-addition, renewal and disconnect/Pending cases using personal Connected agents and the controlled boundaries below.
5. Ask for ordinary text/layout improvements, select an existing image, then ask for an image-generation suggestion without accepting it. Inspect provider/job counters after each and prove zero new generation. Then explicitly request generation; retrieve the same job and separately authorize attachment with a fresh revision. Record instruction following separately from deterministic server denials. A model-supplied intent flag is not evidence of the user's request.
6. Start a synthetic upload. Open its signed-in Admin link, upload through trusted ingress and return to the same client/job. Duplicate opens/lost responses must retain the original slot/deadline. Check wrong user, reduced/View-only/expired/disconnected origin authority and intervening Admin edits before separate attachment.
7. Follow both branches in private preview through a normal authorized browser. Verify no visitor/integration/external effects, then hand off to Admin. A human Manager publishes; a journey-only Editor fails. Verify an MCP save/undo/redo paused before commit cannot commit afterward.
8. Exercise fixed expiry and renewal through the deployed auth route with approved controlled fixtures. Retain old credentials, test both sides of final acceptance, obtain a new server-derived expiry from final approval, and prove no grant expansion, reset of retention/usage, replay duplication or automatic job restart. Repeat the history-retention cutoff just before, at and after 30 days. The production expiry path must remain unchanged.

For every failure record the expected/actual outcome, test ID, owning issue, deployed digest, sanitized receipt/job/task IDs, failure evidence and eventual retest. Compatibility fixes belong to the owning implementation ticket. Merge through the feature queue, redeploy the complete candidate and repeat affected checks in both actual clients.

## Canonical case checklist

Use the full wording on #10157 and #10565 as the assertions. This index identifies the observation to retain; it does not replace those requirements.

| Case | Required evidence                                                                                                                                                                                                                   |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A0   | Discovery and direct/nested/history denials for every excluded operation, including whole journey/template, Host, access, analytics/export/sync, sharing/domain and Publish                                                         |
| A1   | Current Admin rights AND active operation/resource grant at each owner; A/B, View only, selected access changes, owner-only expansion, immediate reduction, unchanged expiry, Pending fences, independent client and wrong audience |
| A2   | Signed-out/stranger/public-URL denials across lists, IDs, slugs, nested assets, jobs/results/history and warmed preview/page caches; ready public-media delivery preserved                                                          |
| A4   | Interrupt before commit with no partial state; lose committed response and exact replay once; changed payload and revoked replay denied                                                                                             |
| A5   | Every planned registry row/outcome and complete branch workflow; fields/IDs/routes preserved; source readiness, failure, feature gates and no duplicate attachment                                                                  |
| A6   | Explicit replacement of previously human-authored values after a read succeeds                                                                                                                                                      |
| A7   | Intervening human edit rejects stale save; refresh preserves unrelated work; seven action variants and shared-reference conflicts                                                                                                   |
| A8   | Both private branches, serialized pages/cache protection, zero external effects, Manage-only human Publish, Editor denial and post-publication commit rejection                                                                     |
| A9   | Both actual products, one tool-only workflow, connection consent/management, View only, approved expansion, reduction/Pending, same-job upload and Admin handoff                                                                    |
| A10  | Fresh-chat stable history, five entries across undo/redo, per-connection/journey isolation, redo invalidation, pruned-key replay, disconnect drain then retryable purge with no late inverse                                        |
| A11  | Host CRUD/assignment and hidden inputs denied; newer human Host state preserved by ordinary undo                                                                                                                                    |
| A12  | Delete-only preserves/reports incoming routes; suggestions do not write; requested repair, combined gesture, replay/undo/conflicts and invalid new destinations                                                                     |
| A13  | Both clients' unaccepted suggestion and ordinary edits start no generation; explicit request succeeds; foreign/View-only/revoked attempts fail before provider work                                                                 |
| A14  | All consent durations, final-approval expiry, old credentials, exact deadline after locks, accepted-before-expiry completion, fresh output/attachment checks, renewal and 30-day history cutoff                                     |
| A15  | One active generation and ten new dispatches per user/rolling day across clients/replicas; replay versus failed/uncertain/pre-dispatch accounting; no reconnect/renewal reset                                                       |
| A16  | Trusted exact image/video byte limits, forged metadata and single-file credentials; two combined uploads across replicas, safe capacity release, same-job fallback, separate generation limit                                       |
| A17  | All audit stores/copies contain no content/prompt/file/credential/raw-error sentinels; occurrence-based 90-day expiry and interrupted cleanup                                                                                       |
| A18  | Completed-result 30-day cutoff, authorized result-expired retry without effect, changed-payload denial, permanent duplicate markers/retired namespaces, unfinished-job recovery                                                     |
| A19  | Successful unattached/shared assets retained; fixed one-hour incomplete transfer, forged continuation/retry/restart, pre-cutoff completion observed late, safe-stop cleanup and no false ready asset                                |
| A20  | Role loss denies cached/queued work; restoration works only inside original active grant with no retention reset or restart                                                                                                         |
| A21  | Existing account deletion preserves journey/team outcomes, other users and all image/video assets; permanently retires MCP authority and retries private cleanup without reviving namespaces                                        |

## Cross-service races and operations

Run all combinations of issuer/gateway/MCP/owning participants paused after admission, after final authorization, before commit and after provider handoff against disconnect, access reduction, role removal and fixed expiry. Retain owner receipts and positive fences. A missing response, expired lease, dead socket or timeout never proves an executor stopped.

The nine resolved-connection race groups require separate observations: stale ACL generation after close/reopen; permission-change crash recovery; accepted-save drain; provider enqueue versus actual handoff; buffered output release; exact expiry after lock waits; retained-history cleanup versus renewal/disconnect; current external identity invalidation; owner-only current management/expansion checks. Cover coordinator/owner outage, positive executor fencing and cooperative versus out-of-band permission changes. Pending remains until accepted participants settle or are positively fenced; no claim can recall released bytes or public-media files.

Follow [OPERATIONS.md](./OPERATIONS.md) for two replicas, replacement, independent write/effect disable, key/grant rotation, actual alert delivery and previous-digest rollback. Include assembled Admin/identity/gateway/owners/media versions, live provider recovery, limits, all retention sinks and accountable service owners. Earlier subset evidence cannot certify a new participant. Name the release owner and independent reviewer, restricted initial cohort, measured rollback triggers and incident contacts in the redacted operations artifact before any production-cohort approval. This tool does not deploy, reopen gates or promote environments.

## Evidence records and review

Add `passed` records to `ledger.json` only after observing the required result. Each record has unique `id`, exact `checkIds` from the plan, expected `participant`, `environment: stage`, candidate `sourceCommit`, `releaseDigest`, `registryDigest`, UTC `startedAt`/`finishedAt`, zero failed/skipped/pending counts, operator and independent reviewer aliases, `controlledParticipants: []` and nonempty artifact references. Actual client records additionally require the `client` fields specified in `src/acceptance.ts`. Stage evidence with controlled substitutes cannot satisfy the gate. Keep local results separate.

Each artifact reference contains `path` relative to the ledger directory and the SHA-256 of its actual redacted bytes. Accepted extensions are `.json`, `.md`, `.txt` and `.xml`. Include transcripts, browser/full-stack reports, deployed-version observations, operational results and limitations. Remove tokens, cookie/header dumps, signed upload URLs, raw exceptions and real user content before hashing. Retain only redacted aliases and necessary synthetic content. Store the evidence bundle in the approved private evidence location and link its dated index in the PR; hashes bind files but do not establish their truth or author identity.

```sh
pnpm exec tsx tools/scripts/mcp-acceptance.mjs verify-stage /tmp/phoebe-issue-10565/stage-evidence/ledger.json "$MCP_CANDIDATE_MANIFEST"
```

The validator rejects missing, skipped, stale, wrong-environment/participant/deployment/registry evidence, unsupported protocol declarations, missing client facts, missing tool-only runs, duplicate IDs, missing/changed artifacts and directory escapes. `evidence-ready-for-review` means structurally complete declarations and matching files. It always reports `productionApproved: false`. A human reviewer must inspect transcript contents, named real participants, deployment observations, underlying test assertions, limitations and incident ownership. Self-attestation or a forged JSON record is not release proof. Final environment/release approval follows normal review, outside this command.

## Deferred feature checks

Every stage and real-client check in the generated plan remains unexecuted in the initial source phase. This includes #10583 AWS setup/deployment; actual IAM/ingress/digests; live providers; complete-registry deployed full-stack tests; normal-browser private preview and human Publish; actual Claude/ChatGPT sign-in, consent, compatibility, tools-only conversation, history, upload, generation, expiry/renewal and conflict recovery; multi-replica races, operational alert delivery, rotation, limits, retention and digest rollback. Client fixes require feature incorporation, stage redeployment and affected retests. No stage/main/production promotion, production-cohort enablement or release approval is claimed. The supervising chat owns the deferred ledger on #10153 and feature merge; implementation agents never merge or close this gate on local results alone.
