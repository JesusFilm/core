// Target: POST /api/chat on Journeys.
//
// Defines payload + headers for the chat endpoint. Load shape (rate, VUs,
// duration) comes from env vars set by run-chat.sh from a YAML scenario
// under tools/load-test/scenarios/.
//
// To add a new endpoint target: copy this file to targets/<name>.js, change
// the buildRequest body, pass `name: '<name>'` to buildScenario, and either
// add a new wrapper script or invoke directly via k6.

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
    messages: [{ role: 'user', content: message }],
    sessionId: `load-test-${runId}-${__VU}-${__ITER}`
  })
})

const scenario = buildScenario({ name: 'chat', buildRequest })

export const options = scenario.options
export default scenario.fn
export const handleSummary = scenario.handleSummary
