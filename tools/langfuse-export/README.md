# tools/langfuse-export

Engineer-run CLI that pulls Apologist chat traces from the **Langfuse Public API**, scrubs free-text PII, computes usage stats, and synthesises a shareable HTML report (optional PDF). The engineer uploads the report to Google Drive and shares it with Aaron.

Built for **NES-1690**, implementing the **NES-1656** export-path spike. The manual CSV observations export drops the trace-level fields needed to group turns into conversations (`sessionId`), attribute country (`metadata.ipCountry`), and tag — this tool reads those from the API instead.

> **Read the caveats below before sharing any report.** A run against today's data is dominated by load-test traffic and largely null-session — treat current-data reports as pipeline validation, not a share-worthy artifact, until NES-1688 / NES-1616 land.

## Layout

The layout splits on the boundary that matters here: **`pipeline/`** holds pure, unit-tested transforms; **`clients/`** holds the external-I/O modules (network/browser) verified by a manual run. Only sanitised `pipeline/` output crosses into `clients/openrouter`, enforced by the branded `SanitisedConversation` type.

```text
tools/langfuse-export/
  run.ts                # CLI entry: argv -> pipeline orchestration
  fetch-env.sh          # doppler secrets download -> .env
  .env.example          # required keys (no values)
  vitest.config.mts     # tool-local test config (pure modules)
  tsconfig.json         # extends tools/tsconfig.tools.json; target es2021
  src/
    env.ts              # dotenv (explicit path) + zod validation
    types.ts            # shared types incl. branded SanitisedConversation
    cli.ts              # pure arg/window/discriminator parsing
    clients/            # external I/O — verified by the manual run, not unit tests
      langfuse.ts       #   fetchTraces + per-traceId fetchObservations
      openrouter.ts     #   OpenRouter client + theme synthesis + llmScrub
      pdf.ts            #   optional Playwright HTML->PDF
    pipeline/           # pure transforms — unit tested
      normalize.ts      #   join obs->trace, group by sessionId -> Conversation[]
      sanitize.ts       #   regex PII scrub -> SanitisedConversation[]; injected llmScrub
      aggregate.ts      #   deterministic usage stats
      report.ts         #   HTML: code-rendered stats + verbatim excerpts + LLM labels
  output/               # gitignored — per-run artifacts (chat-derived; never commit)
```

## Credentials (one-time setup)

Secrets live in the Doppler **`journeys`** project, **`dev`** config — the chat app already uses all four there, so nothing needs seeding. Four keys are required:

| Key                   | Notes                                             |
| --------------------- | ------------------------------------------------- |
| `LANGFUSE_PUBLIC_KEY` | Langfuse project public key (`pk-lf-...`)         |
| `LANGFUSE_SECRET_KEY` | Langfuse project secret key (`sk-lf-...`)         |
| `LANGFUSE_BASE_URL`   | region host, e.g. `https://us.cloud.langfuse.com` |
| `OPENROUTER_API_KEY`  | OpenRouter API key (`sk-or-...`)                  |

If a key is ever missing from `journeys/dev`, seed it once:

```sh
doppler secrets set OPENROUTER_API_KEY --project journeys --config dev
```

Then materialise the tool-local `.env` (requires `doppler login`):

```sh
bash tools/langfuse-export/fetch-env.sh
```

This writes `tools/langfuse-export/.env` (gitignored). **Delete it when you're done — it holds live secrets.**

For `--pdf`, install the Chromium browser binary once:

```sh
pnpm exec playwright install chromium
```

## Run

```sh
# Last 14 days (default), exclude load-test traffic, HTML report:
pnpm exec tsx tools/langfuse-export/run.ts --days 14

# Explicit window + PDF:
pnpm exec tsx tools/langfuse-export/run.ts --from 2026-06-11 --to 2026-07-14 --pdf

# Include everything (no load-test exclusion) + extra LLM scrub pass:
pnpm exec tsx tools/langfuse-export/run.ts --days 7 --discriminator none --llm-scrub
```

Running with no arguments prints usage.

### Flags

| Flag                  | Meaning                                                                                                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--days N`            | Window = last N days (default 14). Mutually exclusive with `--from`/`--to`.                                                                                                                                                     |
| `--from ISO --to ISO` | Explicit window (both required together).                                                                                                                                                                                       |
| `--discriminator V`   | Load-test exclusion: `default` (exclude known probes), `none`, `message:<regex>`, `journey:<csv>`, `tag:<csv>`. **There is no `--environment` flag** — env is unwritten on traces until NES-1688, so it cannot filter anything. |
| `--llm-scrub`         | Extra LLM PII scrub pass (pending NES-1562 sign-off).                                                                                                                                                                           |
| `--pdf`               | Also render `report.pdf` (needs `playwright install chromium`).                                                                                                                                                                 |
| `--model ID`          | OpenRouter model id (default `google/gemini-2.5-flash-lite`).                                                                                                                                                                   |
| `--throttle MS`       | Delay between Langfuse calls (default 700ms; keep under the ~100 req/min Hobby ceiling).                                                                                                                                        |
| `--debug`             | Also write `records.ndjson` (one sanitised turn per line). **Debug artifact — never upload to Drive.**                                                                                                                          |

## Output

Each run writes `tools/langfuse-export/output/<timestamp>/`:

- `report.html` — the deliverable.
- `report.pdf` — only with `--pdf`.
- `records.ndjson` — only with `--debug`; sanitised per-turn records for inspection.

`output/` is gitignored.

## Share with Aaron

1. Upload **only `report.html`** (and `report.pdf` if rendered) to Google Drive — **never `records.ndjson`**.
2. Share the file **directly with Aaron's email address**, not via link-sharing, so other Drive collaborators can't reach it.
3. Delete `tools/langfuse-export/.env` afterwards.

## How it works

**Fetch.** The Langfuse legacy list endpoints (`/api/public/traces`, `/api/public/observations` — what the SDK v3 wraps) **time out on Langfuse Cloud**, so reads go via raw `fetch` instead: the cursor-paginated **v2 observations index** (`/api/public/v2/observations`) enumerates the distinct `traceId`s in the window, then **`GET /api/public/traces/{id}`** per trace returns the trace context (`sessionId`, `metadata`, `tags`) plus its full nested observations (input/output/usage/cost) in one by-id call. Neither call scans a list, so neither times out.

**Report.** Numbers and user-attributed quotes are **always code-produced**; the OpenRouter LLM contributes only theme labels and group assignments. `report.ts` renders excerpt text verbatim from the sanitised records, so the model cannot fabricate a quote or leak content it was never given. If theme synthesis fails, the report still renders stats + verbatim excerpts (with a visible note), just without thematic grouping.

## Tests & typecheck

Pure modules (`env`, `normalize`, `sanitize`, `aggregate`, `report`, `cli`) are unit-tested. The I/O modules (`langfuse`, `openrouter`, `pdf`) are verified by a manual end-to-end run.

```sh
npx vitest run --config tools/langfuse-export/vitest.config.mts --coverage=false
npx tsc -p tools/langfuse-export/tsconfig.json --noEmit
```

> The tool-local `tsconfig.json` overrides the base `tools/tsconfig.tools.json` target to `es2021` — `tsc -p tools/tsconfig.tools.json` fails (TS2802 on the es5 target) and is not the right command for this tool.

## Caveats

- **Regex scrub is best-effort, not a PII guarantee.** Free-text disclosures that don't match the patterns (email, phone, URL, `my name is X`, `I live in X`) survive. `--llm-scrub` helps but is pending NES-1562 sign-off.
- **OpenRouter sees content.** Both `--llm-scrub` and the always-on theme synthesis send (regex-scrubbed) user content to OpenRouter. Verify OpenRouter's data-retention/no-training terms before the first production run — NES-1562 covers this.
- **Load-test pollution.** The spike sample was ~92% load-test probes. `--discriminator default` excludes the known probe pattern; the report surfaces how many turns were excluded.
- **Conversation grouping is only as good as `sessionId`.** It's optional on traces, so null-session conversations become synthetic singletons. The report shows the null-session and single-turn shares so you can judge fidelity. NES-1616 (first message not flushed) further under-counts single-turn conversations.
- **Global, not per-region.** `journeyRegion` is not captured on traces yet, so v1 reports are global. Per-region rollups wait on that metadata change.
