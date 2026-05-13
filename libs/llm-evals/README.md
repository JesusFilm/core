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

Each scenario is run through a fixed pipeline. Two LLMs are involved per scenario: one **under test** (produces the response) and a separate **judge** (scores the response).

```
              ┌────────────────────────┐
   scenario   │ Langfuse: getPrompt    │   system
   ──────────►│ (promptName,           │──prompt──┐
              │  label=promptLabel)    │          │
              └────────────────────────┘          │
                                                  ▼
   scenario.query  ──────────────────►  ┌─────────────────────┐
                                        │ EVAL_PROVIDER       │
                                        │ (LLM under test —   │── output ──┐
                                        │  default OpenRouter │            │
                                        │  → Gemini 2.5 Flash)│            │
                                        └─────────────────────┘            │
                                                                           ▼
   scenario.description                                          ┌──────────────────────┐
   scenario.query                                                │ EVAL_JUDGE_PROVIDER  │
   scenario.acceptableExamples ─────────────────────────────────►│ (judge LLM —         │── { pass,
   system prompt                                                 │  default OpenRouter) │    score,
   actual output                                                 └──────────────────────┘    reason }
                                                                           │
                                                                           ▼
                                                                  results/<timestamp>.md
```

**Step-by-step:**

1. **Discover scenarios.** `eval.spec.ts` globs every `scenarios/**/*.eval.ts` at startup. Each file `export default`s a `Scenario` object with `promptName`, `promptLabel`, `query`, and `acceptableExamples`.
2. **Fetch the system prompt.** `fetchSystemPrompt` calls Langfuse `getPrompt(promptName, undefined, { label })` and compiles it (substituting any `promptVariables` such as `{ language }`). The scenario's `promptLabel` selects the version under test. Scenarios target the `development` label (the established base prompt) unless they are exercising a targeted experiment, in which case they target a dedicated time-locked label. See [Choosing a `promptLabel`](#choosing-a-promptlabel) below.
3. **Generate the response under test.** `runScenario` calls `generateText` on the eval-under-test model. The model is selected from `EVAL_PROVIDER` (default `openrouter` → `google/gemini-3-flash-preview`). No streaming, no `/api/chat` route, no Next.js boot — direct AI-SDK call.
4. **Judge the response.** `judge` calls a **separate** judge model (default `openrouter`, controlled independently by `EVAL_JUDGE_PROVIDER`). It receives the system prompt, scenario description, query, actual output, and the list of acceptable examples, then returns `{ pass, score, reason }` parsed from JSON. A scenario passes when `score >= passingScore` (default `0.7`).
5. **Assert + write the report.** Each scenario asserts `pass === true`. After all scenarios complete (pass or fail), a markdown report is written to `libs/llm-evals/results/<ISO-timestamp>.md` with a summary table and per-scenario details.

**Why the judge is decoupled from the eval-under-test:**

- Setting `EVAL_PROVIDER=apologist` should not also bill the cost-sensitive apologist gateway for judging. The judge stays on OpenRouter by default.
- Holding the judge constant while sweeping the eval-under-test across providers gives apples-to-apples comparison. If both moved together, you couldn't tell whether a score difference came from the generation or the scoring.

You can override the judge with `EVAL_JUDGE_PROVIDER` if you want them to match.

## Commands

### `nx run llm-evals:fetch-secrets`

Populates `libs/llm-evals/.env` (gitignored) with only the keys the suite reads, pulled from the `journeys` Doppler project at config `${DOPPLER_CONFIG:-dev}`. Everything else in the Doppler project is filtered out.

To pull from a different config (e.g. staging):

```bash
DOPPLER_CONFIG=stg pnpm exec nx run llm-evals:fetch-secrets
```

### `nx run llm-evals:eval`

Runs every `scenarios/**/*.eval.ts` file through Vitest. For each scenario it:

1. Fetches the system prompt from Langfuse by `promptName` + `promptLabel`.
2. Calls the eval-under-test model with that system prompt + the scenario's query (no streaming, single `generateText` call).
3. Calls the judge model with the system prompt, scenario description, query, actual output, and `acceptableExamples`, getting back `{ pass, score, reason }`.
4. Logs the run and asserts `pass === true`.

After the run completes, a per-run directory is written under `libs/llm-evals/results/<timestamp>/` with one file per scenario plus a summary:

```
libs/llm-evals/results/2026-05-13T02-08-22-123Z/
├── summary.md                                       index + summary table linking to each scenario
├── 01-<scenario-slug>.md                            full detail for scenario 1
└── 02-<scenario-slug>.md                            full detail for scenario 2
```

- `summary.md` — `N/M scenarios passed.` header and a single table with scenario, prompt label, model, score, pass/fail, and a link to each per-scenario report.
- `<NN>-<slug>.md` — for each scenario: prompt label, model, score (with threshold), scenario description, the query, the actual output, the judge's reason, and the acceptable examples. Failing scenarios still appear with their score and reason — the per-scenario file is the canonical artefact for sharing or reviewing.

The `results/` directory is gitignored by default. To commit a specific report — for example a baseline you want to diff against later — force-add it:

```bash
git add -f libs/llm-evals/results/<run-folder>/<file>.md
# or commit the whole run
git add -f libs/llm-evals/results/<run-folder>/
```

## Adding a scenario

Drop a new file under `libs/llm-evals/scenarios/<group>/<name>.eval.ts`:

```ts
import type { Scenario } from '../../src/types'

const scenario: Scenario = {
  name: 'short, human-readable test title',
  description: 'What the scenario is testing and what good looks like.',
  promptName: 'apologist-world-cup-chat',
  promptLabel: 'development', // base prompt — use a dedicated label for targeted experiments
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

### Choosing a `promptLabel`

There are two labels you will use:

- **`development`** — the **base prompt** for this suite. Every scenario points at `development` unless it is explicitly testing a targeted variant. The current apologist baseline has been established here and is treated as the stable reference point against which targeted experiments are compared. Iterations to the base prompt happen on the `development` label in Langfuse.
- **Targeted experiment labels** — each non-base variant (a length-cap experiment, a new register rule, a tone change) gets its own **unique, time-locked Langfuse label** with a descriptive name (`length-cap-4k`, `empathy-rule-v1`, `baseline-2026-05`). Each targeted change in the system prompt must come with a dedicated label and a scenario that targets it. Treat these labels as immutable once a scenario references them.

**Do not use `production`.** That label is reassigned whenever a new prompt version is shipped to production, so two runs on different days can silently exercise different prompts and eval results become unreproducible. Evaluate against `development` or a named experiment label, never `production`.

Langfuse itself does not prevent re-pointing a label to a new prompt version — that is a discipline we enforce in this suite, not a platform constraint. If you need to test a revised prompt, create a **new label**, write or update a scenario to reference it, and keep the previous label intact so prior runs remain reproducible. When naming a new experiment label, prefer specificity (`<theme>-<variant>` or `<theme>-<yyyy-mm>`).

## Switching providers

The eval-under-test model and the judge model are independent. The judge defaults to OpenRouter regardless of what you pick for the eval-under-test, so apologist isn't accidentally used for judging (it is cost-billed).

| Env var               | Values                                       | Default                     |
| --------------------- | -------------------------------------------- | --------------------------- |
| `EVAL_PROVIDER`       | `openrouter` \| `gemini` \| `apologist`      | `openrouter`                |
| `EVAL_JUDGE_PROVIDER` | `openrouter` \| `gemini` \| `apologist`      | `openrouter`                |
| `OPENROUTER_MODEL`    | any OpenRouter model id                      | `google/gemini-3-flash-preview`   |
| `EVAL_GEMINI_MODEL`   | any Google model id                          | `gemini-2.0-flash`          |
| `APOLOGIST_MODEL_ID`  | apologist gateway model id                   | `openai/gpt/4o-mini`        |

Examples:

```bash
# Try a different OpenRouter model for the eval-under-test
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet pnpm exec nx run llm-evals:eval

# Run a single scenario against the apologist gateway (cost-billed — explicit opt-in)
EVAL_PROVIDER=apologist pnpm exec nx run llm-evals:eval

# Direct Gemini (no OpenRouter middleman); needs GOOGLE_GENERATIVE_AI_API_KEY
EVAL_PROVIDER=gemini pnpm exec nx run llm-evals:eval
```

If you need to override a single key for a one-off run without re-fetching from Doppler, drop it in `libs/llm-evals/.env.local` (gitignored, takes precedence over `.env`).

## Layout

```
libs/llm-evals/
├── project.json                       nx targets: lint, type-check, eval, fetch-secrets
├── vitest.evals.mts                   vitest config (node env, 120s timeout)
├── setupEvals.ts                      loads .env then .env.local before each run
├── eval.spec.ts                       discovers + runs every scenarios/**/*.eval.ts
├── src/
│   ├── types.ts                       Scenario, JudgeResult, EvalProvider
│   ├── langfuse.ts                    Langfuse client + fetchSystemPrompt by label
│   ├── providers.ts                   resolveEvalModel / resolveJudgeModel
│   ├── runScenario.ts                 fetch prompt + generateText
│   ├── judge.ts                       LLM-as-judge → { pass, score, reason }
│   └── index.ts
├── scenarios/<group>/*.eval.ts        scenario definitions (discovered automatically)
├── results/<timestamp>/               per-run reports — summary.md + NN-<slug>.md per scenario (gitignored)
├── .env.example                       documents every variable the suite reads
└── .env / .env.local                  written by fetch-secrets / manual overrides (gitignored)
```

## Notes

- This suite calls **real** Langfuse, OpenRouter, and (optionally) Apologist APIs. It is **not** part of `nx test` and is **never** run in CI.
- Drift risk: the suite composes the system prompt the same way `apps/journeys/pages/api/chat/index.ts` does (Langfuse prompt by label, compiled with `{ language }` variables). If the chat route later adds extra instructions before the system prompt, that drift will not be reflected here — keep this in mind when interpreting eval results.
- The branch this lib lives on is not intended to merge into `main`. Rebase periodically to keep up with prompt / provider changes upstream.
