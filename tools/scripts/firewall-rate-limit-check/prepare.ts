/**
 * prepare.ts — resolves the target host and the sentinel duration bound from
 * workflow inputs, then writes them to `GITHUB_OUTPUT` and the run-configuration
 * table to `GITHUB_STEP_SUMMARY`.
 *
 * Reads env: TARGET_ENV, PROBE_COUNT, PROBE_RPS, SENTINEL_PATH.
 *
 * Host literals come from the repo (e.g. apps/journeys/proxy.ts,
 * apis/api-gateway/gateway.prod.config.ts). If a `vars.JOURNEYS_STAGE_HOST` /
 * `vars.JOURNEYS_PROD_HOST` is added later, swap these literals.
 */

import { appendFile } from 'node:fs/promises'

import type { PreparedRun, TargetEnv } from './types'

const HOST_BY_ENV: Record<TargetEnv, string> = {
  stage: 'your-stage.nextstep.is',
  production: 'your.nextstep.is'
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (value == null || value === '') {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

function parsePositiveInt(name: string, raw: string): number {
  if (!/^[0-9]+$/.test(raw)) {
    throw new Error(`${name} must be a positive integer (got: ${raw})`)
  }
  const value = Number.parseInt(raw, 10)
  if (value <= 0) {
    throw new Error(`${name} must be a positive integer (got: ${raw})`)
  }
  return value
}

function parsePositiveNumber(name: string, raw: string): number {
  if (!/^[0-9]+(\.[0-9]+)?$/.test(raw)) {
    throw new Error(`${name} must be a positive number (got: ${raw})`)
  }
  const value = Number.parseFloat(raw)
  if (!(value > 0)) {
    throw new Error(`${name} must be greater than zero (got: ${raw})`)
  }
  return value
}

function resolveHost(targetEnv: string): string {
  if (targetEnv !== 'stage' && targetEnv !== 'production') {
    throw new Error(`Unknown target_env: ${targetEnv}`)
  }
  return HOST_BY_ENV[targetEnv]
}

/** duration = ceil(count / rps) + 15s buffer, used to bound the sentinel. */
function computeDurationSeconds(count: number, rps: number): number {
  return Math.ceil(count / rps) + 15
}

async function writeOutput(
  host: string,
  durationSeconds: number
): Promise<void> {
  const githubOutput = process.env.GITHUB_OUTPUT
  if (githubOutput == null || githubOutput === '') return
  await appendFile(
    githubOutput,
    `host=${host}\nduration_seconds=${durationSeconds}\n`
  )
}

async function writeSummary(args: {
  targetEnv: string
  host: string
  probeCount: number
  probeRps: number
  sentinelPath: string
  durationSeconds: number
}): Promise<void> {
  const githubSummary = process.env.GITHUB_STEP_SUMMARY
  if (githubSummary == null || githubSummary === '') return
  const lines = [
    '## Run configuration',
    '',
    '| Setting | Value |',
    '| --- | --- |',
    `| target_env | \`${args.targetEnv}\` |`,
    `| host | \`${args.host}\` |`,
    `| probe_count | ${args.probeCount} |`,
    `| probe_rps | ${args.probeRps} |`,
    `| sentinel_path | \`${args.sentinelPath}\` |`,
    `| sentinel duration | ~${args.durationSeconds}s |`,
    ''
  ]
  await appendFile(githubSummary, lines.join('\n'))
}

async function main(): Promise<PreparedRun> {
  const targetEnv = requireEnv('TARGET_ENV')
  const probeCountRaw = requireEnv('PROBE_COUNT')
  const probeRpsRaw = requireEnv('PROBE_RPS')
  const sentinelPath = requireEnv('SENTINEL_PATH')

  const probeCount = parsePositiveInt('probe_count', probeCountRaw)
  const probeRps = parsePositiveNumber('probe_rps', probeRpsRaw)
  const host = resolveHost(targetEnv)
  const durationSeconds = computeDurationSeconds(probeCount, probeRps)

  await writeOutput(host, durationSeconds)
  await writeSummary({
    targetEnv,
    host,
    probeCount,
    probeRps,
    sentinelPath,
    durationSeconds
  })

  console.log(`host=${host}`)
  console.log(`duration_seconds=${durationSeconds}`)
  return { host, durationSeconds }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exit(1)
})
