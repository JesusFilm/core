// Resolve target host, validate inputs, emit outputs + summary table.

import { appendFile } from 'node:fs/promises'

const env = (key: string): string => {
  const value = process.env[key]
  if (value == null || value === '') throw new Error(`Missing env: ${key}`)
  return value
}

const HOSTS: Record<string, string> = {
  stage: 'your-stage.nextstep.is',
  production: 'your.nextstep.is'
}

const targetEnv = env('TARGET_ENV')
const probeCount = Number.parseInt(env('PROBE_COUNT'), 10)
const probeRps = Number.parseFloat(env('PROBE_RPS'))
const sentinelPath = env('SENTINEL_PATH')

const host = HOSTS[targetEnv]
if (host == null) throw new Error(`Unknown target_env: ${targetEnv}`)
if (!Number.isInteger(probeCount) || probeCount <= 0)
  throw new Error(`probe_count must be a positive integer (got: ${probeCount})`)
if (!Number.isFinite(probeRps) || probeRps <= 0)
  throw new Error(`probe_rps must be a positive number (got: ${probeRps})`)

// Bound the sentinel: probe duration plus a 15s buffer.
const durationSeconds = Math.ceil(probeCount / probeRps) + 15

await appendFile(env('GITHUB_OUTPUT'), `host=${host}\nduration_seconds=${durationSeconds}\n`)
await appendFile(
  env('GITHUB_STEP_SUMMARY'),
  `## Run configuration

| Setting | Value |
| --- | --- |
| target_env | \`${targetEnv}\` |
| host | \`${host}\` |
| probe_count | ${probeCount} |
| probe_rps | ${probeRps} |
| sentinel_path | \`${sentinelPath}\` |
| sentinel duration | ~${durationSeconds}s |
`
)
