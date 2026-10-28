# Core Langfuse platform v4 audit and verification

Date: 2026-10-23. Baseline: `67c2b9e729ba30fd2ba9f888d3e9b5ac24bcc400`.
Branch: `10-23-JB-chore-langfuse-v4`. This records the implementation audit;
delivery and verification status is recorded separately below. Implementation
used no production requests, credentials, deployments, or solution-archive reads.

## Requirements and scope

[Platform migration FAQ](https://langfuse.com/faq/all/upgrade-to-langfuse-v4):
Cloud's cutover is November 16, 2026. Platform v4 is distinct from JS SDK v4;
the documented JS ingestion minimum is **5.4.0**. Core previously used
`langfuse@3.38.20`, including legacy `trace`, `generation` and `getPrompt` calls.

The migration follows the official [v3-to-v4 SDK guide](https://langfuse.com/docs/observability/sdk/upgrade-path/js-v3-to-v4)
and [v4-to-v5 guide](https://langfuse.com/docs/observability/sdk/upgrade-path/js-v4-to-v5).
The scoped client/tracing/otel packages now resolve together to **5.14.0**.
`@langfuse/otel@5.14.0` declares `@opentelemetry/exporter-trace-otlp-http`
and `@opentelemetry/otlp-exporter-base` as required peers at `>=0.202.0 <1.0.0`.
The explicit `^0.202.0` dependencies satisfy those peers even though application
code does not import them directly. Existing `0.200.x` instrumentation packages
cannot satisfy that minimum; aligning unrelated instrumentation is outside this
migration. The lockfile retains all workspace importers, including sparse-hidden
backend packages.
A v6 SDK upgrade is not required for this task.

## Repository inventory

Audit the committed tree, not just materialized sparse files. Exclude
`docs/solutions/**` from content searches under repository policy:

```bash
git -c grep.threads=1 grep -I -n -i -e langfuse -e '/api/public/ingestion' HEAD -- . ':!docs/solutions/**' ':!pnpm-lock.yaml'
git ls-tree -r --name-only HEAD
```

The complete tree audit inspected **8,593 text blobs**, excluding binary assets and
the opt-in solutions archive. Only the chat and export tool contain executable
Langfuse integration logic. The primary integration surfaces are:

| Surface                                                                                                                                           | Finding and disposition                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `apps/journeys/src/libs/langfuse/client.ts`                                                                                                       | Replace legacy client; lazy prompt client and isolated OTEL provider, preserving absent-key disablement and environment selection. |
| `apps/journeys/pages/api/chat/index.ts`                                                                                                           | Migrate prompt retrieval, keep label/variable/fallback behavior, create root and generation observations, close before flush.      |
| `tools/langfuse-export/src/clients/langfuse.ts`                                                                                                   | Remove deprecated `GET /traces/{id}`; use enriched observations v2 exclusively.                                                    |
| `package.json`, `pnpm-lock.yaml`                                                                                                                  | Replace unscoped SDK and resolve compatible OTEL peers.                                                                            |
| Chat/client and export specs                                                                                                                      | Preserve existing coverage and add transport/response contracts.                                                                   |
| Export README/run comments, glossary index, legal about-chat page/translations, AiChat session comment, historical plans, load-test documentation | Supporting references; legal copy and historical documents need no API migration.                                                  |

Only this worktree's sparse configuration was widened: export tooling, shared AI,
agent/plan docs, workflow/hooks, scripts/TS7, shared ESLint, and Storybook/test mock dependencies.
Hidden workspace manifests were materialized individually for lock generation.
The primary Core checkout was not changed.

## Tracing and prompt behavior

- `LangfuseClient.prompt.get` retains caching and uses the existing production /
  development label rule. The text-prompt guard, ESV/language compilation, local
  fallback, model routing, and request/feature/card validation remain intact.
- A dedicated `BasicTracerProvider` avoids replacing Next.js/Datadog's global
  provider. Root and generation wrappers use explicit OTEL parent context; each
  request starts its own trace. Only this chat's manually created observations
  enter the provider.
- Root and generation both contain session, trace name, environment, release,
  and explicit `langfuse.observation.metadata.<key>` fields. The root has overall
  request/response I/O; the generation has model, prompt link and token usage.
- Success, synchronous failure, streamed error, and abort finalize both
  observations. Duplicate terminal callbacks cannot overwrite or re-export an
  ended observation. `forceFlush` is awaited for the serverless lifecycle;
  telemetry export failure does not replace the chat response.
- The follow-up rollback removes the browser-disconnect AbortController, close
  listener and pipe/close race added during review. Normal streaming again awaits
  the SDK response pipe directly. Browser disconnect delivery is not guaranteed.
  The previous local disconnect tests did not establish stage ingestion: neither
  the completed nor interrupted synthetic stage chats was found in the inspected
  Langfuse project. Repeat both checks after this rollback deploys; the cause of
  the missing telemetry remains unconfirmed.
- Real export uses `POST /api/public/otel/v1/traces` with Basic authentication,
  SDK name/version headers and an explicit `x-langfuse-ingestion-version: 4`.
  The explicit header is a compatibility guard: supported SDK headers already
  select v4 routing, so its absence alone does **not** prove legacy ingestion.
  See the [custom ingestion contract](https://langfuse.com/integrations/native/opentelemetry/migration-to-v4).
- No separate trace I/O writes, trace mutation after export, dual-send, score,
  evaluator, dataset, or integration configuration changes are introduced.

## Export read contract

[Deprecated API mapping](https://langfuse.com/faq/all/deprecated-api-migration)
replaces trace reads with observations v2. The
[public API field/pagination contract](https://langfuse.com/docs/api-and-data-platform/features/public-api)
requires explicit field groups for I/O, metadata, usage, model, metrics and tags;
default fields alone are insufficient. I/O arrives as strings and is decoded
locally. The removed `parseIoAsJson=true` option is not sent.

The output pipeline's existing trace records are now local projections. Session,
country/language/journey attribution, tags, usage/cost, and synthetic singleton
handling remain intact. Duplicate observation IDs do not inflate totals.
Environment filtering is applied during discovery and rechecked against the
recovered trace context, preserving the previous authoritative trace guard.
Pagination follows every cursor, including an empty intermediate page; malformed
responses, repeating cursors and the safety ceiling fail closed.

The time window selects traces. Each selected trace is then cursor-paged through
v2 using its exact `traceId`, with no time/type restriction. This preserves **all**
generations and root context, including earlier/later turns, original subject,
and token/cost totals. The discovery query is time-bounded; detail queries are
bounded by exact trace ID, as in the documented per-trace v2 lookup.

Historical metadata recovery uses the supported observation root. The baseline
stored journey, country and language on the trace. Langfuse's
[observation backfill](https://github.com/langfuse/langfuse/blob/main/worker/src/backgroundMigrations/backfillEventsFullFromObservations.ts)
excludes that metadata from children, but its
[trace-root backfill](https://github.com/langfuse/langfuse/blob/c83198b03f6b63e7d57c0daf016bb4d3ab052913/worker/src/backgroundMigrations/createRootSpansFromTraces.ts)
retains it on a root observation. The exporter recognizes roots through
`isRootObservation` / parent context, without hardcoding an ID prefix, and asks
for `expandMetadata=journeyId,ipCountry,language,provider,modelId`.

A single recovered root is authoritative when its metadata is an explicit
object, including `{}` for known untagged history. Missing, null, malformed or
non-object root metadata requires consistent context copied to every generation,
as does a rootless current Core trace. Multiple non-generation root candidates stop the export:
ancestry is not verified, so even matching candidates are conservatively rejected
instead of risking another root's journey attribution. If no root or trustworthy consistent
generation context exists, **the entire export fails with the trace ID** rather
than silently breaking journey/tag exclusions or inventing attribution. This
conservative guard also applies without a discriminator. The precise operator
blocker is missing/conflicting v2 context, not an absent journey key on a known
root. An owner must verify trace-root migration completion or use an existing
authorized snapshot. No deprecated fallback or server migration is performed.

The existing `--fixture PATH` mode remains usable with the checked-in synthetic
sample or an already-authorized `{traces, observations, themes?}` snapshot that
retains trace metadata. This is an offline input alternative, not live history
recovery; omit online `--translate` / `--llm-scrub` flags. UI-managed
evaluators/exports were not queried with credentials.

The response decoder preserves unsupported JSON-shaped replies (such as
`[1,2]` and `{"answer":"Yes"}`) as text through mapping and normalization.
Offline regressions verify legacy root-context recovery, a journey discriminator
that still excludes one turn, explicit failure for unrecoverable legacy context,
valid untagged roots, competing roots, missing/malformed root metadata with
generation fallback (including journey/tag exclusions), conflicting generation
context, cross-window paginated
trace completeness, and supported/unsupported I/O shapes.

## Local verification

Run from this worktree with Node 24.21.0 (repository requires Node >=22):

```bash
pnpm exec vitest run --root apps/journeys --config "$PWD/apps/journeys/vitest.config.mts" pages/api/chat src/libs/langfuse --coverage=false
pnpm exec vitest run --config tools/langfuse-export/vitest.config.mts --coverage=false
pnpm tsc7 -p apps/journeys/tsconfig.ts7.json
pnpm exec tsc -p tools/langfuse-export/tsconfig.json --noEmit
pnpm lint:changed --fix
```

Baseline: 68 chat/client tests and 205 export tests passed. Initial Journeys
TS7 check reported two missing `.storybook/preview` imports due to sparse checkout;
after materializing `.storybook`, the unchanged baseline passed. Export baseline
type-check passed. The real wire test checks overlapping request isolation and HTTP 400 delivery
failure as well as complete v4 spans and prompt retrieval. It binds only
`127.0.0.1` with synthetic keys;
export HTTP tests replace fetch. No remote model or Langfuse project is used.

Final local results (all exit 0):

| Check                                                | Outcome                                                                                                                                                                           |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chat/client/wire tests                               | 71 passed across 3 files after disconnect rollback (baseline 68 across 2 files)                                                                                                                             |
| Export tool suite                                    | 238 passed across 12 files (baseline 205)                                                                                                                                         |
| Journeys direct TS7                                  | Passed                                                                                                                                                                            |
| Export direct TypeScript                             | Passed                                                                                                                                                                            |
| `nx affected --target=type-check --base=origin/main` | Passed for all 7 projects visible in this sparse worktree: journeys, journeys-admin, journeys-ui, shared-ai, shared-dev-hosts, shared-ui, shared-ui-dynamic                       |
| `lint:changed --fix`                                 | Formatting, Journeys ESLint and translations passed; export tooling has no workspace ESLint config, so the script explicitly skips its ESLint (format/type/test checks still run) |
| Offline fixture CLI                                  | 13 traces / 20 generations → 12 conversations, 1 load-test turn excluded, 32 facets; zip generated under ignored output directory                                                 |

No remaining code failures were observed. The broad Nx command covers the
materialized sparse graph, not every hidden monorepo project. The first lint run
failed on sparse-hidden `libs/shared/eslint/next.mjs`; materializing that shared
config resolved the environment gap. Test/lint failures during implementation
were fixed before this handoff. Package installation
used `--ignore-scripts` to avoid unrelated native/Prisma workloads. The repository
Husky bootstrap is installed locally before committing, and commit hooks run
normally without `--no-verify`.

## Delivery status (updated 2026-10-28)

The initial review-only delivery restrictions are superseded. PR #9999 is ready
for review and normal CI/staging delivery has been authorized. Subsequent commits
must run CI and the repository's lint/type-check gates; no workflow or provider
configuration changes are part of this migration. Production delivery remains
subject to current-head approval and the repository's normal merge protections.

Jaco confirmed a stage chat appears in Langfuse. That confirms ingestion, but does
not yet establish the full field-level or closed-browser checks below. No
production chat verification has been performed; Jaco will perform that test.

## Verification required before the 2026-11-16 cutover

An authorized project owner must confirm Migration Assistant has no outstanding
legacy evaluators, exports or integrations, and that historical trace-root
backfill is complete for the history needed by exports. These are pre-cutover
prerequisites, not post-cutover follow-up. This audit does not claim they are
complete and does not perform any server migration or production data mutation.

Staging verification uses synthetic messages and a non-production Langfuse
project:

1. Verify the intended prompt label and unchanged ESV/language/fallback behavior.
2. Inspect a successful request: exactly one root plus one generation, matching
   trace ID, correct parent, complete timing, root I/O, prompt name/version,
   model/token usage and metadata on both observations. Filter by session,
   environment, journey, language and country.
3. Close the browser mid-answer and record whether observations arrive and end;
   disconnect delivery is unverified after the rollback. Separately exercise
   provider failure and check error observations and duplicate exports.
   Local tests do not establish Vercel's live behavior.
4. Read the same bounded observations through v2 with every required field group;
   confirm session reconstruction and cost/usage. Run the export against synthetic
   staging data and inspect its offline bundle for full messages and PII scrubbing.
