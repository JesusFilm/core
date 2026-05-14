# llm-evals

LLM evaluation suite for the apologist chat's system prompt. Runs the **actual chat model** with a **specific labelled version** of the system prompt from Langfuse, then has a **judge LLM** score the output against acceptable examples — all without booting `apps/journeys` or hitting `/api/chat`.

The branch this lib lives on is intentionally long-lived. It is the place to iterate on prompt versions and validate output quality.

## Quick start

```bash
# 1. One-time per machine — export your Doppler token (same one used elsewhere)
export DOPPLER_JOURNEYS_TOKEN=...

# 2. Pull the keys this suite needs from the journeys Doppler project
pnpm exec nx run llm-evals:fetch-secrets

# 3. Run every scenario
pnpm exec nx run llm-evals:eval
```

## How it works

Each scenario declares one or more **models** it wants to be tested against. A run executes every `(scenario, model)` cell in the matrix and writes one canonical file per cell — the artifact for that combination at the moment of its last run.

```
                ┌────────────────────────┐
   scenario     │ Langfuse: getPrompt    │   system
   ───────────► │ (promptName,           │──prompt──┐
                │  label=promptLabel)    │          │
                └────────────────────────┘          │
                                                    ▼
   scenario.query ──────────────────►  ┌────────────────────────────┐
                                       │ scenario.models[i]         │
                                       │ (LLM under test — each     │── output ──┐
                                       │  cell runs once per model) │            │
                                       └────────────────────────────┘            │
                                                                                 ▼
   scenario.description                                          ┌──────────────────────┐
   scenario.query                                                │ EVAL_JUDGE_PROVIDER  │
   scenario.acceptable + unacceptable examples ─────────────────►│ (judge LLM —         │── { pass,
   system prompt                                                 │  default OpenRouter) │    score,
   actual output                                                 └──────────────────────┘    reason }
                                                                          │
                                                                          ▼
                                                  results/<scenario-slug>/<model-slug>.md
                                                                  +
                                                          results/summary.md
```

**Step-by-step:**

1. **Discover scenarios + build the matrix.** `eval.spec.ts` globs every `scenarios/**/*.eval.ts` and flattens each scenario's `models[]` into cells. `EVAL_SCENARIO` and `EVAL_MODEL` env vars optionally filter the matrix.
2. **Fetch the system prompt.** `fetchSystemPrompt` calls Langfuse `getPrompt(promptName, undefined, { label })` and compiles it. The scenario's `promptLabel` selects the version under test. Scenarios target the `development` label unless they are exercising a targeted experiment, in which case they target a dedicated time-locked label.
3. **Generate the response under test.** For each cell, `runScenario` calls `generateText` on the cell's model (`provider` + `modelId`). Direct AI-SDK call — no streaming, no `/api/chat`, no Next.js boot.
4. **Judge the response.** `judge` calls a **separate** judge model, controlled independently by `EVAL_JUDGE_PROVIDER` (default `openrouter`). It receives the system prompt, scenario, query, actual output, acceptable examples and unacceptable examples, and returns `{ pass, score, reason }` parsed from JSON. A cell passes when `score >= passingScore` (default `0.7`).
5. **Write per-cell artifact + regenerate summary.** Each cell that ran is written to `results/<scenario-slug>/<model-slug>.md` (overwriting any previous artifact for that cell). The runner then scans every existing cell file on disk, merges them with the cells that just ran, and rewrites `results/summary.md` so it reflects the current state of the entire matrix.

**Why the judge is decoupled from the model under test:**

- Running a scenario against the apologist gateway should not also bill the gateway for judging. The judge stays on OpenRouter by default.
- Holding the judge constant while sweeping the model under test gives apples-to-apples comparison. If both moved together, you couldn't tell whether a score difference came from the generation or the scoring.

Override the judge with `EVAL_JUDGE_PROVIDER` (and optionally `EVAL_JUDGE_MODEL`) when you want them to match.

## Commands

### `nx run llm-evals:fetch-secrets`

Populates `libs/llm-evals/.env` (gitignored) with only the keys the suite reads, pulled from the `journeys` Doppler project at config `${DOPPLER_CONFIG:-dev}`. Everything else in the Doppler project is filtered out.

To pull from a different config (e.g. staging):

```bash
DOPPLER_CONFIG=stg pnpm exec nx run llm-evals:fetch-secrets
```

### `nx run llm-evals:eval`

Runs every scenario × model cell declared across `scenarios/**/*.eval.ts`. For each cell it:

1. Fetches the system prompt from Langfuse by `promptName` + `promptLabel`.
2. Calls the cell's eval-under-test model with that system prompt + the scenario's query (no streaming, single `generateText` call).
3. Calls the judge model (independently configured) with the system prompt, scenario, query, actual output, `acceptableExamples`, and `unacceptableExamples` — getting back `{ pass, score, reason }`.
4. Asserts `pass === true`.

#### Results layout — one file per (scenario, model) cell, no timestamps

Results are organised by **(scenario, model)** as the primary key, not by run timestamp. Re-running a cell overwrites just that cell's file. Re-running a scenario overwrites only its files. Other cells are preserved.

```
libs/llm-evals/results/
├── summary.md                                         aggregate matrix across every cell
├── <scenario-slug>/
│   ├── openrouter__google-gemini-3-flash-preview.md   one file per model
│   └── apologist__openai-gpt-4o-mini.md
└── <another-scenario-slug>/
    └── openrouter__google-gemini-3-flash-preview.md
```

- **`summary.md`** — single aggregate report. Includes the full matrix (every known cell with its score, pass/fail, last-run timestamp, link to the per-cell report) and a reasoning section grouping the judge's `reason` text by scenario. This is the one file to scan to see the full landscape.
- **`<scenario-slug>/<provider>__<modelId>.md`** — the canonical artefact for one cell. Contains the prompt label, model, score (with threshold), scenario description, query, actual output, judge's reason, and both positive + negative criteria. Starts with a hidden `<!-- llm-eval-meta {...} -->` JSON block that the runner reads on subsequent invocations to populate the summary even for cells that didn't run this time.

The whole `results/` directory is gitignored. To commit a specific cell or scenario as a baseline:

```bash
git add -f libs/llm-evals/results/summary.md
git add -f libs/llm-evals/results/<scenario-slug>/<provider>__<modelId>.md
# or commit a whole scenario folder
git add -f libs/llm-evals/results/<scenario-slug>/
```

#### Selective re-runs

By default, every scenario × model cell runs. Two env vars narrow the matrix:

| Env var          | Effect                                                                          |
| ---------------- | ------------------------------------------------------------------------------- |
| `EVAL_SCENARIO`  | Slug of a single scenario (lowercase, dash-separated form of `scenario.name`).  |
| `EVAL_MODEL`     | Single cell within that scenario, in `provider:modelId` form.                   |

```bash
# Just one scenario, all its models
EVAL_SCENARIO=apologist-responds-with-warmth-to-doubt-about-the-resurrection pnpm exec nx run llm-evals:eval

# Just one cell
EVAL_SCENARIO=apologist-responds-with-warmth-to-doubt-about-the-resurrection \
  EVAL_MODEL='apologist:openai/gpt/4o-mini' \
  pnpm exec nx run llm-evals:eval
```

Filtered runs only touch the files for cells that actually ran; the summary is regenerated by merging those updates with the existing on-disk data for everything else.

## Adding a scenario

Drop a new file under `libs/llm-evals/scenarios/<group>/<name>.eval.ts`:

```ts
import type { Scenario } from '../../src/types'

const scenario: Scenario = {
  name: 'short, human-readable test title',
  description: 'What the scenario is testing and what good looks like.',
  promptName: 'apologist-world-cup-chat',
  promptLabel: 'development', // base prompt — use a dedicated label for targeted experiments
  models: [
    // Required, must list at least one. Each entry produces one cell in the matrix.
    { provider: 'openrouter', modelId: 'google/gemini-3-flash-preview' },
    { provider: 'apologist', modelId: 'openai/gpt/4o-mini' }
  ],
  query: 'The user message to send to the chat.',
  acceptableExamples: [
    'A description of what an acceptable response covers / does.',
    'Another positive criterion the output must meet.'
  ],
  unacceptableExamples: [
    'A specific anti-pattern the output must NOT exhibit.',
    'Another concrete failure mode — e.g. uses platitudes, opens with intellectual rather than emotional empathy, ends with an exhortation instead of an invitation.'
  ],
  passingScore: 0.7 // optional; default 0.7
}

export default scenario
```

The runner discovers new files automatically — no registration step.

**Why both `acceptableExamples` and `unacceptableExamples`?** Positive criteria alone let the judge accept *"technically meets the spirit"* interpretations — e.g. a cool intellectual opener can satisfy *"acknowledges the doubt"* even when it never names what the user is feeling. Concrete anti-patterns force the judge to penalise specific failure modes even when the positive criteria appear met. Treat the two lists as a pair: every positive criterion you care about should have a corresponding anti-pattern that catches the most plausible way a model fakes its way through. `unacceptableExamples` is optional, but most scenarios benefit from at least three.

### Refining a rubric with a stronger model (`polish-rubric`)

Once a scenario has had a few real runs, you can ask a stronger model — by default Apologist Sonnet 4.6 — to propose a sharper rubric grounded in the actual observed outputs and judge reasoning. The polisher:

- Reads the scenario's current rubric and the system prompt under evaluation from Langfuse.
- Reads up to N most recent per-cell artifacts from `results/<scenario-slug>/` so its suggestions are anchored in real model behaviour, not theoretical failure modes.
- Returns sharper positives (each one observable — a reader can point at a sentence and say "yes, this meets the criterion") and sharper negatives (each one a specific failure mode, ideally one the current rubric does not catch).
- **Never modifies your scenario files.** It writes a sidecar at `libs/llm-evals/proposed-prompts/<scenario-slug>.rubric.md` containing the rationale, what changed, and a ready-to-paste TypeScript snippet. You read it, decide what to apply, and edit the `.eval.ts` file manually.

```bash
# Polish one scenario, default polisher (apologist:anthropic/claude/sonnet-4.6)
pnpm exec nx run llm-evals:polish-rubric --scenario=<scenario-slug>

# Override polisher model (recommended to A/B against a different model to avoid polisher overfit)
pnpm exec nx run llm-evals:polish-rubric --scenario=<slug> --polisher='openrouter:anthropic/claude-sonnet-4.6'

# Polish all scenarios
pnpm exec nx run llm-evals:polish-rubric --all

# Skip the run-data grounding (rubric-only polish, useful for fresh scenarios with no results/ yet)
pnpm exec nx run llm-evals:polish-rubric --scenario=<slug> --no-runs
```

**The slug is the lowercased `scenario.name` with non-alphanumerics replaced by dashes** — same form used in `results/<scenario-slug>/`. Running with an unknown slug prints the list of known slugs.

**Workflow:**

1. Run the eval suite at least once so `results/<scenario-slug>/` exists with observed outputs.
2. Run `polish-rubric` for that scenario.
3. Open the sidecar in `proposed-prompts/` and read the rationale + change summary.
4. If you accept the proposal, copy the snippet into the `.eval.ts` file.
5. Re-run the eval to confirm the new rubric scores cells the way you expect.

**When to be suspicious of the polisher's output:**

- It proposes a criterion that contradicts the system prompt. The polisher is told the system prompt is the source of truth, but it can still drift. Cross-check against the prompt before applying.
- It removes a criterion that was catching a real failure you care about. The polisher optimises for sharpness, not for preserving every existing rule.
- You're using the same model as both polisher and an eval-under-test. Re-run the polisher with a different model (`--polisher=openrouter:anthropic/claude-sonnet-4.6` or similar) and diff the two proposals. If they agree, the criterion is robust; if they disagree, it may be model-specific.

The polisher is a draft generator, not an authority. Always review.

### Choosing a `promptLabel`

There are two labels you will use:

- **`development`** — the **base prompt** for this suite. Every scenario points at `development` unless it is explicitly testing a targeted variant. The current apologist baseline has been established here and is treated as the stable reference point against which targeted experiments are compared. Iterations to the base prompt happen on the `development` label in Langfuse.
- **Targeted experiment labels** — each non-base variant (a length-cap experiment, a new register rule, a tone change) gets its own **unique, time-locked Langfuse label** with a descriptive name (`length-cap-4k`, `empathy-rule-v1`, `baseline-2026-05`). Each targeted change in the system prompt must come with a dedicated label and a scenario that targets it. Treat these labels as immutable once a scenario references them.

**Do not use `production`.** That label is reassigned whenever a new prompt version is shipped to production, so two runs on different days can silently exercise different prompts and eval results become unreproducible. Evaluate against `development` or a named experiment label, never `production`.

Langfuse itself does not prevent re-pointing a label to a new prompt version — that is a discipline we enforce in this suite, not a platform constraint. If you need to test a revised prompt, create a **new label**, write or update a scenario to reference it, and keep the previous label intact so prior runs remain reproducible. When naming a new experiment label, prefer specificity (`<theme>-<variant>` or `<theme>-<yyyy-mm>`).

## Models — choosing what each scenario tests

Each scenario declares its own `models[]`. To add a model to a scenario, append an entry:

```ts
models: [
  { provider: 'openrouter', modelId: 'google/gemini-3-flash-preview' },
  { provider: 'apologist',  modelId: 'openai/gpt/4o-mini' },
  { provider: 'apologist',  modelId: 'anthropic/claude/sonnet-4.6' }
]
```

| Provider     | Required env vars                                 | modelId format                              |
| ------------ | ------------------------------------------------- | ------------------------------------------- |
| `openrouter` | `OPENROUTER_API_KEY`                              | OpenRouter slug, e.g. `google/gemini-3-flash-preview` |
| `gemini`     | `GOOGLE_GENERATIVE_AI_API_KEY`                    | Google model id, e.g. `gemini-2.0-flash`    |
| `apologist`  | `APOLOGIST_API_URL`, `APOLOGIST_API_KEY`          | Gateway slug, see slug pattern below        |

### Apologist gateway slug pattern

The Apologist gateway is not openly documented, but the slug follows a consistent transformation of the display name on the [Apologist pricing page](https://apologistproject.org/pricing):

1. Lowercase the display name.
2. Drop the leading vendor word (e.g. drop "OpenAI" since it becomes the first slash-segment).
3. Replace spaces with hyphens.
4. **Preserve internal punctuation** — dots in version numbers (`4.5`, `4.6`) stay as dots.
5. Use `/` between segments: `<vendor>/<family>/<rest>`.

| Display name on pricing page | Slug                                  |
| ---------------------------- | ------------------------------------- |
| OpenAI GPT-4o mini           | `openai/gpt/4o-mini`                  |
| Google Gemini 3 Flash        | `google/gemini/3-flash`               |
| Anthropic Claude Haiku 4.5   | `anthropic/claude/haiku-4.5`          |
| Anthropic Claude Sonnet 4.6  | `anthropic/claude/sonnet-4.6`         |

A wrong slug returns `Unprocessable Entity` from the gateway and the eval cell captures that error in its report file — fail-loud, easy to spot.

### Currently wired-up models

Each existing apologist scenario lists the same matrix so cross-scenario behaviour can be compared on the same axis:

| Model id                                              | Tier                         | Notes                                              |
| ----------------------------------------------------- | ---------------------------- | -------------------------------------------------- |
| `openrouter:google/gemini-3-flash-preview`            | OpenRouter baseline          | Mirrors `apps/journeys/pages/api/chat/index.ts`    |
| `apologist:openai/gpt/4o-mini`                        | Apologist Limited (1 credit) | Original gateway default; consistently underperforms on doubt scenarios. |
| `apologist:google/gemini/3-flash`                     | Apologist Limited (2 credits)| Closest apples-to-apples comparison vs OpenRouter. |
| `apologist:anthropic/claude/haiku-4.5`                | Apologist Limited (2 credits)| Cheap Anthropic option.                            |
| `apologist:anthropic/claude/sonnet-4.6`               | Apologist Premium (7 credits)| Highest-performing on the doubt / pastoral scenarios so far. |

**The judge is independent** of any of these — it stays on OpenRouter by default so that running a scenario against the cost-billed apologist gateway does not double-bill it for judging. Override the judge only when you explicitly want apples-to-apples scoring against the same model:

| Env var                 | Effect                                                                         | Default                       |
| ----------------------- | ------------------------------------------------------------------------------ | ----------------------------- |
| `EVAL_JUDGE_PROVIDER`   | `openrouter` \| `gemini` \| `apologist`                                        | `openrouter`                  |
| `EVAL_JUDGE_MODEL`      | model id within that provider                                                  | `google/gemini-3-flash-preview` (openrouter) / `gemini-2.0-flash` (gemini) / `openai/gpt/4o-mini` (apologist) |

For one-off env overrides without re-fetching from Doppler, drop the key in `libs/llm-evals/.env.local` (gitignored, takes precedence over `.env`).

## Layout

```
libs/llm-evals/
├── project.json                       nx targets: lint, type-check, eval, fetch-secrets
├── vitest.evals.mts                   vitest config (node env, 120s timeout)
├── setupEvals.ts                      loads .env then .env.local before each run
├── eval.spec.ts                       discovers + runs every scenarios/**/*.eval.ts
├── src/
│   ├── types.ts                       Scenario, ScenarioModel, JudgeResult, EvalProvider
│   ├── langfuse.ts                    Langfuse client + fetchSystemPrompt by label
│   ├── providers.ts                   buildEvalModel / resolveJudgeModel
│   ├── runScenario.ts                 fetch prompt + generateText for one (scenario, model)
│   ├── judge.ts                       LLM-as-judge → { pass, score, reason }
│   └── index.ts
├── scenarios/<group>/*.eval.ts        scenario definitions (discovered automatically)
├── results/                           one folder per scenario, one .md per model cell + summary.md (gitignored)
├── .env.example                       documents every variable the suite reads
└── .env / .env.local                  written by fetch-secrets / manual overrides (gitignored)
```

## Notes

- This suite calls **real** Langfuse, OpenRouter, and (optionally) Apologist APIs. It is **not** part of `nx test` and is **never** run in CI.
- Drift risk: the suite composes the system prompt the same way `apps/journeys/pages/api/chat/index.ts` does (Langfuse prompt by label, compiled with `{ language }` variables). If the chat route later adds extra instructions before the system prompt, that drift will not be reflected here — keep this in mind when interpreting eval results.
- The branch this lib lives on is not intended to merge into `main`. Rebase periodically to keep up with prompt / provider changes upstream.
