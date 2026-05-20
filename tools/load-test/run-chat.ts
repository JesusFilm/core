// Run the /api/chat load-test target with parameters from a YAML scenario.
//
// Usage:
//   pnpm exec tsx tools/load-test/run-chat.ts <path-to-scenario.yaml>
//
// Example:
//   pnpm exec tsx tools/load-test/run-chat.ts tools/load-test/scenarios/firewall-trip.yaml
//
// YAML keys map 1:1 to env vars read by tools/load-test/lib/scenario.js —
// see tools/load-test/README.md.

import { spawn, spawnSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { basename, resolve } from 'node:path'

import { YAMLParseError, parse as parseYaml } from 'yaml'

type ScenarioConfig = {
  url: string
  rps?: string
  rpm?: string
  duration?: string
  vus?: string
  max_vus?: string
  max_iterations?: string
  run_id?: string
  message?: string
}

const SCENARIO_KEYS = [
  'url',
  'rps',
  'rpm',
  'duration',
  'vus',
  'max_vus',
  'max_iterations',
  'run_id',
  'message'
] as const

type ScenarioKey = (typeof SCENARIO_KEYS)[number]

const ENV_KEY_BY_YAML_KEY: Record<ScenarioKey, string> = {
  url: 'URL',
  rps: 'RPS',
  rpm: 'RPM',
  duration: 'DURATION',
  vus: 'VUS',
  max_vus: 'MAX_VUS',
  max_iterations: 'MAX_ITERATIONS',
  run_id: 'RUN_ID',
  message: 'MESSAGE'
}

const REPO_ROOT = resolve(__dirname, '..', '..')
const SCENARIOS_DIR = 'tools/load-test/scenarios'
const TARGET_PATH = 'tools/load-test/targets/chat.js'

const loadScenario = (yamlPath: string): ScenarioConfig => {
  let text: string
  try {
    text = readFileSync(yamlPath, 'utf8')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`cannot read scenario file '${yamlPath}': ${message}`)
  }

  let parsed: unknown
  try {
    parsed = parseYaml(text)
  } catch (error) {
    if (error instanceof YAMLParseError)
      throw new Error(`${yamlPath}: ${error.message}`)
    throw error
  }

  if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed))
    throw new Error(`${yamlPath}: expected a YAML mapping (key: value)`)

  const fields: Record<string, string> = {}
  for (const [key, rawValue] of Object.entries(parsed)) {
    if (!SCENARIO_KEYS.includes(key as ScenarioKey))
      throw new Error(`${yamlPath}: unknown key '${key}'`)
    if (rawValue == null) continue
    if (typeof rawValue === 'object')
      throw new Error(
        `${yamlPath}: key '${key}' must be a scalar (got ${Array.isArray(rawValue) ? 'list' : 'object'})`
      )
    fields[key] = String(rawValue)
  }

  if (fields.url == null || fields.url === '')
    throw new Error(`${yamlPath}: 'url' is required`)
  if ((fields.rps == null) === (fields.rpm == null))
    throw new Error(
      `${yamlPath}: set exactly one of 'rps' or 'rpm' (got ${
        fields.rps != null && fields.rpm != null ? 'both' : 'neither'
      })`
    )
  return fields as ScenarioConfig
}

const ensureK6Installed = (): void => {
  const result = spawnSync('k6', ['version'], { stdio: 'ignore' })
  if (
    result.error != null &&
    (result.error as NodeJS.ErrnoException).code === 'ENOENT'
  )
    throw new Error('k6 is not installed. Run: brew install k6')
  if (result.status !== 0 && result.error == null)
    throw new Error(`k6 version check exited with status ${result.status}`)
}

const listAvailableScenarios = (): string[] => {
  try {
    return readdirSync(resolve(REPO_ROOT, SCENARIOS_DIR))
      .filter((name) => name.endsWith('.yaml') || name.endsWith('.yml'))
      .sort()
      .map((name) => `${SCENARIOS_DIR}/${name}`)
  } catch {
    return []
  }
}

const isoTimestampForFilename = (): string => {
  const now = new Date()
  const pad = (value: number): string => String(value).padStart(2, '0')
  return (
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`
  )
}

const main = (): void => {
  const args = process.argv.slice(2)
  if (args.length !== 1) {
    console.error(
      'Usage: pnpm exec tsx tools/load-test/run-chat.ts <path-to-scenario.yaml>'
    )
    const available = listAvailableScenarios()
    if (available.length > 0) {
      console.error('')
      console.error('Available scenarios:')
      for (const path of available) console.error(`  ${path}`)
    }
    process.exit(2)
  }

  const yamlPath = args[0]
  const scenario = loadScenario(yamlPath)
  ensureK6Installed()

  const scenarioName = basename(yamlPath).replace(/\.(yaml|yml)$/, '')
  // Treat empty / whitespace-only run_id as missing — otherwise it would
  // produce a broken result filename like `results/.json`.
  const explicitRunId = scenario.run_id?.trim()
  const runId =
    explicitRunId != null && explicitRunId !== ''
      ? explicitRunId
      : `${scenarioName}-${isoTimestampForFilename()}`

  const finalEnv: Record<string, string> = { RUN_ID: runId }
  for (const key of SCENARIO_KEYS) {
    if (key === 'run_id') continue
    const value = scenario[key]
    if (value != null && value !== '')
      finalEnv[ENV_KEY_BY_YAML_KEY[key]] = value
  }
  finalEnv.RUN_ID = runId

  const k6Args = ['run', TARGET_PATH]
  for (const [key, value] of Object.entries(finalEnv))
    k6Args.push('--env', `${key}=${value}`)

  console.log('=== chat load-test ===')
  console.log(`Scenario:  ${yamlPath}`)
  console.log(`URL:       ${scenario.url}`)
  console.log(
    `Rate:      ${scenario.rpm != null ? `RPM=${scenario.rpm}` : `RPS=${scenario.rps}`}`
  )
  console.log(`Duration:  ${scenario.duration ?? '(default)'}`)
  console.log(`VUs:       ${scenario.vus ?? '(auto)'}`)
  console.log(`Run ID:    ${runId}`)
  console.log(`Result:    tools/load-test/results/${runId}.json`)
  console.log('')

  const child = spawn('k6', k6Args, { stdio: 'inherit', cwd: REPO_ROOT })
  child.on('exit', (code, signal) => {
    if (signal != null) process.kill(process.pid, signal)
    else process.exit(code ?? 1)
  })
  child.on('error', (error) => {
    console.error(`failed to spawn k6: ${error.message}`)
    process.exit(1)
  })
}

try {
  main()
} catch (error) {
  console.error(
    `error: ${error instanceof Error ? error.message : String(error)}`
  )
  process.exit(1)
}
