import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterAll, describe, expect, it } from 'vitest'

import { judge } from './src/judge'
import { runScenario } from './src/runScenario'
import type {
  EvalProvider,
  JudgeResult,
  Scenario,
  ScenarioModel
} from './src/types'

interface CellMeta {
  scenarioSlug: string
  scenarioName: string
  promptName: string
  promptLabel: string
  provider: string
  modelId: string
  score: number
  pass: boolean
  reason: string
  lastRun: string
  error?: string
  generationAttempts?: number
  judgeAttempts?: number
}

interface CellRun {
  scenario: Scenario
  modelSpec: ScenarioModel
  output: string
  verdict: JudgeResult
  error?: string
  generationAttempts?: number
  judgeAttempts?: number
}

const META_OPEN = '<!-- llm-eval-meta'
const META_CLOSE = '-->'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '../..')
const resultsRoot = resolve(here, 'results')

const scenarioModules = import.meta.glob<{ default: Scenario }>(
  './scenarios/**/*.eval.ts',
  { eager: true }
)
const scenarios: Scenario[] = Object.values(scenarioModules).map(
  (m) => m.default
)

const scenarioFilter = process.env.EVAL_SCENARIO?.trim() ?? ''
const modelFilter = process.env.EVAL_MODEL?.trim() ?? ''
const modelOverrides = parseModelOverrides(process.env.EVAL_MODELS)
const maxAttempts = Number.parseInt(process.env.EVAL_MAX_ATTEMPTS ?? '8', 10)

if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
  throw new Error('EVAL_MAX_ATTEMPTS must be a positive integer')
}

function parseModelOverrides(raw: string | undefined): ScenarioModel[] | null {
  if (raw == null || raw.trim() === '') return null
  return raw.split(',').map((rawEntry) => {
    const entry = rawEntry.trim()
    const separator = entry.indexOf(':')
    const provider = entry.slice(0, separator) as EvalProvider
    const modelId = entry.slice(separator + 1).trim()
    if (
      separator < 1 ||
      modelId === '' ||
      !['apologist', 'openrouter', 'gemini'].includes(provider)
    ) {
      throw new Error(`Invalid EVAL_MODELS entry: ${entry}`)
    }
    return { provider, modelId }
  })
}

interface MatrixCell {
  scenario: Scenario
  modelSpec: ScenarioModel
}

function buildMatrix(): MatrixCell[] {
  const cells: MatrixCell[] = []
  for (const scenario of scenarios) {
    const slug = slugify(scenario.name)
    if (scenarioFilter !== '' && slug !== scenarioFilter) continue
    for (const modelSpec of modelOverrides ?? scenario.models) {
      if (modelFilter !== '' && modelKey(modelSpec) !== modelFilter) continue
      cells.push({ scenario, modelSpec })
    }
  }
  return cells
}

const matrix = buildMatrix()
const runs: CellRun[] = []

async function executeCell(cell: MatrixCell): Promise<CellRun> {
  let output = ''
  let generationAttempts: number | undefined
  let stage: 'generation' | 'judge' = 'generation'
  try {
    const generated = await retryOperation(() =>
      runScenario(cell.scenario, cell.modelSpec)
    )
    const run = generated.value
    generationAttempts = generated.attempts
    output = run.output
    stage = 'judge'
    const judged = await retryOperation(() =>
      judge({
        scenario: cell.scenario,
        systemPrompt: run.systemPrompt,
        output
      })
    )
    return {
      scenario: cell.scenario,
      modelSpec: cell.modelSpec,
      output,
      verdict: judged.value,
      generationAttempts,
      judgeAttempts: judged.attempts
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const failedAttempts =
      err instanceof RetryFailure ? err.attempts : undefined
    return {
      scenario: cell.scenario,
      modelSpec: cell.modelSpec,
      output,
      verdict: {
        pass: false,
        score: 0,
        reason: `Run inconclusive before judgment: ${message}`
      },
      error: message,
      generationAttempts:
        stage === 'generation' ? failedAttempts : generationAttempts,
      judgeAttempts: stage === 'judge' ? failedAttempts : undefined
    }
  }
}

interface Attempted<T> {
  value: T
  attempts: number
}

class RetryFailure extends Error {
  constructor(
    message: string,
    readonly attempts: number
  ) {
    super(message)
  }
}

async function retryOperation<T>(
  operation: () => Promise<T>
): Promise<Attempted<T>> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return { value: await operation(), attempts: attempt }
    } catch (error) {
      if (attempt === maxAttempts || !isRetryable(error)) {
        const message = error instanceof Error ? error.message : String(error)
        throw new RetryFailure(
          `${message} (after ${attempt} attempt${attempt === 1 ? '' : 's'})`,
          attempt
        )
      }
      console.warn(
        `Transient eval error; retrying attempt ${attempt + 1}/${maxAttempts}`
      )
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(500 * 2 ** (attempt - 1), 4000))
      )
    }
  }
  throw new Error('Retry loop exhausted without a result')
}

function isRetryable(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return true
  const statusCode = 'statusCode' in error ? error.statusCode : undefined
  if (typeof statusCode !== 'number') return true
  return (
    statusCode === 408 ||
    statusCode === 409 ||
    statusCode === 429 ||
    statusCode >= 500
  )
}

describe('llm-evals', () => {
  if (scenarios.length === 0) {
    it.skip('no scenarios found under libs/llm-evals/scenarios/**/*.eval.ts', () => {
      // intentionally empty
    })

    return
  }

  if (matrix.length === 0) {
    it.skip(`no (scenario, model) cells matched filters (EVAL_SCENARIO=${scenarioFilter}, EVAL_MODEL=${modelFilter})`, () => {
      // intentionally empty
    })

    return
  }

  for (const cell of matrix) {
    const slug = slugify(cell.scenario.name)
    const key = modelKey(cell.modelSpec)

    it(`${slug} × ${key}`, async () => {
      const run = await executeCell(cell)
      runs.push(run)

      const { verdict } = run
      console.log(
        [
          '',
          `--- ${cell.scenario.name} × ${key} ---`,
          `Prompt:  ${cell.scenario.promptName}@${cell.scenario.promptLabel}`,
          `Output:  ${run.output.slice(0, 300)}${run.output.length > 300 ? '…' : ''}`,
          `Score:   ${run.error == null ? `${verdict.score.toFixed(2)} (pass=${verdict.pass})` : 'n/a (inconclusive)'}`,
          `Calls:   generation=${run.generationAttempts ?? 'n/a'} judge=${run.judgeAttempts ?? 'n/a'}`,
          `Reason:  ${verdict.reason}`,
          ''
        ].join('\n')
      )

      if (run.error != null && run.error !== '') {
        throw new Error(run.error)
      }

      expect(
        verdict.pass,
        `Judge rejected output. score=${verdict.score.toFixed(2)} reason=${verdict.reason}`
      ).toBe(true)
    })
  }

  afterAll(() => {
    if (runs.length === 0) return
    const updatedAt = new Date()
    const updatedCells: CellMeta[] = []
    for (const run of runs) {
      const meta = writeCellArtifact(run, updatedAt)
      updatedCells.push(meta)
    }
    const allCells = mergeWithExistingCells(updatedCells)
    writeSummary(allCells, updatedCells, updatedAt)
    console.log(
      `\nResults written to ${relative(repoRoot, resultsRoot)}/ (summary.md + ${updatedCells.length} cell file${updatedCells.length === 1 ? '' : 's'} updated)`
    )
  })
})

function writeCellArtifact(run: CellRun, at: Date): CellMeta {
  const scenarioSlug = slugify(run.scenario.name)
  const scenarioDir = resolve(resultsRoot, scenarioSlug)
  mkdirSync(scenarioDir, { recursive: true })

  const filename = `${modelSlug(run.modelSpec)}.md`
  const filePath = resolve(scenarioDir, filename)

  const meta: CellMeta = {
    scenarioSlug,
    scenarioName: run.scenario.name,
    promptName: run.scenario.promptName,
    promptLabel: run.scenario.promptLabel,
    provider: run.modelSpec.provider,
    modelId: run.modelSpec.modelId,
    score: run.verdict.score,
    pass: run.verdict.pass,
    reason: run.verdict.reason,
    lastRun: at.toISOString(),
    error: run.error,
    generationAttempts: run.generationAttempts,
    judgeAttempts: run.judgeAttempts
  }

  writeFileSync(filePath, buildCellMarkdown(run, meta))
  return meta
}

function buildCellMarkdown(run: CellRun, meta: CellMeta): string {
  const threshold = run.scenario.passingScore ?? 0.7
  const lines: string[] = []

  lines.push(`${META_OPEN}\n${JSON.stringify(meta)}\n${META_CLOSE}`)
  lines.push('')
  lines.push(`# ${run.scenario.name} — ${meta.provider}:${meta.modelId}`)
  lines.push('')
  lines.push(`_Last run: ${meta.lastRun}_`)
  lines.push('')
  lines.push(
    `- **Prompt:** \`${run.scenario.promptName}@${run.scenario.promptLabel}\``
  )
  lines.push(`- **Model:** ${meta.provider}:${meta.modelId}`)
  lines.push(
    run.error == null
      ? `- **Score:** ${run.verdict.score.toFixed(2)} (pass=${run.verdict.pass}, threshold=${threshold})`
      : '- **Score:** Not judged (generation or judge error)'
  )
  if (run.generationAttempts != null) {
    lines.push(`- **Generation attempts:** ${run.generationAttempts}`)
  }
  if (run.judgeAttempts != null) {
    lines.push(`- **Judge attempts:** ${run.judgeAttempts}`)
  }
  if (run.error != null && run.error !== '') {
    lines.push(`- **Error:** ${run.error}`)
  }
  if (run.scenario.description != null && run.scenario.description !== '') {
    lines.push('')
    lines.push(`**Scenario description:** ${run.scenario.description}`)
  }
  lines.push('')
  lines.push('## Query')
  lines.push('')
  lines.push(blockquote(run.scenario.query))
  lines.push('')
  lines.push('## Output')
  lines.push('')
  lines.push(
    run.output !== '' ? blockquote(run.output) : '> _(no output — run failed)_'
  )
  lines.push('')
  lines.push('## Reason')
  lines.push('')
  lines.push(blockquote(run.verdict.reason))
  lines.push('')
  lines.push('## Acceptable examples')
  lines.push('')
  for (const ex of run.scenario.acceptableExamples) {
    lines.push(`- ${ex}`)
  }
  lines.push('')
  const unacceptable = run.scenario.unacceptableExamples ?? []
  if (unacceptable.length > 0) {
    lines.push('## Unacceptable examples')
    lines.push('')
    for (const ex of unacceptable) {
      lines.push(`- ${ex}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

function mergeWithExistingCells(updated: CellMeta[]): CellMeta[] {
  const updatedKeys = new Set(updated.map(cellKey))
  const existing = scanExistingCells().filter(
    (cell) => !updatedKeys.has(cellKey(cell))
  )
  return [...existing, ...updated].sort((a, b) => {
    if (a.scenarioSlug !== b.scenarioSlug)
      return a.scenarioSlug.localeCompare(b.scenarioSlug)
    return cellKey(a).localeCompare(cellKey(b))
  })
}

function scanExistingCells(): CellMeta[] {
  if (!existsSync(resultsRoot)) return []
  const cells: CellMeta[] = []
  const scenarioDirs = readdirSync(resultsRoot, { withFileTypes: true })
  for (const dir of scenarioDirs) {
    if (!dir.isDirectory()) continue
    const scenarioDir = resolve(resultsRoot, dir.name)
    const files = readdirSync(scenarioDir, { withFileTypes: true })
    for (const f of files) {
      if (!f.isFile() || !f.name.endsWith('.md')) continue
      const meta = readCellMeta(resolve(scenarioDir, f.name))
      if (meta != null) cells.push(meta)
    }
  }
  return cells
}

function readCellMeta(filePath: string): CellMeta | null {
  const content = readFileSync(filePath, 'utf8')
  const start = content.indexOf(META_OPEN)
  if (start === -1) return null
  const end = content.indexOf(META_CLOSE, start + META_OPEN.length)
  if (end === -1) return null
  const json = content.slice(start + META_OPEN.length, end).trim()
  try {
    const parsed = JSON.parse(json) as CellMeta
    if (
      typeof parsed.scenarioSlug !== 'string' ||
      typeof parsed.provider !== 'string' ||
      typeof parsed.modelId !== 'string' ||
      typeof parsed.score !== 'number' ||
      typeof parsed.pass !== 'boolean' ||
      typeof parsed.reason !== 'string' ||
      typeof parsed.lastRun !== 'string'
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeSummary(
  cells: CellMeta[],
  updatedCells: CellMeta[],
  at: Date
): void {
  mkdirSync(resultsRoot, { recursive: true })

  const lines: string[] = []
  lines.push('# llm-evals — latest recorded results')
  lines.push('')
  lines.push(`_Last updated: ${at.toISOString()}_`)
  lines.push('')

  const judgedCells = cells.filter((c) => c.error == null)
  const judgedRunCells = updatedCells.filter((c) => c.error == null)
  const passed = judgedCells.filter((c) => c.pass).length
  const runPassed = judgedRunCells.filter((c) => c.pass).length
  const scenarios = new Set(cells.map((c) => c.scenarioSlug))
  lines.push(
    `**This run: ${runPassed}/${judgedRunCells.length} judged cells passing**; ${updatedCells.length - judgedRunCells.length} inconclusive${modelFilter === '' ? '' : ` for \`${modelFilter}\``}.`
  )
  lines.push('')
  lines.push(
    `**Saved matrix: ${passed}/${judgedCells.length} judged cells passing** across ${scenarios.size} scenario(s); ${cells.length - judgedCells.length} inconclusive. These cells were last run on different dates; compare their timestamps before comparing models.`
  )
  lines.push('')

  const byScenario = new Map<string, CellMeta[]>()
  for (const c of cells) {
    const bucket = byScenario.get(c.scenarioSlug) ?? []
    bucket.push(c)
    byScenario.set(c.scenarioSlug, bucket)
  }

  const sortedScenarios = Array.from(byScenario.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  )

  for (const [, group] of sortedScenarios) {
    const head = group[0]
    const sortedGroup = [...group].sort((a, b) =>
      `${a.provider}:${a.modelId}`.localeCompare(`${b.provider}:${b.modelId}`)
    )

    lines.push('---')
    lines.push('')
    lines.push(`## ${head.scenarioName}`)
    lines.push('')
    lines.push(`\`${head.promptName}@${head.promptLabel}\``)
    lines.push('')

    lines.push('| Model | Score | Pass | Last run | Report |')
    lines.push('|---|---:|:---:|---|---|')
    for (const c of sortedGroup) {
      const score = c.error == null ? c.score.toFixed(2) : '—'
      const passIndicator = c.error != null ? '⚪' : c.pass ? '🟢' : '🔴'
      const modelCell = `${c.provider}:${c.modelId}`
      const reportPath = `${c.scenarioSlug}/${modelSlug({
        provider: c.provider as 'openrouter' | 'gemini' | 'apologist',
        modelId: c.modelId
      })}.md`
      lines.push(
        `| ${escapeCell(modelCell)} | ${score} | ${passIndicator} | ${shortTime(c.lastRun)} | [→](${reportPath}) |`
      )
    }
    lines.push('')

    lines.push('### Judge reasoning')
    lines.push('')
    for (const c of sortedGroup) {
      const passIndicator = c.error != null ? '⚪' : c.pass ? '🟢' : '🔴'
      lines.push(
        `**${c.provider}:${c.modelId}** — ${c.error == null ? c.score.toFixed(2) : 'not judged'} ${passIndicator}`
      )
      lines.push('')
      lines.push(blockquote(c.reason))
      lines.push('')
    }
  }

  writeFileSync(resolve(resultsRoot, 'summary.md'), lines.join('\n'))
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function modelSlug(spec: ScenarioModel): string {
  return `${spec.provider}__${spec.modelId.replace(/[^a-zA-Z0-9.-]+/g, '-')}`
}

function modelKey(spec: ScenarioModel): string {
  return `${spec.provider}:${spec.modelId}`
}

function cellKey(meta: {
  scenarioSlug: string
  provider: string
  modelId: string
}): string {
  return `${meta.scenarioSlug}|${meta.provider}:${meta.modelId}`
}

function shortTime(iso: string): string {
  return iso.replace(/T/, ' ').replace(/\..*$/, '').replace(/Z$/, '')
}

function blockquote(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trimEnd())
    .map((line) => (line === '' ? '>' : `> ${line}`))
    .join('\n')
}

function escapeCell(text: string): string {
  // Escape backslashes first, then pipes, then newlines — order matters.
  // Without escaping backslashes first, a literal "\" in input would
  // collide with the "\|" escape sequence we add for pipes.
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ')
}
