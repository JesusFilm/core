---
title: 'feat: Langfuse trace-export tool — API integration + sanitised report synthesis'
type: feat
status: completed
date: 2026-05-21
---

# feat: Langfuse trace-export tool — API integration + sanitised report synthesis

## Summary

Build an engineer-run TypeScript CLI at `tools/langfuse-export/` that reads Apologist chat traces + observations from the Langfuse Public API (via the `langfuse` SDK's typed `fetchTraces` / `fetchObservations` methods), joins and groups them into conversations, scrubs free-text user PII, computes deterministic usage stats, and uses an OpenRouter LLM to synthesise a shareable HTML report (with optional Playwright-rendered PDF). The engineer manually uploads the artifact to Google Drive for Aaron. Linear: **NES-1690** (World Cup Readiness), implementing the **NES-1656** export-path spike.

---

## Problem Frame

Aaron wants a post-tournament report on "what are users asking" the Apologist chat. The NES-1656 spike established that Langfuse is the source of truth, but the manual CSV observations export omits the trace-level fields needed to group turns into conversations (`sessionId`), attribute region (`metadata.ipCountry`), and tag (`tags`). The team has no repeatable extraction path and no documented way for an engineer to turn raw traces into a shareable, PII-safe report. This tool is that path.

---

## Requirements

- R1. Extract trace + observation data from the Langfuse Public API for a configurable date window, recovering the trace-level fields (`sessionId`, `metadata`, `tags`) the CSV export drops.
- R2. Reconstruct conversations by joining observations to traces (`traceId`) and grouping by `sessionId`.
- R3. Sanitise free-text user message content — regex PII scrub by default, with an opt-in LLM scrub pass.
- R4. Produce a shareable report: an OpenRouter-synthesised HTML document built on top of code-computed (trustworthy) usage stats, with an optional PDF render.
- R5. Source all credentials from Doppler into a tool-local `.env` (the established `fetch-secrets` pattern), never reused from another workspace or hand-copied.
- R6. Ship an engineer-facing README documenting credential setup and the run procedure.
- R7. Write run artifacts to a gitignored output directory — chat-derived reports must never be committed.

---

## Scope Boundaries

- Manual engineer-run only — no scheduling, CI integration, or hosted dashboard.
- No direct Google Drive upload from the tool — the engineer uploads the artifact manually.
- Global (not per-region) report content in v1 — see Deferred.
- Not a general-purpose Langfuse export library — this is a single-purpose report CLI.

### Deferred to Follow-Up Work

- Per-region report rollups: requires capturing `journeyRegion` on the trace in `apps/journeys/pages/api/chat/index.ts` (separate ticket). This tool consumes only the trace metadata that exists today (`ipCountry`, `journeyId`, `language`).
- Long-form PII / T&Cs strategy and LLM-scrub policy sign-off: stays on **NES-1562**. This covers **both** the opt-in `--llm-scrub` pass **and** the always-on narrative-synthesis call — both send (regex-scrubbed) user content to OpenRouter and cross the same third-party trust boundary, so the policy decision applies equally.
- First-message-flush fix (**NES-1616**) — affects completeness of extracted data but is its own ticket; the report surfaces it as a caveat rather than fixing it.
- Per-environment filtering is **inert until NES-1688 lands**: the chat tracing code sets no `environment` on traces today (verified in `apps/journeys/src/libs/langfuse/client.ts` + `apps/journeys/pages/api/chat/index.ts` — the client is `new Langfuse({ publicKey, secretKey, baseUrl })` and `trace()` passes no `environment`), so there is no value to filter on. Load-test pollution must instead be excluded via a present discriminator — see Key Technical Decisions.

---

## Context & Research

### Relevant Code and Patterns

- `tools/load-test/run-chat.ts` and `tools/scripts/*.ts` — the `tools/` tsx-CLI convention: `pnpm exec tsx <path>`, `process.argv.slice(2)` for args (no arg-parser lib), `node:`-prefixed builtins, `__dirname` (CommonJS via `tools/tsconfig.tools.json`), top-level `main()` with `try/catch → process.exit`.
- `apps/journeys/src/libs/langfuse/client.ts` — Langfuse client construction from `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` / `LANGFUSE_BASE_URL`. The same instance exposes the read methods `fetchTraces` / `fetchObservations`.
- `apps/journeys/pages/api/chat/index.ts` — the only existing OpenRouter usage: `createOpenAICompatible({ name, baseURL: 'https://openrouter.ai/api/v1', apiKey })` from `@ai-sdk/openai-compatible`, env `OPENROUTER_API_KEY`, optional `OPENROUTER_MODEL`. Also the source of trace metadata shape: `metadata: { journeyId, language, ipCountry, provider, modelId }`, trace-level `sessionId`.
- `apps/video-importer/src/env.ts` — repo convention for env loading + validation: `import 'dotenv/config'` then `@t3-oss/env-core` + `zod`.
- App `fetch-secrets` targets in `*/project.json` (e.g. `apps/journeys/project.json`) — the Doppler download pattern: `doppler secrets download --no-file --format=env-no-quotes --project <p> > <dir>/.env`.
- `tools/load-test/results/` + `tools/load-test/README.md` — precedent for run-artifact handling (note: load-test _commits_ perf JSON; this tool deliberately diverges by gitignoring output because reports contain chat-derived content).

### Institutional Learnings

- No applicable `docs/solutions/` entries — Langfuse, Doppler-to-`.env`, OpenRouter, PII scrubbing, and HTML/PDF tooling are all undocumented in the knowledge base. This tool establishes new ground; capture durable decisions via `/ce-compound` once it lands.

### External References

- Langfuse Public API (read side), confirmed against the v3.38.20 SDK + OpenAPI spec:
  - SDK exposes typed methods on the client: `fetchTraces(query?)`, `fetchObservations(query?)`, returning `{ data, meta: { page, limit, totalItems, totalPages } }`. No raw REST/Basic-auth needed — the SDK handles auth from the same env triple.
  - `fetchTraces` query: `page`, `limit`, `fromTimestamp`/`toTimestamp` (ISO 8601, `>=` / `<`), `sessionId`, `userId`, `tags`, `environment`, `orderBy`, `fields`. Trace schema carries `sessionId`, `metadata`, `tags` at trace level (the CSV-missing fields). Pass `fields=core,io` (or omit) so `metadata` is included.
  - `fetchObservations` query: `page`, `limit`, `fromStartTime`/`toStartTime`, `traceId`, `type`, `environment`. (Note the different date param names vs. traces.) **Caution:** list endpoints can return summary records with `input`/`output` truncated or omitted — the spike CSV arrived with `metadata {}` and `tags []` stripped, evidence the read path drops payload by default. The report's entire content depends on observation `input`/`output`, so this must be verified against a live fetch (and a per-observation `fetchObservation(id)` fallback used if the list endpoint truncates).
  - Offset pagination via `page`/`limit`, iterate to `meta.totalPages`. Free/Hobby tier ~100 req/min on the general API — throttle. Pin `orderBy` (e.g. `timestamp.asc`) so a moving window during a multi-page fetch does not skip or double-count rows.
- OpenRouter: `POST https://openrouter.ai/api/v1/chat/completions`, `Authorization: Bearer $OPENROUTER_API_KEY`, optional `HTTP-Referer` / `X-Title` headers. Cheap+capable model ids (2026): `google/gemini-2.5-flash-lite` (cheapest), `google/gemini-2.5-flash`. Exact `openai/*-mini` slug should be verified against `GET /api/v1/models` rather than hardcoded.
- Playwright (`playwright@1.59.1`, root devDependency) — `page.pdf()` for headless HTML→PDF; no existing precedent in repo but the dependency is present.

---

## Key Technical Decisions

- **Use the `langfuse` SDK read methods, not raw REST.** `fetchTraces`/`fetchObservations` are typed, already authenticate from the `LANGFUSE_*` env triple, and match existing repo usage. Rationale: less code, no hand-rolled Basic-auth header, reuses the dependency already at `package.json` `langfuse@^3.38.20`.
- **Drive the join from traces, fetch observations by `traceId`.** Page traces in the window (for `sessionId`, `metadata`, `tags`, timestamp), then fetch their observations by `traceId` (for per-generation `input`/`output`, `model`, token usage, cost, latency). Rationale: traces and observations use different date params (`fromTimestamp`/`toTimestamp` vs `fromStartTime`/`toStartTime`); fetching both as independent date windows lets a turn land one side in-window and the other out, silently breaking the join at window boundaries and inflating orphaned single-turn "conversations." Anchoring on traces gives one window definition. Still robust if a trace ever carries multiple generations.
- **Load-test pollution is excluded by a present discriminator, not `--environment`.** Because `environment` is unwritten until NES-1688 (see Scope Boundaries), v1 filters load-test traffic on a field that exists today: a recognised load-test message pattern, a known `metadata.journeyId`, or a tag the load harness sets. The chosen discriminator is configurable; the report always surfaces the excluded share so the consumer can see how much was filtered. Rationale: the spike sample was 92% load probes — without a working filter the report is a polished rendering of test noise.
- **LLM labels and groups; code computes numbers and renders excerpts verbatim.** The OpenRouter LLM emits only theme labels and group assignments (which conversation maps to which theme); all counts, costs, latencies, histograms **and the example-excerpt text itself** are produced deterministically in code and templated into the final HTML. Rationale: an LLM handed raw text to "quote" can paraphrase a user into words they never said, stitch fragments from different users into one fabricated question, or surface a residual PII fragment regex missed. Restricting it to labels/grouping keeps every user-attributed quote code-controlled while still letting it "synthesise the report" per the request — numbers and quotes both stay out of the model's hands, only the thematic prose is the LLM's.
- **Regex scrub by default; LLM scrub opt-in (`--llm-scrub`).** Rationale: regex is deterministic, free, and offline; the LLM pass catches free-text disclosures (e.g. "my name is …") but costs tokens and needs the NES-1562 policy decision before it's relied on. Default-safe, opt-in-powerful.
- **Sanitisation is enforced at the type level, not by convention.** `sanitize.ts` returns a branded `SanitisedConversation[]` (a nominal type only its module can construct), and `synthesizeThemes` / `report.ts` accept only that type. Rationale: the "samples are already sanitised before they reach OpenRouter" guarantee is otherwise just prose — a future edit could feed raw `Conversation[]` to the network call and leak free-text PII across the trust boundary. A branded type makes that a compile error.
- **`import 'dotenv/config'`-style loading from a tool-local `.env`, loaded by explicit path.** `dotenv` is the repo convention (`tsx --env-file` has zero precedent). Because the CLI is invoked from repo root, load with an explicit `{ path }` resolved to `tools/langfuse-export/.env` rather than relying on cwd. Rationale: keeps secrets tool-local (R5) while honoring the repo's dotenv convention.
- **Doppler home = `core` project, `dev` config.** Mirrors `reset-stage`'s repo-tooling-secret precedent. A single new `OPENROUTER_API_KEY` plus the existing `LANGFUSE_*` triple seeded there. Rationale: avoids creating a new Doppler project; engineer-local scope only (no prod token).
- **Gitignore the output directory.** `tools/langfuse-export/output/` is added to `.gitignore` — deliberately diverging from load-test's commit-the-results model because reports contain (even scrubbed) chat-derived content. Rationale: R7, PII safety.
- **Pure-logic modules are unit-tested via a tool-local vitest config; I/O modules are manually integration-tested.** Sanitisation correctness is security-relevant and must be tested; Langfuse/OpenRouter/Playwright calls hit external services and are verified by a documented manual run. Rationale: test the parts where bugs cause PII leakage or wrong numbers; don't mock external APIs into brittle tests.

---

## Open Questions

### Resolved During Planning

- Raw REST vs. SDK for reads → SDK (`fetchTraces`/`fetchObservations`).
- Env loader → `dotenv` with explicit path (repo convention; no `tsx --env-file` precedent).
- PDF renderer → Playwright (already a root devDependency).
- Where reports are stored → gitignored `output/<run-id>/`.

### Deferred to Implementation

- Exact default OpenRouter model id — verify the current cheapest suitable slug against `GET /api/v1/models` at implementation time; default to `google/gemini-2.5-flash-lite` unless a better current option exists. Overridable via `--model` / `OPENROUTER_MODEL`.
- Exact throttle interval for pagination — tune to stay under the ~100 req/min Hobby-tier ceiling once real page counts are observed.
- Whether `fields=core,io` or default field set best balances payload size vs. completeness — confirm against a live fetch.
- **Observation `input`/`output` shape** — the live `fetchObservations`/`fetchObservation` payload must be inspected before `normalize.ts` is built. The chat handler logs `input: convertToModelMessages(...)` (AI-SDK `ModelMessage[]`) and `output` as a plain string, which differs from the spike CSV's `[{ role, content: [{ type:'text', text }] }]` shape. Confirm the real shape and key the parser + its fixture to a captured observation.
- **Does the observations list endpoint populate `input`/`output`?** If it returns truncated summary records, switch to per-`traceId` `fetchObservation(id)` calls. Verify before relying on list-only fetches.
- **Is `sessionId` reliably minted for real users?** It is `.optional()` in the request schema and absent from the spike data. If most prod traces lack it, grouping-by-`sessionId` yields mostly singletons — answer against live data before trusting the conversation-length metric.
- **Which field actually distinguishes load-test traffic** now that `environment` is unwritten — identify the concrete discriminator (message pattern / journeyId / tag) the load harness leaves.

---

## Output Structure

    tools/langfuse-export/
      run.ts                    # CLI entry: arg parsing + pipeline orchestration
      fetch-env.sh              # convenience: doppler secrets download -> .env
      .env.example              # documents required keys (no values)
      vitest.config.mts         # tool-local test config for pure modules
      tsconfig.json             # extends tsconfig.tools.json; target es2021 for typecheck
      README.md                 # credentials + execution docs
      src/
        env.ts                  # dotenv load (explicit path) + zod validation
        langfuse.ts             # fetchTraces + per-traceId fetchObservations + pagination
        normalize.ts            # join obs->trace, group by sessionId -> Conversation[]
        sanitize.ts             # regex PII scrub (pure) -> SanitisedConversation[]; injected llmScrub
        aggregate.ts            # deterministic usage stats (pure)
        openrouter.ts           # OpenRouter client + theme/group synthesis + llmScrub primitive
        report.ts               # assemble final HTML: code-rendered stats + excerpts + LLM labels
        pdf.ts                  # optional Playwright HTML->PDF
        types.ts                # shared record/report types (incl. branded SanitisedConversation)
      output/                   # gitignored — per-run artifacts
        <run-id>/
          report.html
          report.pdf            # only when --pdf
          records.ndjson        # only when --debug; one sanitised turn per line (schema in types.ts)

---

## High-Level Technical Design

> _This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce._

```
                   ┌──────────────────────────────────────────────┐
   Doppler ──────► tools/langfuse-export/.env  (LANGFUSE_*, OPENROUTER_*)
 (core/dev)        └──────────────────────────────────────────────┘
                                     │ env.ts (dotenv + zod)
                                     ▼
   --days/--from/--to/--discriminator ─┐
                                       ▼
   langfuse.ts ── fetchTraces (window, paginated, throttled, orderBy pinned)
              └── then fetchObservations BY traceId ──┐
                                                      ▼
   normalize.ts:  observations attached to their trace  →  group by sessionId
                  → Conversation[] { sessionId?, region/ipCountry, turns[] }
                  (exclude load-test via discriminator; flag null-session share)
                                      │
                                      ▼
   sanitize.ts:   regexScrub(userText) [+ injected llmScrub] → SanitisedConversation[]
                                      │  (only this branded type flows onward)
              ┌───────────────────────┴───────────────────────┐
              ▼                                                ▼
   aggregate.ts (pure):                          openrouter.ts:
   counts, cost, latency p50/p95/p99,            synthesizeThemes(stats, sanitised)
   conv-length histogram, top questions          → theme labels + group assignments
   (top-questions gated on real-session)             (NO excerpt text emitted)
              └───────────────────────┬───────────────────────┘
                                      ▼
   report.ts: assemble report.html
     - code renders stats + excerpt TEXT verbatim from sanitised records
     - LLM theme labels/grouping injected as a labelled "AI-grouped" section
                                      ▼
   run.ts: write output/<run-id>/report.html  [+ report.pdf when --pdf]
           [+ records.ndjson when --debug]
                                      ▼
        engineer → upload report.html/.pdf to Drive (direct-share to Aaron)
```

Pipeline contract: numbers **and** user-attributed excerpt text always come from code (`aggregate.ts` / `report.ts`); the LLM contributes only theme labels and group assignments. Only the branded `SanitisedConversation[]` reaches `openrouter.ts`. If the LLM call fails, `report.ts` still emits a valid stats-plus-verbatim-excerpts HTML report (graceful degradation) — just without thematic grouping.

---

## Implementation Units

- U1. **Scaffold, env loading, Doppler fetch, gitignore, test config**

**Goal:** Stand up the tool directory, tool-local secret loading, the Doppler fetch convenience, the output gitignore, and the vitest config so later units have a runnable, testable shell.

**Requirements:** R5, R7

**Dependencies:** None

**Files:**

- Create: `tools/langfuse-export/src/env.ts`
- Create: `tools/langfuse-export/src/types.ts`
- Create: `tools/langfuse-export/fetch-env.sh`
- Create: `tools/langfuse-export/.env.example`
- Create: `tools/langfuse-export/vitest.config.mts`
- Create: `tools/langfuse-export/tsconfig.json`
- Modify: `.gitignore` (add `tools/langfuse-export/output/`)
- Test: `tools/langfuse-export/src/env.spec.ts`

**Approach:**

- `env.ts`: load `.env` with `dotenv` using an explicit path resolved relative to the tool dir (not cwd), then validate `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_BASE_URL`, `OPENROUTER_API_KEY` (+ optional `OPENROUTER_MODEL`) with zod. Throw a clear, actionable error naming the missing key and pointing at `fetch-env.sh` when validation fails.
- `fetch-env.sh`: wrap `doppler secrets download --no-file --format=env-no-quotes --project core --config dev > tools/langfuse-export/.env`. Mirror the app `fetch-secrets` invocation shape.
- `.env.example`: list the four keys with empty values + a one-line comment each, plus a `# DO NOT COMMIT — delete tools/langfuse-export/.env after use` header. Committed; the real `.env` is gitignored.
- `types.ts`: shared types — `TraceRecord`, `ObservationRecord`, `ConversationTurn`, `Conversation`, `ReportStats`, and a **branded `SanitisedConversation`** (nominal type only `sanitize.ts` can construct, so the network/synthesis path cannot accept raw `Conversation[]`). Defined here so later units share one contract.
- `vitest.config.mts`: minimal config scoped to `tools/langfuse-export/**/*.spec.ts`, `globals: true`, coverage off.
- `tsconfig.json`: extends `tools/tsconfig.tools.json` but overrides `target` to `es2021` (matching the base lib) so Map/Set iteration in `normalize.ts`/`aggregate.ts` typechecks. The base `tools/tsconfig.tools.json` is `target: es5` with no `downlevelIteration`, under which `npx tsc -p tools/tsconfig.tools.json` already errors today (TS2802) — see Risks. Manual typecheck command becomes `tsc -p tools/langfuse-export/tsconfig.json --noEmit`.

**Patterns to follow:**

- `apps/video-importer/src/env.ts` (dotenv + zod validation shape).
- App `fetch-secrets` targets in `*/project.json` for the exact Doppler command flags.

**Test scenarios:**

- Happy path: with all required vars set, `env.ts` returns a typed config object with the expected values.
- Error path: a missing `LANGFUSE_SECRET_KEY` throws an error whose message names the missing key.
- Error path: a missing `OPENROUTER_API_KEY` throws naming that key.
- Edge case: `OPENROUTER_MODEL` absent → config exposes the documented default, not `undefined`.

**Verification:**

- `bash tools/langfuse-export/fetch-env.sh` produces `tools/langfuse-export/.env`; `git check-ignore tools/langfuse-export/.env tools/langfuse-export/output/` confirms both are ignored (don't assume the bare-`.env` rule reaches the nested path — verify, and add an explicit `.gitignore` line if it doesn't).
- `npx vitest run --config tools/langfuse-export/vitest.config.mts` runs and `env.spec.ts` passes.
- `npx tsc -p tools/langfuse-export/tsconfig.json --noEmit` typechecks clean (the es2021 override is what makes this pass; the base tools tsconfig does not).

---

- U2. **Langfuse extraction + conversation normalisation**

**Goal:** Fetch traces and observations for a date window via the SDK, paginate fully, join observations to traces by `traceId`, and group by `sessionId` into ordered conversations.

**Requirements:** R1, R2

**Dependencies:** U1

**Files:**

- Create: `tools/langfuse-export/src/langfuse.ts`
- Create: `tools/langfuse-export/src/normalize.ts`
- Test: `tools/langfuse-export/src/normalize.spec.ts`

**Approach:**

- `langfuse.ts`: construct the SDK client from validated env (mirror `apps/journeys/src/libs/langfuse/client.ts`). Expose `fetchAllTraces(window, opts)` that pages `fetchTraces` until `meta.totalPages` with `orderBy` pinned (e.g. `timestamp.asc`), then `fetchObservationsForTraces(traceIds)` that fetches observations **by `traceId`** — not by an independent date window (see Key Technical Decisions). Request the field set that includes `input`/`output`; if the list endpoint returns them truncated, fall back to per-id `fetchObservation(id)`. Insert a small delay between pages to stay under the ~100 req/min ceiling.
- `normalize.ts` (pure): build a `Map<traceId, TraceRecord>`, attach each observation to its trace, extract the latest user message text + assistant reply from the observation `input`/`output`. **The exact `input`/`output` shape must be verified against a live observation before coding** — the chat handler logs AI-SDK `ModelMessage[]` from `convertToModelMessages(...)` and a plain-string `output`, which differs from the spike CSV's content-parts shape (see Open Questions). Group resulting turns by `sessionId` (synthetic per-trace id when null), order by start time, and **exclude load-test traffic via the configured discriminator**.
- Carry trace `metadata.ipCountry`, `metadata.journeyId`, `metadata.language`, and `tags` onto each conversation. Track the count of null-`sessionId` traces and single-turn conversations so `aggregate.ts` can report grouping fidelity.

**Execution note:** Capture one real trace + its observations from a live fetch before building `normalize.ts`; key the parser and its fixture spec to the captured shape rather than the spike-CSV assumption.

**Patterns to follow:**

- `apps/journeys/src/libs/langfuse/client.ts` (client construction).
- The chat handler's generation `input` is `convertToModelMessages(...)` output (AI-SDK `ModelMessage[]`) and `output` a plain string — confirm the live shape; do **not** assume the spike CSV's `[{ role, content: [{ type:'text', text }] }]` content-parts shape.

**Test scenarios:**

- Happy path: two observations sharing a `sessionId` across two traces group into one conversation with two ordered turns.
- Happy path: latest user message extraction returns the last `role:'user'` text from a captured-shape `input` fixture.
- Edge case: observation whose trace is missing from the trace map is retained as a single-turn conversation (no crash) and flagged.
- Edge case: trace with `sessionId: null` produces a standalone conversation keyed by a synthetic id rather than collapsing all null-session traces together.
- Edge case: null-`sessionId` count and single-turn count are tracked and surfaced (feeds the grouping-fidelity stat in U4).
- Edge case: a turn matching the load-test discriminator is excluded from conversations and counted in the excluded tally.
- Edge case: empty input arrays / missing `output` produce empty-string fields, not exceptions.
- Edge case: turns within a conversation are ordered by start time even when fetched out of order.

**Verification:**

- Against a fixture set of traces+observations, `normalize` returns the expected conversation grouping, turn ordering, discriminator exclusion, and null-session/single-turn counts; `normalize.spec.ts` passes.

---

- U3. **Sanitisation layer**

**Goal:** Scrub free-text user content of obvious PII deterministically, with an opt-in LLM scrub pass for free-text disclosures.

**Requirements:** R3

**Dependencies:** U2 (consumes `Conversation[]`). No import dependency on U4 — the `llmScrub` callback is injected by `run.ts` (U5).

**Files:**

- Create: `tools/langfuse-export/src/sanitize.ts`
- Test: `tools/langfuse-export/src/sanitize.spec.ts`

**Approach:**

- `regexScrub(text)` (pure): replace emails, phone numbers (intl + leading-zero national), URLs, and explicit declarations (`my name is X`, `I'm X`, `I live in X`, `I'm from X`) with stable redaction tokens (e.g. `[redacted-email]`). Applied to user turns only — never to assistant replies.
- `sanitize(conversations, llmScrub?)`: runs `regexScrub` over every user turn and returns a **branded `SanitisedConversation[]`** (never mutates source records). The optional `llmScrub` is an **injected callback**, not a direct import of `openrouter.ts`, so `sanitize.ts` stays import-pure and unit-testable without the network; `run.ts` wires the real `llmScrub` from `openrouter.ts` only when `--llm-scrub` is set.
- The branded type is the enforcement point: only `sanitize.ts` can construct `SanitisedConversation`, so `aggregate.ts` / `openrouter.ts` / `report.ts` cannot compile against raw `Conversation[]` — the "samples are sanitised before any LLM call" guarantee is type-checked, not conventional.

**Patterns to follow:**

- Keep `regexScrub` pure and synchronous for testability; isolate the network call behind the injected `llmScrub` callback.

**Test scenarios:**

- Happy path: an email, an intl phone number, and a URL in one message are each replaced with their redaction tokens.
- Happy path: `"my name is Sarah"` → name token; surrounding text preserved.
- Happy path: `sanitize` returns a `SanitisedConversation[]` (branded) — a raw `Conversation[]` does not satisfy the downstream signatures (type-level check).
- Edge case: assistant replies are passed through untouched even when they contain an email-like string.
- Edge case: message with no PII is returned byte-identical.
- Edge case: multiple matches of the same type in one message are all redacted.
- Edge case: when no `llmScrub` callback is injected (default run), the network is never touched; when a stub callback is injected, it is invoked once per user turn.

**Verification:**

- `sanitize.spec.ts` passes; a manual `--llm-scrub` run on a fixture removes a planted free-text disclosure regex missed.

---

- U4. **Aggregation + OpenRouter narrative synthesis + HTML assembly**

**Goal:** Compute deterministic usage stats in code, have the LLM synthesise a qualitative narrative, and assemble the final HTML report from both.

**Requirements:** R4

**Dependencies:** U3

**Files:**

- Create: `tools/langfuse-export/src/aggregate.ts`
- Create: `tools/langfuse-export/src/openrouter.ts`
- Create: `tools/langfuse-export/src/report.ts`
- Test: `tools/langfuse-export/src/aggregate.spec.ts`

**Approach:**

- `aggregate.ts` (pure): from `SanitisedConversation[]` + their observations, compute totals, per-model / per-day breakdowns, total + per-day cost, latency p50/p95/p99/max, conversation-length histogram, and grouping-fidelity figures (null-`sessionId` share, single-turn share, load-test-excluded share). Top-N user questions is computed **only over real-session, length>1 conversations** (and labelled with included/excluded counts) so repeated load-test prompts can't dominate the headline "what are users asking" answer. Returns a `ReportStats` object.
- `openrouter.ts`: build the client mirroring `apps/journeys/pages/api/chat/index.ts` (`createOpenAICompatible` + `ai`'s `generateText`, non-streaming) with `OPENROUTER_API_KEY` and model from config/`--model`. Expose `synthesizeThemes(stats, sanitised: SanitisedConversation[])` returning **theme labels + group assignments only** (e.g. `{ themes: [{ label, conversationIds }] }`) — never excerpt text. Also exports the `llmScrub` primitive that `run.ts` injects into `sanitize.ts`.
- `report.ts`: assemble `report.html` from a deterministic template — stats tables/figures rendered in code; example-excerpt **text rendered verbatim by code from the sanitised records** under each LLM-assigned theme label, in a clearly-labelled "AI-grouped themes (labels machine-generated; quotes verbatim)" section. If `synthesizeThemes` throws, render stats + verbatim excerpts without thematic grouping and include a visible note.

**Patterns to follow:**

- `apps/journeys/pages/api/chat/index.ts` for the OpenRouter `createOpenAICompatible` setup and env var names.

**Test scenarios:**

- Happy path: fixture conversations produce expected totals, per-model counts, and total cost.
- Happy path: latency percentiles computed correctly for a known set (p50/p95 land on expected values).
- Happy path: grouping-fidelity figures (null-session share, single-turn share, excluded-load-test share) are present in `ReportStats`.
- Edge case: empty conversation set yields a zeroed `ReportStats` (no division-by-zero, no NaN).
- Edge case: top-questions is computed only over real-session length>1 conversations — a fixture dominated by repeated single-turn probes does not surface those probes in top-N, and the included/excluded counts are reported.
- Integration: `report.ts` renders excerpt text verbatim from the sanitised records (a theme's excerpts byte-match the source); only the LLM-supplied label is injected, never the quote text.
- Integration: when `synthesizeThemes` is stubbed to throw, the HTML still renders with stats + verbatim excerpts and a degradation note. (LLM network call itself is verified manually, not unit-tested.)

**Verification:**

- `aggregate.spec.ts` passes; `report.ts` renders an HTML file whose figures match `aggregate` output and whose excerpts byte-match the sanitised source; forced-theme-failure path still yields a complete report.

---

- U5. **CLI orchestration, output writing, optional PDF**

**Goal:** Wire the pipeline behind a single CLI entry with flags, write run artifacts to a timestamped gitignored folder, and optionally render a PDF.

**Requirements:** R4, R7

**Dependencies:** U2, U3, U4

**Files:**

- Create: `tools/langfuse-export/run.ts`
- Create: `tools/langfuse-export/src/pdf.ts`

**Approach:**

- `run.ts`: parse `process.argv.slice(2)` for `--days N` (default 14), `--from` / `--to`, `--discriminator` (load-test exclusion config), `--llm-scrub`, `--pdf`, `--model`, `--debug`; resolve the window; orchestrate fetch (traces → observations by `traceId`) → normalize (with discriminator exclusion) → sanitise (regex always; inject `openrouter.ts`'s `llmScrub` callback only under `--llm-scrub`) → aggregate → `synthesizeThemes` → assemble; write `output/<run-id>/report.html`, optionally `report.pdf` (via `pdf.ts` when `--pdf`), and `records.ndjson` only under `--debug`; print the output path. `<run-id>` is a timestamp (+ optional label). Mirror the load-test entry shape (no-arg prints usage). (`--environment` is intentionally **not** a flag — it is inert until NES-1688; load-test exclusion is `--discriminator`.)
- `pdf.ts`: when `--pdf`, launch Playwright Chromium, load the generated `report.html` from disk, `page.pdf()` to `report.pdf`. Isolated so the Playwright import is only paid when `--pdf` is used. Chromium is a separate one-time install (`pnpm exec playwright install chromium`) — catch the missing-executable error and print that exact remediation command rather than a raw stack trace.
- Validate mutually-exclusive / malformed args (e.g. `--days` together with `--from/--to`) with a clear error.

**Patterns to follow:**

- `tools/load-test/run-chat.ts` (argv parsing, `main()`/`try`/`catch`, usage-on-no-args, `node:fs`/`node:path`).

**Test scenarios:**

- Happy path: `--days 7` resolves to a window of `now-7d → now`.
- Edge case: passing both `--days` and `--from` errors with a clear message.
- Edge case: invalid `--from` date string errors rather than producing an invalid window.
- Edge case: `records.ndjson` is written only when `--debug` is passed; a default run writes only `report.html` (+ `report.pdf` with `--pdf`).
- Edge case: no args prints usage and exits non-zero.
- Test expectation: pipeline orchestration and Playwright PDF are verified by the documented manual end-to-end run, not unit tests (they depend on live Langfuse/OpenRouter/Chromium).

**Verification:**

- A manual run against the configured Langfuse project produces `output/<run-id>/report.html` (and `report.pdf` with `--pdf`); `output/` does not appear in `git status`. With `--pdf` on a machine lacking Chromium, the tool prints the `playwright install chromium` remediation rather than crashing.

---

- U6. **README — credentials and execution**

**Goal:** Document credential setup (Doppler) and the run procedure so any engineer can produce the report and share it with Aaron.

**Requirements:** R6

**Dependencies:** U1, U5

**Files:**

- Create: `tools/langfuse-export/README.md`

**Approach:**

- Sections: purpose + relation to NES-1690/NES-1656; one-time `doppler secrets set` to seed `OPENROUTER_API_KEY` (and confirm the `LANGFUSE_*` triple) into `core/dev`; `fetch-env.sh` to materialise `.env`; one-time `pnpm exec playwright install chromium` (only needed for `--pdf`); run commands with every flag; output layout; the manual Drive step — **upload only `report.html` (and `report.pdf`); never upload `records.ndjson`**, and **share the file directly with Aaron's address rather than link-sharing**, so other Drive collaborators can't reach it.
- Secrets hygiene: instruct engineers to **delete `tools/langfuse-export/.env` after the run** (it holds the live `LANGFUSE_SECRET_KEY` + `OPENROUTER_API_KEY`); never leave it on disk between uses.
- Caveats section: regex scrub is best-effort (not a PII guarantee); `--llm-scrub` **and** the always-on theme-synthesis call both send (scrubbed) content to OpenRouter — pending NES-1562 sign-off and an OpenRouter data-retention/no-training check before the first production run; report is global until `journeyRegion` is captured; there is no `--environment` flag because env is unwritten until NES-1688 (use `--discriminator`); single-turn conversations may be under-counted until NES-1616. **Data-readiness:** a run today is ~92% load-test traffic and largely null-session — treat current-data reports as pipeline validation, not a share-worthy artifact for Aaron, until NES-1688/NES-1616 land or a reliable discriminator is configured. PII warning: output is gitignored — do not commit, do not paste raw chat content into shared tools.

**Patterns to follow:**

- `tools/load-test/README.md` (layout, install, run, caveats structure).

**Test scenarios:**

- Test expectation: none — documentation. Verified by following the README end-to-end during the U5 manual run.

**Verification:**

- A reader can go from zero to a generated report using only the README.

---

## System-Wide Impact

- **Interaction graph:** Standalone CLI under `tools/`. No runtime app imports it; not wired into Nx targets or CI. Reads from Langfuse + OpenRouter (egress only). Blast radius is the tool directory plus one `.gitignore` line.
- **Error propagation:** External-call failures (Langfuse pagination, OpenRouter synthesis, Playwright) should fail loudly to the CLI with actionable messages; the report-synthesis path degrades gracefully (stats-only HTML) rather than aborting a completed extraction.
- **State lifecycle risks:** Output is per-run and gitignored; no shared state, no DB, no migrations. Re-runs are idempotent per `<run-id>`.
- **Unchanged invariants:** Does not touch `apps/journeys/pages/api/chat/index.ts` or the live tracing path — read-only consumer of existing trace data. No change to what is captured at request time.

---

## Risks & Dependencies

| Risk                                                                                                                                    | Mitigation                                                                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Regex scrub misses free-text PII (e.g. the long personal disclosure seen in the spike data)                                             | Document explicitly that regex is best-effort; offer `--llm-scrub`; gitignore output; README warns against pasting raw content into shared tools. Full policy is NES-1562.                                                 |
| LLM fabricates or leaks — in figures **or quotes**                                                                                      | Numbers and user-attributed excerpt text are code-rendered from sanitised records; the LLM emits only theme labels + group assignments, clearly marked "AI-grouped (labels machine-generated; quotes verbatim)".           |
| (regex-scrubbed) chat content sent to OpenRouter for theme synthesis / `--llm-scrub` may be retained or trained on                      | Verify OpenRouter data-processing terms before the first production run; set a no-logging/no-training header if available; the NES-1562 deferral explicitly covers this always-on path, not just `--llm-scrub`.            |
| Langfuse Hobby-tier rate limit (~100 req/min) on large windows                                                                          | Throttle between pages; pin `orderBy` against insertion during pagination; default to a 14-day window; document tuning.                                                                                                    |
| Load-test traffic pollutes the report (255/277 rows in the spike sample were load probes)                                               | `--environment` is **inert** until NES-1688 writes the field — exclude load-test via a present `--discriminator` (message pattern / journeyId / tag) instead; surface the excluded share in stats so pollution is visible. |
| Conversation grouping degrades when `sessionId` is absent (`.optional()` in the schema; the join can also orphan turns at window edges) | Drive the join from traces (one window); report null-session and single-turn shares so grouping fidelity is visible; gate top-questions on real-session length>1.                                                          |
| v1 may render polished output over unrepresentative data                                                                                | README data-readiness note: current-data reports are pipeline validation only, not share-worthy for Aaron, until NES-1688/NES-1616 land or a reliable discriminator is configured.                                         |
| `tools/` has no CI lint/typecheck, and `tsc -p tools/tsconfig.tools.json` already fails today (TS2802 on the es5 target)                | Provide tool-local vitest for pure modules; add `tools/langfuse-export/tsconfig.json` (target es2021) and document `tsc -p tools/langfuse-export/tsconfig.json --noEmit`.                                                  |
| Reports contain chat-derived content                                                                                                    | Output gitignored; upload only `report.html`/`.pdf` (never `records.ndjson`); direct-share to Aaron, not link-sharing; delete `.env` after use.                                                                            |

---

## Documentation / Operational Notes

- After the tool lands, capture the durable decisions (Langfuse SDK read pattern, Doppler-to-`.env` flow, PII scrub approach, OpenRouter client setup, Playwright PDF) via `/ce-compound` — there is no prior `docs/solutions/` precedent for any of these.
- Append the export-path decision outcome to the NES-1656 spike write-up referenced in that ticket.

---

## Sources & References

- Linear: NES-1690 (this work), NES-1656 (export-path spike), NES-1562 (PII/anonymisation), NES-1688 (env bucketing), NES-1616 (first-message flush), NES-1577 (per-region insights, Ideal).
- Related code: `apps/journeys/pages/api/chat/index.ts`, `apps/journeys/src/libs/langfuse/client.ts`, `apps/video-importer/src/env.ts`, `tools/load-test/run-chat.ts`, app `*/project.json` `fetch-secrets` targets.
- External: Langfuse Public API / SDK read methods (`fetchTraces`/`fetchObservations`), OpenRouter chat-completions API, Playwright `page.pdf()`.
