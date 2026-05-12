# scribe

An interactive, agent-driven CLI for operating on the Core platform.

`scribe` signs you in to dev, stage, or production via a browser flow,
caches the resulting Firebase ID token, and drops you into an agent prompt
with a tightly-scoped tool set. The first built-in skill is the
**journey structure troubleshooter**: it can fetch, lint, diff, and update
journeys via the existing GraphQL gateway operations.

Multiple agent backends are supported — Claude Code (default), OpenRouter,
any OpenAI-compatible Hermes endpoint, a local LM Studio server, and a
local Ollama server. See [Providers](#providers).

## Status

This is a v1 scaffold. It builds, type-checks, and runs end-to-end, but you
should treat staging and production runs as real changes — the agent calls
real GraphQL mutations.

## Prerequisites

- Node.js 20+
- A working local `claude` CLI (Claude Code), signed in. The Claude Agent
  SDK rides on the same credentials Claude Code uses, so once `claude` works
  in your terminal `scribe` will too — no separate API key required.
- `pnpm install` at the monorepo root, after the dependencies below are
  added (see [Install](#install)).

`ANTHROPIC_API_KEY` is **not** required. If you set it, the SDK will use it
in preference to the Claude Code credentials.

## Install

This scaffold pins `@anthropic-ai/claude-agent-sdk` and `ink` in the
workspace `package.json` — `pnpm install` at the root will pick them up.
`tsx`, `react`, `commander`, and `zod` are already in the workspace.

If you also want to run the production journey troubleshooter, ensure the
Firebase user you sign in as is a member of the team that owns the journey
(see [Auth notes](#auth-notes)).

## Run

```bash
# Pick an environment interactively, then drop into the agent prompt.
# Uses your existing Claude Code credentials — no API key needed.
pnpm exec nx serve scribe

# Or pin the environment up front. Nx reserves --env for its own use, so
# scribe's flag is --environment.
pnpm exec nx serve scribe -- --environment stage

# Force a fresh browser login (ignore the cached token).
pnpm exec nx serve scribe -- --environment stage --force-login

# Override the model.
pnpm exec nx serve scribe -- --environment dev --model claude-opus-4-7

# Pick an agent backend up front.
pnpm exec nx serve scribe -- --provider openrouter --model anthropic/claude-sonnet-4

# Forget a stored Firebase credential.
pnpm exec nx serve scribe -- logout --environment stage

# Forget a stored provider API key.
pnpm exec nx serve scribe -- logout --provider openrouter
```

The first time you run against an environment, `scribe` opens a browser
tab to `<journeys-admin>/users/cli-auth` for that environment, signs you in
through the existing Firebase flow, and POSTs the resulting ID token back to
a one-shot HTTP listener on `127.0.0.1`. The token lives in
`~/.config/scribe/credentials.json` (mode 0600) and is reused on subsequent
runs until it expires or you `logout`.

## In the prompt

The REPL is rendered with [Ink](https://github.com/vadimdemedes/ink) and
behaves like Claude Code:

- **Blinking cursor** in the input row.
- **Slash menu**: type `/` and a popup of available commands appears,
  filtered as you type. Use **↑/↓** to highlight, **Tab** to complete,
  **Enter** to run, **Esc** to clear.
- **Status bar** along the bottom shows the active environment, signed-in
  user, and running token usage (input, output, cache-hit %, turns).
- Anything that doesn't start with `/` is sent to the Claude agent.

### Built-in slash commands

| Command         | Effect                                                                        |
| --------------- | ----------------------------------------------------------------------------- |
| `/env <id>`       | Switch to `dev`, `stage`, or `prod`. Re-uses cached creds, prompts if needed. |
| `/login`          | Force a fresh browser sign-in for the current environment.                    |
| `/logout`         | Clear the cached credential for the current environment and exit.             |
| `/clear`          | Clear the transcript and start a fresh agent session (resets token totals).   |
| `/provider [id]`  | Switch the agent backend (Claude Code, OpenRouter, Hermes, LM Studio). See [Providers](#providers). |
| `/model [id]`     | Switch the model. Opens a picker populated by the active provider's catalog (Claude Code presets, OpenRouter's `GET /models`, Hermes's `GET /models`, or LM Studio's loaded models). Type to filter, Tab to refresh, "Other…" for a custom id. |
| `/help`           | List slash commands.                                                          |
| `/exit`           | Quit scribe.                                                                |

Switching environments clears the active agent conversation — the new
environment gets its own system prompt, MCP tools, and token counters.

## Configuration

Environments are hard-coded in [src/config/environments.ts](src/config/environments.ts).
The current values are:

| id    | gateway URL                                         | journeys-admin URL              |
| ----- | --------------------------------------------------- | ------------------------------- |
| dev   | `http://127.0.0.1:4000/`                            | `http://127.0.0.1:4200`         |
| stage | `https://api-gateway.stage.central.jesusfilm.org/`  | `https://admin-stage.nextstep.is` |
| prod  | `https://api-gateway.central.jesusfilm.org/`        | `https://admin.nextstep.is`     |

Override the config directory with `SCRIBE_CONFIG_DIR`.

## Providers

`scribe` can drive its agent loop with several backends. The active provider
is persisted at `~/.config/scribe/providers.json` (mode 0600) and survives
across runs. Switch in the REPL with `/provider`, or pin one at launch with
`--provider <id>`.

| id            | how it talks to the model                                     | credentials                                                                                                  |
| ------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `claude-code` | Anthropic Claude via the Claude Agent SDK (default).          | Rides on your existing Claude Code credentials. Nothing extra to configure.                                  |
| `openrouter`  | OpenAI-compatible chat completions against OpenRouter.        | API key (stored locally). Base URL defaults to `https://openrouter.ai/api/v1`.                               |
| `hermes`      | OpenAI-compatible chat completions against a Hermes endpoint. | API key **and** base URL (both stored locally). The URL is the endpoint root, without `/chat/completions`.    |
| `lm-studio`   | Local OpenAI-compatible server (LM Studio).                   | API key is optional (leave blank for the default no-auth setup; set one when running LM Studio behind a proxy or with auth enabled). Base URL defaults to `http://localhost:1234/v1` — override it for a remote LM Studio. |
| `ollama`      | Local Ollama server via its OpenAI-compatible endpoint.       | API key is optional (Ollama is unauthenticated out of the box). Base URL defaults to `http://localhost:11434/v1` — override it for a remote Ollama host or a non-default port. |

The first time you select `openrouter`, `hermes`, `lm-studio`, or `ollama`
via `/provider`, scribe walks through base URL and API key prompts and
writes the result to `~/.config/scribe/providers.json` (mode 0600). For
local backends (`lm-studio`, `ollama`) both fields have sensible defaults —
confirm the URL with Enter, and leave the API key blank to run without auth
(or set one if your local server sits behind a proxy or has auth enabled).
To forget a stored credential:

```bash
pnpm exec nx serve scribe -- logout --provider openrouter
```

Things to know when using OpenRouter, Hermes, LM Studio, or Ollama:

- The journey tools are translated to OpenAI tool-call schemas on the fly via
  Zod's built-in JSON Schema generator. Tool-call quality depends on the
  model — Anthropic and OpenAI flagship models are the most reliable. On
  LM Studio and Ollama, pick a model with native function-calling support
  (e.g. recent Llama 3.x, Qwen 2.5, or Mistral instruct variants).
- Aliases like `opus`/`sonnet`/`haiku` are Claude-specific. Use full model
  ids on OpenRouter (e.g. `anthropic/claude-sonnet-4`,
  `openai/gpt-4o-mini`), on Hermes, and on local backends (the id LM Studio
  or `ollama list` reports for the loaded/pulled model).
- Token usage on non-Claude providers fills `in`/`out` only; cache columns
  show 0 because the OpenAI chat-completions response has no cache fields.
- LM Studio must be running with a model loaded before scribe can talk to
  it. Start the LM Studio server (defaults to port 1234), load a
  tool-capable model, then `/provider lm-studio` in scribe and set `--model`
  to the id shown in LM Studio.
- For Ollama, start the `ollama serve` daemon (defaults to port 11434) and
  pull a tool-capable model (e.g. `ollama pull llama3.1`). Then
  `/provider ollama` in scribe and `/model` to pick the model from the
  list — scribe queries `/v1/models` for the catalog.

## Auth notes

- **Tokens are short-lived.** Firebase ID tokens expire in roughly an hour. If
  the agent surfaces `UNAUTHENTICATED`, run `--force-login`.
- **Superadmin alone is not enough for writes.** The `journeySimpleUpdate`
  mutation goes through `journeyAcl` in
  [apis/api-journeys-modern/src/schema/journey/journey.acl.ts](../../apis/api-journeys-modern/src/schema/journey/journey.acl.ts).
  As of this scaffold, that ACL does not grant superAdmin a blanket write
  override — the operator must be on the journey's team or own the journey.
  Add yourself before troubleshooting if needed.

## How the journey troubleshooter works

The CLI registers five MCP tools backed by GraphQL and in-process logic:

- `resolve_journey` — turn a slug into an id (`adminJourney` query).
- `fetch_journey` — `journeySimpleGet` query.
- `validate_journey` — offline structural linter (codes E001–E008,
  W101–W104, see [src/tools/journey/validateJourney.ts](src/tools/journey/validateJourney.ts)).
- `diff_journey` — pure-function structural diff between two JourneySimple
  documents.
- `update_journey` — `journeySimpleUpdate` mutation.

The agent receives a system prompt
([src/repl/systemPrompt.ts](src/repl/systemPrompt.ts)) that teaches it the
fetch → lint → analyze → propose → diff → re-lint → apply → verify workflow,
including hard rules ("never call update without explicit user approval after
showing a diff", "never retry on FORBIDDEN").

## Layout

```
apps/scribe/
├── README.md
├── eslint.config.mjs
├── project.json
├── tsconfig.json
├── tsconfig.lint.json
└── src/
    ├── main.ts                    # CLI entry — env selection, login, REPL
    ├── agents/
    │   ├── types.ts               # AgentProvider, RawTool, UsageDelta
    │   ├── claudeCode.ts          # Anthropic SDK backend
    │   ├── openaiCompat.ts        # OpenAI-compatible backend (OpenRouter, Hermes)
    │   └── registry.ts            # provider metadata + factory
    ├── auth/
    │   ├── browserLogin.ts        # one-shot localhost listener + open
    │   ├── login.ts               # high-level ensureSession()
    │   └── openBrowser.ts         # cross-platform browser launcher
    ├── config/
    │   ├── credentials.ts         # ~/.config/scribe Firebase persistence
    │   ├── environments.ts        # dev/stage/prod URL table
    │   └── providers.ts           # ~/.config/scribe provider API keys
    ├── graphql/
    │   └── client.ts              # fetch-based GraphQL client
    ├── repl/
    │   ├── App.tsx                # Ink root — owns state + agent loop
    │   ├── runRepl.ts             # mounts Ink onto stdin/stdout
    │   ├── systemPrompt.ts        # journey troubleshooter playbook
    │   ├── commands/
    │   │   ├── registry.ts        # /env /login /logout /clear /help /exit
    │   │   └── types.ts           # SlashCommand + CommandContext
    │   ├── components/
    │   │   ├── Input.tsx          # input box + blinking cursor + slash menu
    │   │   ├── StatusBar.tsx      # env / user / token usage bar
    │   │   └── Transcript.tsx     # scrollback for assistant + tool calls
    │   └── state/
    │       └── types.ts           # ReplState, TranscriptEntry, UsageTotals
    └── tools/
        └── journey/
            ├── api.ts             # GraphQL operations
            ├── diffJourney.ts     # structural diff
            ├── index.ts           # MCP tool registration
            ├── types.ts           # JourneySimple TS types + issue codes
            └── validateJourney.ts # offline linter
```

The cross-app callback page lives in
[apps/journeys-admin/pages/users/cli-auth.tsx](../journeys-admin/pages/users/cli-auth.tsx).
It validates the callback origin (`http://127.0.0.1:<port>` or
`http://localhost:<port>` only), refreshes the Firebase ID token, and POSTs
it back to the CLI.

## Adding a new skill

1. Create a new module under `src/tools/<name>/` exporting a
   `buildXTools(session)` function that returns Agent SDK `tool()`
   definitions.
2. Register the tools in `src/repl/runRepl.ts` (combine with the existing
   `buildJourneyTools` array and extend `allowedTools`).
3. Extend `buildSystemPrompt` to teach the agent when to use the new tools.
   Keep the prompt concrete and short.
