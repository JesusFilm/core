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

// Find the position of a YAML line comment marker, or -1 if none.
// Only treats '#' as a comment when at the start of the line or preceded
// by whitespace — keeps URLs/fragments-in-strings safe.
const findCommentStart = (line: string): number => {
  for (let index = 0; index < line.length; index++) {
    if (line[index] !== '#') continue
    if (index === 0 || /\s/.test(line[index - 1])) return index
  }
  return -1
}

// Minimal YAML reader: flat `key: scalar` only. Supports comments, blank
// lines, and single/double-quoted values. Rejects nesting / lists with a
// clear error so we fail loudly if a scenario file outgrows this format.
const parseScenarioYaml = (
  text: string,
  filename: string
): Record<string, string> => {
  const out: Record<string, string> = {}
  const lines = text.split(/\r?\n/)
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineNumber = lineIndex + 1
    const rawLine = lines[lineIndex]
    const commentStart = findCommentStart(rawLine)
    const stripped =
      commentStart >= 0 ? rawLine.slice(0, commentStart) : rawLine
    const trimmed = stripped.trim()
    if (trimmed === '') continue
    if (stripped !== stripped.trimStart())
      throw new Error(
        `${filename}:${lineNumber}: indented lines are not supported (flat key: value only)`
      )
    if (trimmed.startsWith('-'))
      throw new Error(
        `${filename}:${lineNumber}: lists are not supported (flat key: value only)`
      )
    const colonIndex = trimmed.indexOf(':')
    if (colonIndex === -1)
      throw new Error(
        `${filename}:${lineNumber}: expected 'key: value', got '${trimmed}'`
      )
    const key = trimmed.slice(0, colonIndex).trim()
    let value = trimmed.slice(colonIndex + 1).trim()
    if (!/^[a-z_][a-z0-9_]*$/i.test(key))
      throw new Error(`${filename}:${lineNumber}: invalid key '${key}'`)
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1)
    }
    if (value === '' || value === 'null' || value === '~') continue
    out[key] = value
  }
  return out
}

const loadScenario = (yamlPath: string): ScenarioConfig => {
  let text: string
  try {
    text = readFileSync(yamlPath, 'utf8')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`cannot read scenario file '${yamlPath}': ${message}`)
  }
  const parsed = parseScenarioYaml(text, yamlPath)
  for (const key of Object.keys(parsed)) {
    if (!SCENARIO_KEYS.includes(key as ScenarioKey))
      throw new Error(`${yamlPath}: unknown key '${key}'`)
  }
  if (parsed.url == null || parsed.url === '')
    throw new Error(`${yamlPath}: 'url' is required`)
  if ((parsed.rps == null) === (parsed.rpm == null))
    throw new Error(
      `${yamlPath}: set exactly one of 'rps' or 'rpm' (got ${
        parsed.rps != null && parsed.rpm != null ? 'both' : 'neither'
      })`
    )
  return parsed as ScenarioConfig
}

const ensureK6Installed = (): void => {
  const result = spawnSync('k6', ['version'], { stdio: 'ignore' })
  if (result.error != null && (result.error as NodeJS.ErrnoException).code === 'ENOENT')
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
    console.error('Usage: pnpm exec tsx tools/load-test/run-chat.ts <path-to-scenario.yaml>')
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
  const runId = scenario.run_id ?? `${scenarioName}-${isoTimestampForFilename()}`

  const finalEnv: Record<string, string> = { RUN_ID: runId }
  for (const key of SCENARIO_KEYS) {
    if (key === 'run_id') continue
    const value = scenario[key]
    if (value != null && value !== '') finalEnv[ENV_KEY_BY_YAML_KEY[key]] = value
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
  console.error(`error: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
}
