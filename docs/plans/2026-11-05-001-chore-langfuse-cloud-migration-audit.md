# Core Langfuse Cloud migration audit

Date: 5 November 2026, Pacific/Auckland. Baseline: current `origin/main`,
`0a6941c4a68fe47306d46ee3a31576000ef10e0a` (fetched before implementation).

## Scope and prior work

Core still used `langfuse@3.38.20` for AI Assistant tracing and managed prompts,
and `GET /api/public/traces/{id}` for Explorer Bundle extraction. A committed-tree
search, including sparse-hidden workspaces and excluding the opt-in
`docs/solutions` archive, found no other executable Langfuse integration.
Legal/translation copy, the AI Assistant session comment, and load-test guidance
do not call Langfuse APIs. No overlapping open migration PR was found.

[PR #9999](https://github.com/JesusFilm/core/pull/9999) was merged and then
fully reverted by [#10041](https://github.com/JesusFilm/core/pull/10041).
The later rollback comment confirms delayed trace visibility; it does not
establish a migration or disconnect regression. The reviewed final migration
head, `92e517263766fddd8f5d62da611f4525c1d88fc2`, and its deleted audit were
inspected as historical evidence. Its implementation/test changes apply cleanly
to the current chat/export surfaces and are reused here. The unmerged partial
rollbacks are not the solution. Forge is outside this change.

## Current upstream requirements

The [Cloud upgrade guidance](https://langfuse.com/faq/all/upgrade-to-langfuse-v4)
still specifies **16 November 2026** and JS ingestion **SDK >=5.4.0**.
Platform ingestion v4 and the JS SDK majors are different version schemes.
The [deprecated API mapping](https://langfuse.com/faq/all/deprecated-api-migration)
requires observations v2 to replace trace reads separately from upgrading the SDK.
The [JS v3-to-v4](https://langfuse.com/docs/observability/sdk/upgrade-path/js-v3-to-v4)
and [v4-to-v5](https://langfuse.com/docs/observability/sdk/upgrade-path/js-v4-to-v5)
guides describe scoped clients, OTLP tracing, and observation-level context.
SDK v6 is not required for this migration.

The scoped client, tracing and OTEL packages resolve together to **5.14.0**.
Both the registry and installed OTEL manifest require the OTLP HTTP exporter and
exporter base peers at `>=0.202.0 <1.0.0`; explicit `^0.202.0` dependencies
satisfy them. Existing `0.200.x` instrumentation remains unchanged. The reviewed
lock delta was reapplied to current main and a frozen install passed: all nine
workspace importers remain, every non-root importer is unchanged, and the only
root dependency changes are the three scoped SDKs, these two peers, and removal
of unscoped `langfuse`.

## Runtime behavior

- Managed prompt name `apologist-world-cup-chat`, production/development label
  selection, SDK caching, text validation, local fallback, language compilation
  and ESV translation remain intact. Model routing, validation, feature/card
  gates, safe operational logging and deployment environment selection remain intact.
- A dedicated `BasicTracerProvider` preserves Next.js/Datadog's global provider.
  Each request has one root and one child generation, explicit parentage,
  root request/response I/O, session and context metadata on both observations,
  prompt name/version, model and token usage. End is idempotent; completed spans
  are exported once. The supported SDK sends OTLP/HTTP with the explicit
  `x-langfuse-ingestion-version: 4` header.
- HTTP export and the provider's entire `forceFlush` are bounded at five seconds.
  Flush errors/timeouts are logged without replacing the chat response; SDK
  transport errors use OpenTelemetry's existing diagnostic handler.
  The timeout regression uses a processor that never resolves; it proves the
  handler's awaited flush can release without waiting for that processor.
  Terminal/disconnect callbacks share one request-local flush promise. This
  prevents a second flush from returning on an empty queue while the first
  still exports that request's spans; the closed-socket regression asserts
  exactly one flush and that the handler waits for it.
  The SDK's immediate processor tracks in-flight exports, including ones started
  before `forceFlush`. A real HTTP regression holds the root acknowledgement
  after its sibling export completes with `LANGFUSE_FLUSH_AT=1`: batching returned
  early (reproduced failure); immediate mode waits until acknowledgement. Each
  completed root/generation is sent once in its own OTLP request.
- A response-socket close aborts the model signal and finalizes warning spans.
  Racing piping against disconnect handles the actual Node closed-socket/drain
  stall even when neither SDK terminal callback fires. Normal completion does
  not trigger cancellation. The handler awaits flushing before returning.

## Export behavior

The discovery window selects trace IDs through cursor-paged generations.
Each selected trace is expanded through observations v2 without time/type
restrictions, retaining earlier/later generations and migrated root context.
Explicit field groups and metadata expansion preserve session, attribution,
tags, I/O, model, usage and cost. JSON-shaped replies remain text when their
decoded shape is not a supported assistant-message shape.

A single valid migrated non-generation root is preferred. A parentless generation
is not evidence that legacy trace attribution was recovered; even a lone one
must pass generation-context validation. Missing/malformed root metadata
requires consistent generation context; competing roots or missing/conflicting
attribution stop the export with the trace ID. Known untagged root metadata
remains valid. Journey/load-test exclusions and the existing PII scrub pipeline
are preserved. Duplicate IDs do not inflate totals. Empty intermediate pages
with a cursor are followed. Invalid core identities, invalid/repeated cursors,
pagination ceilings, missing response data, or detail reads omitting discovered
generations fail explicitly instead of publishing an incomplete Dataset.

Historical root backfill remains an operator prerequisite for the history
actually needed for export; local synthetic regressions cannot prove that the
server has completed it. The existing offline `--fixture` path remains usable
for an authorized snapshot without reverting to deprecated trace endpoints.

## Fresh local verification

Toolchain: Node **24.22.1**, pnpm **10.33.4** (matches `packageManager`;
Node requirement is >=22). Only this worktree's sparse view was widened for
tooling, manifests, shared lint config, agent/plan docs and Storybook type imports.
Dependency lifecycle scripts were skipped; Husky was installed explicitly and
normal commit hooks remain enabled. The primary checkout and prior worktrees
were preserved.

```sh
pnpm exec vitest run --root apps/journeys --config "$PWD/apps/journeys/vitest.config.mts" pages/api/chat src/libs/langfuse --coverage=false
pnpm exec vitest run --config tools/langfuse-export/vitest.config.mts --coverage=false
pnpm tsc7 -p apps/journeys/tsconfig.ts7.json
pnpm exec tsc -p tools/langfuse-export/tsconfig.json --noEmit
pnpm exec tsx tools/langfuse-export/run.ts --fixture tools/langfuse-export/fixtures/sample.json
```

Results: **74 chat/client tests** and **248 exporter tests** pass; both direct
type checks pass. The wire test uses a real loopback HTTP collector and prompt
server, checks prompt linkage, complete spans, overlapping request isolation,
unchanged global provider, duplicate completion, and HTTP 400 export rejection.
The separate real Node HTTP test covers normal completion and disconnect while
more model chunks are pending. Fixture Run produces 12 Conversations from 13
traces/20 generations, excludes one load-test turn, and creates 32 facets.
`lint:changed --fix` passes formatting, Journeys ESLint and translation extraction;
export tooling has no workspace ESLint config, so its changed files are formatted,
type-checked and tested. `nx affected --target=type-check --base=origin/main` passes
for seven materialized projects (journeys, journeys-admin, journeys-ui, shared-ai,
shared-dev-hosts, shared-ui and shared-ui-dynamic). This sparse graph does not
substitute for full-repository CI. Independent review and PR delivery are recorded
below when complete.

## Independent review

Standards review: no actionable documented-standard or maintainability findings.
Spec review found two correctness gaps in the restored migration: empty metadata
on a lone parentless legacy generation could bypass journey exclusions, and an
automatic batch export could remain in flight after `forceFlush` returned.
Both are addressed with the stricter generation-context rule and SDK immediate
processor, with regressions as described above. Independent re-review reports no
remaining actionable findings; the parent reran both suites and type checks.

## Initial live verification and remaining coverage

Read-only credential discovery used Core's Doppler `journeys` project only.
Both `stg` and `stg_dev` Langfuse credentials return **401**. `dev` authenticates
to the US-region project named `journeys`, which contains production traces;
this is not established as an isolated non-production destination. No synthetic
telemetry was written using those keys. Jaco clarified that deployed verification
should use the normal Doppler-backed PR preview rather than a local env file;
the unused blank verification env was removed.

A fresh `doppler run --project journeys --config stg` check confirmed that
`GET https://us.cloud.langfuse.com/api/public/projects` returns 401 with
"Invalid credentials. Confirm that you've configured the correct host."
This is a direct Langfuse API authentication response using staging's own key
pair, not developer credentials sent to the Core stage application. Read-only
EU/Japan host checks also returned 401. No Doppler values were changed.

The regional project MCP dynamically lists `getV4MigrationData` as read-only,
with an empty-object schema. Its initial result for the accessible `dev`
destination reports no legacy integrations, trace evaluators or experiment
migration requirement, but **its SDK usage series and API usage list are empty**.
That coverage cannot establish Core's compatibility, particularly while the
current code demonstrably uses a legacy SDK and trace API. Bounded observations
queries found no stage/development/preview rows in that destination in 30 days.

Additional **read-only** checks against that destination retrieved the exact
managed prompt, development label, text type, **version 9**, with language and
translation variables compiling successfully. Three historical legacy-ID traces
from 28 October each expose one generation and one migrated non-generation root
with object metadata and a journey ID through v2. No message I/O was read or
exported in this sample. This confirms root-context recovery for those three
traces only, not backfill completion for every period an operator may need.

Actual live trace delivery, deployed managed prompt success/fallback, provider failure,
disconnect, field-level observations-v2 validation, historical root coverage,
and Migration Assistant coverage will be checked through the PR preview where
available; local credential checks do not establish the deployed destination.
Normal PR CI and preview deployments are authorized. This change does not merge,
push shared stage, change production, or bypass CI/protections.

## Staging key recovery and deployed verification — 5 November 2026

The earlier authentication blocker is resolved. Jaco recovered the rotated
Langfuse key pair and saved it to Doppler `journeys/stg`. Read-only checks
confirmed that `stg_dev` and the `jesusfilm/journeys-stage` Vercel preview
configuration match, and `GET /api/public/projects` now returns 200 for US
project `journeys` (`cmf3b99n30168ad07z05e7k98`). No local env file or credential
change was needed. The customary `on stage` label was added to
[PR #10163](https://github.com/JesusFilm/core/pull/10163).

An authorized empty rebuild commit `9d0c85517` triggered normal CI. Main build,
all three test shards, schema checks, CodeQL, autofix/type checks and all eight
preview deployments passed. Main build initially hit an upstream GraphQL
"Unexpected error" while prerendering Journeys Admin `/fr/templates`; rerunning
that failed job passed. Danger still requests assignee/reviewer metadata.
[Journeys deployment logs](https://github.com/JesusFilm/core/actions/runs/41935940402/job/126946156107)
verify checkout/build `edd2d791063d87ceb4548a80efe1b56af1afdbea`, merging
`9d0c855172995d55f3c506301c901a43a8b0b3de` into
`af4e1fd5533df6954d781ea7ccbf7154b178b541`, a fresh pull of Vercel **preview**
variables for **`jesusfilm/journeys-stage`**, and deployment
`journeys-stage-ptic3j8zl-jesusfilm.vercel.app` behind the PR alias. Production
was skipped. Subsequent exporter-only changes do not alter the deployed chat.

After that workflow completed, synthetic HTTP probes used the default
[Fact or Fiction Journey](https://journeys-10163-jesusfilm.vercel.app/fact-or-fiction),
Journey `1`, enabled Assistant card `f5fd44f2-3f51-43da-ac13-069a5d55398e`:

- `core-lf-10163-9d0c85517-success-20261105T005925Z` streamed HTTP 200 through
  completion. Trace `56681f08ff0353a1e7d58c9d33df4256` contains exactly one ended
  root and one ended generation with matching output and correct parentage.
  Model `anthropic/claude-haiku-4.5` through OpenRouter recorded
  2620 input / 59 output / 2679 total tokens.
- `core-lf-10163-9d0c85517-disconnect-20261105T005947Z` closed the client after
  its first text delta. Trace `0d686daf98d6745a562c9987d1d5ae3e` also contains
  exactly one ended root and generation, with 2613 / 512 / 3125 tokens.
  Both observations have DEFAULT level and the server logged completion after
  client close: this proves delivery after a hosted disconnect, **not** that
  Vercel propagated cancellation or stopped the provider immediately. Local
  real-HTTP regressions separately prove abort/finalization when Node receives
  the response-close event.

Both traces have `preview` environment, the exact synthetic session, Journey
context, English language, NZ country, provider/model metadata on root and child,
root I/O, and managed prompt **`apologist-world-cup-chat` version 9**. The bounded
runtime log window contains both completions and no Langfuse/warn/error entry.
Observations appeared promptly. Langfuse returns null cost and no matching
internal pricing model for this OpenRouter model ID; live monetary cost could
not be confirmed. Token usage and null cost survive export; fixture regressions
separately cover non-null cost preservation.

The actual v2 export client, restricted to each synthetic session for discovery
and then expanded by exact trace ID, returns one trace/generation/conversation.
Journey exclusion removes each conversation, and sanitization removes the fake
email from the completed-chat user turn. This live check found an additional
bug: v2 expanded metadata represents the default Journey ID as number `1`.
The string-only mapper dropped it, bypassing a string-ID journey exclusion.
A minimized offline mapper-to-normalizer replay and new rooted/rootless HTTP
contract regressions failed before the fix. Safe numeric IDs now retain their
string identity in both paths; unsafe numeric IDs stop export. Focused Spec
review also found eager generation validation despite a valid root, and raw
numeric/string comparisons in rootless context. Both were reproduced with
failing contract tests and corrected: authoritative roots bypass fallback
validation, and fallback compares canonical journey IDs. All **248**
exporter tests and the original real-data replay pass with this correction.

The project-specific read-only Migration Assistant now attributes **four OTEL
observations** from the two canaries to JavaScript SDK **5.14.0**, realtime
ingestion, `v4MigrationStatus=compatible`, `actionLevel=none`. It reports no
legacy integrations, trace-level evaluators or experiment migration requirement.
Its SDK coverage is this canary window; it is not evidence about every other
historical client. Earlier metadata-only checks of three October 28 legacy
traces in this same destination confirmed recovered roots, not complete backfill
for all history an operator may export. Browser control remains unavailable;
published page data and real HTTP streaming were checked. Live provider failure
was not induced by changing model configuration; regressions cover it locally.

## PR review corrections — 5 November 2026

Siyang and CodeRabbit identified overlapping-export loss at the OTLP exporter's
30-request limit. A real HTTP collector delaying acknowledgements for 300 ms
reproduced missing spans from 20 completed chats before correction. A dedicated
queue now admits at most 20 span deliveries at a time, waiting for each SDK
processor flush before admitting another. The SDK still owns masking, headers,
payload-size limits and immediate export. Provider flush includes queued and
active work and remains bounded at five seconds. The same HTTP regression now
receives all 40 distinct observations with valid parentage and no more than 20
active collector requests.

The chat route opts into Vercel cancellation through a Journeys-specific config
used by its deploy target. The rule uses the Next.js-relative `pages/api/chat/index.ts` path.
An initial glob-only check missed Vercel CLI's separate unused-function
validation, which rejects patterns beginning with `**/`. A regression replay
through the installed CLI's actual builder detector reproduced `unused_function`
for the original rule and passes with the exact Next.js path. After each build,
`verifyChatFunction.ts` checks the emitted chat function's `.vc-config.json`
and refuses deployment unless `supportsCancellation` is true. The handler captures
request errors with message `aborted` from the start of the request, forwards
cancellation to the existing disconnect path, ends the response and registers
the entire handling promise with `waitUntil`. This follows the documented
[Vercel cancellation/lifecycle contract](https://vercel.com/docs/functions/functions-api-reference).
Real HTTP regressions cover socket close and request abort during prompt retrieval,
request abort during streaming, provider cancellation, a single awaited trace
flush, and listener cleanup. A late finish after abort no longer emits a misleading
completed-chat event.

Export detail reads now re-check each generation's environment. An untagged root
whose children provide journey attribution stops export rather than bypassing
journey exclusions; genuinely unattributed roots/children remain supported.
Contract regressions cover both review findings. The updated local results are
**77 chat/client tests** and **250 exporter tests**, plus direct type checks and
a frozen install retaining all nine workspace importers. All corrections are
collected into one review-fix commit; subsequent CI and preview evidence is
recorded on the PR to avoid triggering another build for verification prose.
