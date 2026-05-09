# scribe

An interactive Claude-driven CLI for operating on the Core platform.

`scribe` signs you in to dev, stage, or production via a browser flow,
caches the resulting Firebase ID token, and drops you into a Claude Agent SDK
prompt with a tightly-scoped tool set. The first built-in skill is the
**journey structure troubleshooter**: it can fetch, lint, diff, and update
journeys via the existing GraphQL gateway operations.

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

# Override the Claude model.
pnpm exec nx serve scribe -- --environment dev --model claude-opus-4-7

# Forget a stored credential.
pnpm exec nx serve scribe -- logout --environment stage
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
| `/env <id>`     | Switch to `dev`, `stage`, or `prod`. Re-uses cached creds, prompts if needed. |
| `/login`        | Force a fresh browser sign-in for the current environment.                    |
| `/logout`       | Clear the cached credential for the current environment and exit.             |
| `/clear`        | Clear the transcript and start a fresh agent session (resets token totals).   |
| `/help`         | List slash commands.                                                          |
| `/exit`         | Quit scribe.                                                                |

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
    ├── auth/
    │   ├── browserLogin.ts        # one-shot localhost listener + open
    │   ├── login.ts               # high-level ensureSession()
    │   └── openBrowser.ts         # cross-platform browser launcher
    ├── config/
    │   ├── credentials.ts         # ~/.config/scribe persistence
    │   └── environments.ts        # dev/stage/prod URL table
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
