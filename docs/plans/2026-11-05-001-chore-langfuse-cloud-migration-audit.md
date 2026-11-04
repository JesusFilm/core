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
  Delivery errors/timeouts are logged without replacing the chat response.
  The timeout regression uses a processor that never resolves; it proves the
  handler's awaited flush can release without waiting for that processor.
  Terminal/disconnect callbacks share one request-local flush promise. This
  prevents a second flush from returning on an empty queue while the first
  still exports that request's spans; the closed-socket regression asserts
  exactly one flush and that the handler waits for it.
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

A single valid migrated root is preferred. Missing/malformed root metadata
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

Results: **74 chat/client tests** and **243 exporter tests** pass; both direct
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

## Live verification and remaining coverage

Read-only credential discovery used Core's Doppler `journeys` project only.
Both `stg` and `stg_dev` Langfuse credentials return **401**. `dev` authenticates
to the US-region project named `journeys`, which contains production traces;
this is not established as an isolated non-production destination. No synthetic
telemetry was written using those keys. A private ignored verification env file
was prepared and the intended non-production configuration requested.

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

Actual live trace delivery, managed prompt success/fallback, provider failure,
disconnect, field-level observations-v2 validation, historical root coverage,
and Migration Assistant coverage require the intended non-production credentials.
Normal PR CI and preview deployments are authorized. This change does not merge,
push shared stage, change production, or bypass CI/protections.
