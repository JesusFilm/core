import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterAll, describe, expect, it } from 'vitest'

import { judge } from './src/judge'
import { runScenario } from './src/runScenario'
import type { JudgeResult, Scenario } from './src/types'

interface ScenarioRunRecord {
  scenario: Scenario
  output: string
  evalProvider: string
  evalModelId: string
  verdict: JudgeResult
  error?: string
}

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '../..')

const modules = import.meta.glob<{ default: Scenario }>(
  './scenarios/**/*.eval.ts',
  { eager: true }
)
const scenarios: Scenario[] = Object.values(modules).map((m) => m.default)
const records: ScenarioRunRecord[] = []

async function executeScenario(
  scenario: Scenario
): Promise<ScenarioRunRecord> {
  let output = ''
  let evalProvider = ''
  let evalModelId = ''
  try {
    const run = await runScenario(scenario)
    output = run.output
    evalProvider = run.provider
    evalModelId = run.modelId
    const verdict = await judge({
      scenario,
      systemPrompt: run.systemPrompt,
      output
    })
    return { scenario, output, evalProvider, evalModelId, verdict }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return {
      scenario,
      output,
      evalProvider,
      evalModelId,
      verdict: {
        pass: false,
        score: 0,
        reason: `Run failed before completion: ${message}`
      },
      error: message
    }
  }
}

describe('llm-evals', () => {
  if (scenarios.length === 0) {
    it.skip('no scenarios found under libs/llm-evals/scenarios/**/*.eval.ts', () => {
      // intentionally empty
    })

    return
  }

  for (const scenario of scenarios) {
    it(`${scenario.name} [prompt=${scenario.promptName}@${scenario.promptLabel}]`, async () => {
      const record = await executeScenario(scenario)
      records.push(record)

      const { verdict, evalProvider, evalModelId } = record
      console.log(
        [
          '',
          `--- ${scenario.name} ---`,
          `Model:    ${evalProvider}:${evalModelId}`,
          `Prompt:   ${scenario.promptName}@${scenario.promptLabel}`,
          `Query:    ${scenario.query}`,
          `Output:   ${record.output}`,
          `Score:    ${verdict.score.toFixed(2)} (pass=${verdict.pass})`,
          `Reason:   ${verdict.reason}`,
          ''
        ].join('\n')
      )

      if (record.error != null && record.error !== '') {
        throw new Error(record.error)
      }

      expect(
        verdict.pass,
        `Judge rejected output. score=${verdict.score.toFixed(2)} reason=${verdict.reason}`
      ).toBe(true)
    })
  }

  afterAll(() => {
    if (records.length === 0) return
    const dir = writeReports(records, new Date())
    console.log(`\nReports written to ${relative(repoRoot, dir)}/`)
  })
})

function writeReports(rows: ScenarioRunRecord[], at: Date): string {
  const stamp = at.toISOString().replace(/[:.]/g, '-')
  const runDir = resolve(here, 'results', stamp)
  mkdirSync(runDir, { recursive: true })

  const filenames: string[] = []
  rows.forEach((row, index) => {
    const filename = `${pad2(index + 1)}-${slugify(row.scenario.name)}.md`
    filenames.push(filename)
    writeFileSync(resolve(runDir, filename), buildScenarioMarkdown(row, at))
  })

  writeFileSync(
    resolve(runDir, 'summary.md'),
    buildSummaryMarkdown(rows, filenames, at)
  )

  return runDir
}

function buildSummaryMarkdown(
  rows: ScenarioRunRecord[],
  filenames: string[],
  at: Date
): string {
  const lines: string[] = []
  lines.push(`# llm-evals run — ${at.toISOString()}`)
  lines.push('')

  const passed = rows.filter((r) => r.verdict.pass).length
  lines.push(`**${passed}/${rows.length} scenarios passed.**`)
  lines.push('')

  lines.push('| # | Scenario | Prompt | Model | Score | Pass | Report |')
  lines.push('|---|---|---|---|---:|:---:|---|')
  rows.forEach((r, index) => {
    const score = r.verdict.score.toFixed(2)
    const pass = r.verdict.pass ? '✓' : '✗'
    const promptCell = `\`${r.scenario.promptName}@${r.scenario.promptLabel}\``
    const modelCell =
      r.evalProvider !== '' ? `${r.evalProvider}:${r.evalModelId}` : '—'
    lines.push(
      `| ${pad2(index + 1)} | ${escapeCell(r.scenario.name)} | ${promptCell} | ${modelCell} | ${score} | ${pass} | [→](${filenames[index]}) |`
    )
  })
  lines.push('')

  return lines.join('\n')
}

function buildScenarioMarkdown(r: ScenarioRunRecord, at: Date): string {
  const lines: string[] = []
  const threshold = r.scenario.passingScore ?? 0.7
  const modelCell =
    r.evalProvider !== '' ? `${r.evalProvider}:${r.evalModelId}` : '—'

  lines.push(`# ${r.scenario.name}`)
  lines.push('')
  lines.push(`_Run at ${at.toISOString()}_`)
  lines.push('')
  lines.push(`- **Prompt:** \`${r.scenario.promptName}@${r.scenario.promptLabel}\``)
  lines.push(`- **Model:** ${modelCell}`)
  lines.push(
    `- **Score:** ${r.verdict.score.toFixed(2)} (pass=${r.verdict.pass}, threshold=${threshold})`
  )
  if (r.error != null && r.error !== '') {
    lines.push(`- **Error:** ${r.error}`)
  }
  if (r.scenario.description != null && r.scenario.description !== '') {
    lines.push('')
    lines.push(`**Scenario description:** ${r.scenario.description}`)
  }
  lines.push('')
  lines.push('## Query')
  lines.push('')
  lines.push(blockquote(r.scenario.query))
  lines.push('')
  lines.push('## Output')
  lines.push('')
  lines.push(
    r.output !== '' ? blockquote(r.output) : '> _(no output — run failed)_'
  )
  lines.push('')
  lines.push('## Reason')
  lines.push('')
  lines.push(blockquote(r.verdict.reason))
  lines.push('')
  lines.push('## Acceptable examples')
  lines.push('')
  for (const ex of r.scenario.acceptableExamples) {
    lines.push(`- ${ex}`)
  }
  lines.push('')
  const unacceptable = r.scenario.unacceptableExamples ?? []
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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}

function blockquote(text: string): string {
  return text
    .split('\n')
    .map((line) => (line === '' ? '>' : `> ${line}`))
    .join('\n')
}

function escapeCell(text: string): string {
  return text.replace(/\|/g, '\\|')
}
