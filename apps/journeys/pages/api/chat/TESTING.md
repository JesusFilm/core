# /api/chat — End-to-end test plan (NES-1572)

Verifies that **every** terminal path in the handler ships its Langfuse
trace, including the pipe-step failure path that's only reachable on a
live serverless deploy.

The unit tests in `index.spec.ts` cover handler structure (callbacks
fire, single flush, no double-end). They cannot reproduce the
production-only behavior the fix targets: **Vercel freezing the lambda
after the response stream closes**. That has to be verified on stage.

## Where to test

Stage / Vercel preview only. Locally the Node process never freezes, so
the original bug cannot manifest — local runs only confirm the trace
shape, not the lifecycle guarantee.

Preview URL: `https://journeys-9094-jesusfilm.vercel.app` (or whatever
the most recent preview deploy resolves to).

Langfuse project: `development`. Filter on `name = apologist-chat` and
the test session id to find each run.

## Setup

1. Confirm the preview deploy is up-to-date with the PR head:
   ```bash
   gh pr view 9094 --repo JesusFilm/core --json statusCheckRollup
   ```
2. Open the chat on the preview URL in a browser. The frontend mints
   a session id in `sessionStorage` — note it from devtools
   (`sessionStorage.getItem('aiChat.sessionId')`). Use that to find your
   traces.

## Test matrix

Run each scenario, then check Langfuse for the resulting trace.

| # | Scenario | How to trigger | Expected trace |
|---|---|---|---|
| 1 | **Happy path** | Send a normal message in the chat UI; let it complete. | One `apologist-generation` with `level: DEFAULT`, `output` populated, token usage recorded. |
| 2 | **Upstream model error** | Temporarily set the preview's `APOLOGIST_MODEL_ID` env var to `invalid/bad/id` in Vercel, redeploy, send a message. | Generation `level: ERROR`, `statusMessage` populated. Restore env var after. |
| 3 | **Sync config throw** | Temporarily clear `APOLOGIST_API_KEY` in Vercel, redeploy, send a message. | UI sees 503; **no** trace in Langfuse (handler returns before tracing). Restore env var after. |
| 4 | **Mid-stream client disconnect** ⭐ | From a terminal: `curl -N --max-time 0.5 -X POST https://journeys-9094-jesusfilm.vercel.app/api/chat -H 'content-type: application/json' -d '{"messages":[{"role":"user","content":"tell me a long story about the early church"}],"sessionId":"<uuid>","journeyId":"<id>"}'` | Generation `level: ERROR`, `statusMessage: 'pipe error'` (or similar). **This is the case the fix targets.** |

`<uuid>` and `<id>` can be any unique strings — pick something searchable
(e.g. `disconnect-test-<timestamp>`).

## Pass criteria

- Scenarios 1 + 2: trace appears with the expected level and payload
  within ~30s.
- Scenario 3: no trace at all.
- Scenario 4: trace appears with ERROR level. **The trace landing
  despite the client hanging up mid-stream is the proof Option B works.**

## Common issues

- **No trace at all in scenario 1 or 2:** check Langfuse env vars on
  the preview (`LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` /
  `LANGFUSE_BASE_URL`). The handler is a no-op for tracing when any of
  these are unset, by design.
- **Trace stuck "running" with no end:** that's the original bug.
  Should not happen with Option B; if it does, capture the request id
  and re-run.
- **Scenario 4 trace shows `level: DEFAULT` instead of `ERROR`:** the
  upstream finished before curl killed the connection. Re-run with a
  longer prompt or shorter `--max-time`.

## Cleanup

- Restore any env vars touched in scenarios 2 + 3.
- The session ids are scoped to `sessionStorage` and don't need
  cleanup; they'll be replaced on the next tab.
