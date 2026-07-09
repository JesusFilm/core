# tools/langfuse-export

Engineer-run CLI that pulls Apologist chat traces from the **Langfuse Public API**, scrubs free-text PII, and produces a **self-contained insights-explorer bundle** (**NES-1719**): a single zip containing the full sanitised dataset plus an offline HTML viewer a stakeholder unzips and opens by double-clicking — no server, no install, no internet.

Built for **NES-1690**, implementing the **NES-1656** export-path spike; the explorer bundle supersedes the back half of **NES-1577** (parked PR #9276). The manual CSV observations export drops the trace-level fields needed to group turns into conversations (`sessionId`), attribute country (`metadata.ipCountry`), and tag — this tool reads those from the API instead.

> **Read the caveats below before sharing any artifact.** NES-1688 has landed, so `--environment production` (the default) isolates real production traffic. Volume has since accumulated: a 30-day window to 2026-07-10 yields **131 traces across 56 sessions, every one with a real `sessionId`, and zero load-test turns** — so the null-session and load-test warnings that shaped this tool no longer bite on production data. The traffic is heavily multilingual (Bengali, Spanish, Arabic, French, Afrikaans, Korean, Hindi); see [Translation](#translation-nes-1762). To exercise the whole pipeline offline against synthetic data, use `--fixture` (below).

## The explorer bundle (NES-1719)

`insights-explorer.zip` contains three files:

- `index.html` — the offline viewer. Filter by **curated facets only** (no free-text search, so you can only filter on terms that exist); over-common keywords (e.g. `god`, `jesus` in an apologist chat — they match nearly everything) are **suppressed** as filters. Pick a session and read **every message in order**, following one real conversation start to finish.
- `dataset.json` — the lossless, PII-scrubbed corpus: every session with its full ordered message list, metadata, per-session themes, and facet keys. Nothing is collapsed or sampled — the file _is_ the corpus.
- `README.txt` — double-click instructions for the recipient.

It runs from `file://` with zero dependencies: the dataset is inlined into the HTML as a JSON block and the viewer is dependency-free vanilla JS. Keyword facets are computed deterministically (frequency-threshold suppression); per-session themes come from the LLM enrichment pass and degrade gracefully to keyword-only filtering if absent.

## Translation (NES-1762)

The corpus is genuinely multilingual (Bengali, Arabic, Hebrew, Spanish, French, and more — roughly half the text is non-English). Pass `--translate` to add a machine-translation pass: every non-English user message, assistant reply, and keyword facet label gets an English rendering, while **the original text is always kept byte-for-byte** — translation is purely additive (`textEnglish` alongside `text`, `labelEnglish` alongside `label`). Detection and translation come from one OpenRouter pass; a message detected as English is left as-is.

- **Paid once.** Translations are cached in a content-addressed file (default `output/.translation-cache.json`, override with `--translation-cache PATH`) keyed by the SHA-256 of the exact source string. Re-running to re-render the report reuses the cache and costs nothing; only new/changed strings are sent to the model.
- **`--translate` needs credentials even under `--fixture`.** The fixture only replaces the Langfuse _source_; translation still calls OpenRouter, so `--fixture --translate` loads `.env` and validates all four keys (the Langfuse keys included). A plain `--fixture` run without `--translate` stays fully offline.
- **Degrades safely.** A batch that fails after retries leaves those strings untranslated (the original still shows) rather than aborting the run or fabricating a translation. The run logs `strings / cache hits / newly translated / failed` counts.
- **Script beats the model on detection.** The model does misdetect: real Bengali assistant replies came back tagged `lang:"en"`. `cannotBeEnglish()` (majority non-Latin script) vetoes that verdict — such an item is re-asked on its own with a stricter prompt, and if the model still insists, nothing is recorded rather than caching a lie. A cached `en` verdict on non-Latin text is treated as a miss, so an old poisoned cache self-heals on the next run.
- **A translation identical to its source is not a translation.** `'sup'` came back tagged Spanish, echoed verbatim; a `TRANSLATED` chip above identical text is worse than no chip. Those are dropped.
- **Glossing exposes the stopword gap.** The keyword vocabulary is filtered by an _English_ stopword list, so English function words never became facets — but `que`, `puede`, `איר` sailed through. Once a keyword carries an English gloss, the same list is applied to the gloss, so a translated facet must clear exactly the bar an English one already did (`que` → `that` is dropped; `dios` → `god` is kept). The count is reported as `suppressedTranslatedKeywordCount` and logged.
- **The cache is chat-derived.** `output/.translation-cache.json` holds English renderings of real user messages. It lives under the gitignored `output/` for that reason — never commit it, never share it, and delete it alongside `.env` when you are done.
- **Accuracy is not guaranteed.** See Caveats.

## Layout

The layout splits on the boundary that matters here: **`pipeline/`** holds pure, unit-tested transforms; **`clients/`** holds the external-I/O modules (network/browser) verified by a manual run. Only sanitised `pipeline/` output crosses into `clients/openrouter`, enforced by the branded `SanitisedConversation` type.

```text
tools/langfuse-export/
  run.ts                # CLI entry: argv -> pipeline orchestration
  fetch-env.sh          # doppler secrets download -> .env
  .env.example          # required keys (no values)
  fixtures/sample.json  # synthetic {traces,observations,themes} for offline --fixture runs
  vitest.config.mts     # tool-local test config (pure modules)
  tsconfig.json         # extends tools/tsconfig.tools.json; target es2021
  src/
    env.ts              # dotenv (explicit path) + zod validation
    types.ts            # shared types incl. branded SanitisedConversation + dataset types
    cli.ts              # pure arg/window/discriminator parsing
    clients/            # external I/O — verified by the manual run, not unit tests
      langfuse.ts       #   fetchTraces + per-traceId fetchObservations
      openrouter.ts     #   OpenRouter client + theme synthesis + llmScrub + translation
      translation-cache.ts #  content-addressed translation cache (node:crypto) — pure, unit tested
      zip.ts            #   dependency-free ZIP writer (node:zlib) — pure, unit tested
    pipeline/           # pure transforms — unit tested
      normalize.ts      #   join obs->trace, group by sessionId -> Conversation[]
      sanitize.ts       #   regex PII scrub -> SanitisedConversation[]; injected llmScrub
      facets.ts         #   keyword + country + journey-language facets, over-common suppression
      translate.ts      #   collect the deduplicated strings needing translation
      dataset.ts        #   SanitisedConversation[] -> lossless InsightsDataset (+ theme inversion + translations)
      explorer.ts       #   self-contained offline HTML viewer (dataset inlined)
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

## Run

```sh
# Default: last 14 days, production only, exclude load-test -> insights-explorer.zip
pnpm exec tsx tools/langfuse-export/run.ts --days 14

# Explicit window:
pnpm exec tsx tools/langfuse-export/run.ts --from 2026-06-11 --to 2026-07-14

# Offline, no credentials — build the bundle from the synthetic fixture
# (useful for a demo, a smoke test, or reviewing the artifact without live data):
pnpm exec tsx tools/langfuse-export/run.ts \
  --from 2026-05-01 --to 2026-06-01 \
  --fixture tools/langfuse-export/fixtures/sample.json

# Every environment (incl. pre-NES-1688 untagged history), no load-test exclusion:
pnpm exec tsx tools/langfuse-export/run.ts --days 7 --environment all --discriminator none
```

Running with no arguments prints usage.

> **`--environment` defaults to `production`** — the share-worthy traffic. Traces are tagged with their deployment environment by NES-1688 (`production` / `stage` / `preview` / `development`). Traces created **before** NES-1688 shipped are untagged (Langfuse buckets them as `default`) and are **only** included via `--environment all`. The env filter is applied at the Langfuse observations index (server-side) and re-checked against each trace's own `environment`. `--fixture` ignores `--environment` (the source is the file, not Langfuse).

### Flags

| Flag                       | Meaning                                                                                                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--days N`                 | Window = last N days (default 14). Mutually exclusive with `--from`/`--to`.                                                                                                      |
| `--from ISO --to ISO`      | Explicit window (both required together).                                                                                                                                        |
| `--fixture PATH`           | Build from a local `{traces, observations, themes?}` JSON instead of Langfuse — fully offline, no credentials, no LLM (themes read from the file).                               |
| `--discriminator V`        | Load-test exclusion: `default` (exclude known probes), `none`, `message:<regex>`, `journey:<csv>`, `tag:<csv>`. Orthogonal to `--environment` — both apply.                      |
| `--environment E`          | Deployment-env filter (NES-1688): `production` (default), `stage`, `preview`, `development`, or `all` (every env, including pre-NES-1688 untagged traces).                       |
| `--llm-scrub`              | Extra LLM PII scrub pass (pending NES-1562 sign-off). Ignored under `--fixture`.                                                                                                 |
| `--translate`              | Machine-translate non-English messages + keyword facets to English (NES-1762). Adds an OpenRouter pass. **Requires credentials even under `--fixture`** (see Translation).       |
| `--translation-cache PATH` | Where translations are read/written (default `output/.translation-cache.json`). Content-addressed, so translation is paid once — a re-render reuses the cache and costs nothing. |
| `--model ID`               | OpenRouter model id (default `google/gemini-2.5-flash-lite`).                                                                                                                    |
| `--throttle MS`            | Delay between Langfuse calls (default 700ms; keep under the ~100 req/min Hobby ceiling).                                                                                         |
| `--debug`                  | Also write `records.ndjson` (one sanitised turn per line). **Debug artifact — never share.**                                                                                     |

## Output

Each run writes `tools/langfuse-export/output/<timestamp>/`:

- `insights-explorer.zip` — **the deliverable** (dataset + offline viewer + readme).
- `index.html`, `dataset.json` — the unzipped bundle files, written alongside so you can preview without extracting (the same bytes are inside the zip).
- `records.ndjson` — only with `--debug`; sanitised per-turn records for inspection.

`output/` is gitignored — the bundle is chat-derived, never commit it.

## Share with stakeholders

1. Send **`insights-explorer.zip`** directly to named recipients (not link-sharing). The recipient unzips and double-clicks `index.html` — it opens offline in any browser.
2. Never share `records.ndjson` (debug artifact) or upload chat-derived output publicly.
3. Delete `tools/langfuse-export/.env` afterwards.

## How it works

**Fetch.** The Langfuse legacy list endpoints (`/api/public/traces`, `/api/public/observations` — what the SDK v3 wraps) **time out on Langfuse Cloud**, so reads go via raw `fetch` instead: the cursor-paginated **v2 observations index** (`/api/public/v2/observations`) enumerates the distinct `traceId`s in the window, then **`GET /api/public/traces/{id}`** per trace returns the trace context (`sessionId`, `metadata`, `tags`) plus its full nested observations (input/output/usage/cost) in one by-id call. Neither call scans a list, so neither times out.

**Explorer.** `facets.ts` derives the keyword vocabulary deterministically: each session is one document, terms above a document-frequency share (default 50%) are suppressed as over-common, terms below a floor are dropped as noise, the rest are ranked by coverage and capped; it also builds the `country` (ipCountry) and `journey-language` metadata facets. `dataset.ts` serialises the sanitised corpus losslessly (every session, every message, in order) and folds in the LLM's per-session themes (inverted from `synthesizeThemes`). The LLM contributes **only** theme labels — never message text — so it cannot fabricate or leak a quote. `explorer.ts` inlines that dataset into a dependency-free HTML viewer; every piece of corpus text reaches the page via `textContent` (never `innerHTML`), and the inlined JSON has its `<` escaped so content cannot break out of the script block. `zip.ts` assembles the archive with `node:zlib` (no external dependency). If theme synthesis fails or `--fixture` supplies none, the explorer still works with keyword/metadata facets.

## Tests & typecheck

Pure modules (`env`, `normalize`, `sanitize`, `facets`, `translate`, `dataset`, `explorer`, `zip`, `cli`, `translation-cache`) are unit-tested — including the LLM-output boundaries `parseThemes` / `parseTranslations`. The I/O modules (`langfuse`, `openrouter`) are verified by a manual end-to-end run; the offline end-to-end path is exercised with `--fixture`.

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
- **Global, not per-region.** `journeyRegion` is not captured on traces yet, so reports are global. Per-region rollups wait on that metadata change.
- **Keyword facets are best for Latin-script content.** Tokenisation is Unicode-letter-aware and the over-common/rare suppression is language-agnostic, but the stopword list is English; facets from other scripts are noisier. Under `--translate` the English gloss is re-checked against that same stopword list, which recovers most of the gap (13 of 28 glossed keywords were dropped as function words on the 30-day production corpus). Without `--translate` the noise remains. Per-session themes (LLM) are language-agnostic and unaffected — `synthesizeThemes` already forces English labels.
- **A translated keyword facet can collide with an English one.** `dios` glossed to `god` renders beside a native `god` facet: two rows, same English word, different filter keys and different sessions. They are genuinely distinct facets and are not merged — merging would misstate the counts — but the original term is always shown beside the gloss so the two can be told apart.
- **Machine translation accuracy is not guaranteed.** `--translate` output is model-generated and may mistranslate, especially idiom, nuance, and religious terminology. The **original message is always retained and never altered** — treat it as the source of truth and the English as an aid only. Translation also sends (regex-scrubbed) content to OpenRouter, same as theme synthesis (see "OpenRouter sees content" above).
- **`language` is the journey's, not the speaker's.** It's the journey's configured BCP-47 language (sent by the chat client), not detected from what the user typed — a user typing another language into an English journey still shows `en`. The viewer surfaces it as the **Journey Language** facet to make this explicit.
- **`country` is IP-geolocation.** The `country` facet is the trace's `ipCountry` (a rough proxy: VPNs, travel, and server egress can skew it), not a declared region.
- **Anonymity grain is the session.** Sessions are labelled `Session 001…` in the viewer; the pseudonymous Langfuse `sessionId` is retained in `dataset.json` for traceability. Cross-session "user" identity is not reconstructed (no persistent id is captured today).
- **Single-page size.** The whole corpus is inlined into one HTML file. That is fine at report scale; a very large window (many thousands of sessions) would produce a heavy page — narrow the window or add pagination before then.
