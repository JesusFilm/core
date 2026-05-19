// Target: POST /api/chat on Journeys.
//
// Defines payload + headers for the chat endpoint. Load shape (rate, VUs,
// duration) comes from env vars set by run-chat.ts from a YAML scenario
// under tools/load-test/scenarios/.
//
// Identity model
// - /api/chat does not authenticate today (no token/cookie/header check).
// - sessionId is stable per VU (`<runId>-vu-<__VU>`) so the same VU's
//   iterations group into a single Langfuse trace, mirroring a sustained
//   browser session. Distinct VUs get distinct sessionIds — useful for
//   trace separation, NOT for rate-limit isolation (the firewall keys on
//   source IP, which is the same for every VU on this machine).
//
// To add a new endpoint target: copy this file to targets/<name>.js, change
// the buildRequest body, pass `name: '<name>'` to buildScenario, and add
// a wrapper modelled on run-chat.ts (swap the TARGET_PATH constant).

import { buildScenario } from '../lib/scenario.js'

const runId = __ENV.RUN_ID || `local-${Date.now()}`
const message = __ENV.MESSAGE || 'load test probe'

const buildRequest = () => ({
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': `nes-1581-load-test/1.0 (k6; run=${runId})`
  },
  body: JSON.stringify({
    // ai@^6 UIMessage shape: { id, role, parts: [{type:'text', text}] }.
    // The handler accepts the legacy `content` field via zod, but
    // convertToModelMessages then rejects it — schema-pass, runtime-fail.
    messages: [
      {
        id: `${runId}-${__VU}-${__ITER}`,
        role: 'user',
        parts: [{ type: 'text', text: message }]
      }
    ],
    sessionId: `${runId}-vu-${__VU}`
  })
})

const scenario = buildScenario({ name: 'chat', buildRequest })

export const options = scenario.options
export default scenario.fn
export const handleSummary = scenario.handleSummary
