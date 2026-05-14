import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync
} from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { generateText } from 'ai'
import { config as loadDotenv } from 'dotenv'

import { fetchSystemPrompt } from '../src/langfuse'
import { buildEvalModel } from '../src/providers'
import type { EvalProvider, Scenario, ScenarioModel } from '../src/types'

const here = dirname(fileURLToPath(import.meta.url))
const libRoot = resolve(here, '..')
const repoRoot = resolve(libRoot, '../..')
const scenariosRoot = resolve(libRoot, 'scenarios')
const resultsRoot = resolve(libRoot, 'results')
const proposedRoot = resolve(libRoot, 'proposed-prompts')

for (const f of [resolve(libRoot, '.env'), resolve(libRoot, '.env.local')]) {
  if (existsSync(f)) loadDotenv({ path: f, override: true })
}

interface CliArgs {
  scenario: string | null
  all: boolean
  polisher: ScenarioModel
  withRuns: boolean
}

interface PolisherResponse {
  acceptableExamples: string[]
  unacceptableExamples: string[]
  changes?: {
    rationale?: string
    added?: string[]
    removed?: string[]
    refined?: string[]
  }
}

interface CellArtifact {
  provider: string
  modelId: string
  score: number
  pass: boolean
  reason: string
  output: string
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  if (!args.all && args.scenario == null) {
    console.error(
      'usage: polish-rubric --scenario=<slug> | --all [--polisher=<provider>:<modelId>] [--no-runs]'
    )
    process.exit(2)
  }

  const scenarioFiles = findScenarioFiles(scenariosRoot)
  if (scenarioFiles.length === 0) {
    console.error(`No scenario files found under ${relative(repoRoot, scenariosRoot)}`)
    process.exit(1)
  }

  const allLoaded: Array<{ file: string; scenario: Scenario; slug: string }> = []
  for (const file of scenarioFiles) {
    const scenario = await loadScenario(file)
    allLoaded.push({ file, scenario, slug: slugify(scenario.name) })
  }
  const targets =
    args.scenario != null
      ? allLoaded.filter((t) => t.slug === args.scenario)
      : allLoaded

  if (targets.length === 0) {
    if (args.scenario != null) {
      console.error(
        `No scenario matched slug "${args.scenario}". Known slugs:\n` +
          allLoaded.map((t) => `  - ${t.slug}`).join('\n')
      )
    } else {
      console.error('No scenarios to polish.')
    }
    process.exit(1)
  }

  mkdirSync(proposedRoot, { recursive: true })

  for (const { scenario, slug } of targets) {
    console.log(
      `\n→ Polishing "${scenario.name}" (slug: ${slug}) with ${args.polisher.provider}:${args.polisher.modelId}`
    )
    const systemPrompt = await fetchSystemPrompt({
      name: scenario.promptName,
      label: scenario.promptLabel,
      variables: scenario.promptVariables
    })
    const runData = args.withRuns ? collectRunData(slug) : []
    if (args.withRuns) {
      console.log(
        `  Grounded in ${runData.length} observed cell output(s) from results/${slug}/`
      )
    }
    const proposed = await polish({
      scenario,
      systemPrompt,
      runData,
      polisher: args.polisher
    })
    const sidecarPath = resolve(proposedRoot, `${slug}.rubric.md`)
    writeFileSync(
      sidecarPath,
      buildSidecar({ scenario, slug, proposed, polisher: args.polisher })
    )
    console.log(`  ✓ Wrote ${relative(repoRoot, sidecarPath)}`)
  }
}

async function polish({
  scenario,
  systemPrompt,
  runData,
  polisher
}: {
  scenario: Scenario
  systemPrompt: string
  runData: CellArtifact[]
  polisher: ScenarioModel
}): Promise<PolisherResponse> {
  const { model } = buildEvalModel(polisher)

  const polisherSystem = [
    'You are an expert at writing rubrics for LLM-as-judge evaluation systems.',
    'You analyze existing rubrics and produce improved versions.',
    'You reply with strict JSON and no surrounding text or code fences.'
  ].join('\n')

  const polisherPrompt = buildPolisherPrompt({ scenario, systemPrompt, runData })

  const { text } = await generateText({
    model,
    system: polisherSystem,
    prompt: polisherPrompt
  })

  return parseResponse(text)
}

function buildPolisherPrompt({
  scenario,
  systemPrompt,
  runData
}: {
  scenario: Scenario
  systemPrompt: string
  runData: CellArtifact[]
}): string {
  const lines: string[] = []

  lines.push('# Task')
  lines.push('')
  lines.push(
    'We run an evaluation suite that tests an LLM-driven chat model. For each scenario we maintain a rubric:'
  )
  lines.push('- `acceptableExamples` — positive criteria a good response should meet.')
  lines.push(
    '- `unacceptableExamples` — anti-patterns a response must NOT exhibit.'
  )
  lines.push('')
  lines.push(
    "A judge LLM scores the chat model's response against this rubric. Your job is to produce an improved rubric so the judge produces more accurate scores."
  )
  lines.push('')
  lines.push('## Improvement principles')
  lines.push('')
  lines.push(
    '1. Each positive criterion must be **observable**. A reader should be able to point at a specific sentence and decide whether it meets the criterion. Prefer "opens with a sentence that names what the user is feeling" over "is empathetic".'
  )
  lines.push(
    '2. Each negative criterion should describe a **specific failure mode**, ideally one the current rubric does not catch. The most useful anti-patterns are the ones that look like compliance from a distance but miss the spirit.'
  )
  lines.push(
    '3. Where possible, **pair** a positive and a negative along the same axis so the distinction is concrete. Example pair: positive "opens by naming what the user is feeling" / negative "opens by validating the difficulty of the topic".'
  )
  lines.push(
    '4. Prefer fewer sharp criteria over many vague ones. Target **4-7 of each list**.'
  )
  lines.push(
    '5. Do not invent criteria the system prompt does not back. The system prompt is the source of truth for what behaviour is actually required of the chat model.'
  )
  lines.push(
    '6. Stay grounded in the kinds of failures actual models exhibit (see the observed outputs below, if provided). Do not invent failure modes no real model would produce.'
  )
  lines.push('')

  lines.push('## System prompt under evaluation')
  lines.push('')
  lines.push('```')
  lines.push(systemPrompt)
  lines.push('```')
  lines.push('')

  lines.push('## Scenario')
  lines.push('')
  lines.push(`**Name:** ${scenario.name}`)
  if (scenario.description != null && scenario.description !== '') {
    lines.push(`**Description:** ${scenario.description}`)
  }
  lines.push(`**User query:**`)
  lines.push('')
  lines.push('```')
  lines.push(scenario.query)
  lines.push('```')
  lines.push('')

  lines.push('## Current rubric')
  lines.push('')
  lines.push('### Current acceptableExamples')
  scenario.acceptableExamples.forEach((ex, i) => {
    lines.push(`${i + 1}. ${ex}`)
  })
  lines.push('')
  lines.push('### Current unacceptableExamples')
  const currentUnacceptable = scenario.unacceptableExamples ?? []
  if (currentUnacceptable.length === 0) {
    lines.push('_(none defined yet)_')
  } else {
    currentUnacceptable.forEach((ex, i) => {
      lines.push(`${i + 1}. ${ex}`)
    })
  }
  lines.push('')

  if (runData.length > 0) {
    lines.push('## Observed model outputs')
    lines.push('')
    lines.push(
      "These are real outputs from chat models tested against this scenario, plus the judge's score and reason. Use them as evidence of how models actually behave on this scenario — the failure modes you suggest as anti-patterns should be ones models actually exhibit, not theoretical."
    )
    lines.push('')
    for (const cell of runData) {
      lines.push(`### ${cell.provider}:${cell.modelId}`)
      lines.push('')
      lines.push(
        `**Score:** ${cell.score.toFixed(2)} (${cell.pass ? 'PASS' : 'FAIL'})`
      )
      lines.push('')
      lines.push(`**Judge reason:** ${cell.reason}`)
      lines.push('')
      lines.push('**Model output:**')
      lines.push('')
      lines.push('```')
      lines.push(truncate(cell.output, 1500))
      lines.push('```')
      lines.push('')
    }
  }

  lines.push('## Required output')
  lines.push('')
  lines.push(
    'Reply with a single JSON object — no surrounding text, no code fences:'
  )
  lines.push('')
  lines.push(
    '```'
  )
  lines.push('{')
  lines.push('  "acceptableExamples": ["...", "..."],')
  lines.push('  "unacceptableExamples": ["...", "..."],')
  lines.push('  "changes": {')
  lines.push('    "rationale": "one paragraph explaining the overall shape of your edits",')
  lines.push('    "added": ["each new criterion you introduced"],')
  lines.push('    "removed": ["each criterion you dropped (paraphrased)"],')
  lines.push('    "refined": ["each criterion you reworded for sharper observability"]')
  lines.push('  }')
  lines.push('}')
  lines.push('```')

  return lines.join('\n')
}

function parseResponse(text: string): PolisherResponse {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
  const parsed: unknown = JSON.parse(cleaned)
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('polisher response is not an object')
  }
  const obj = parsed as Record<string, unknown>
  if (!Array.isArray(obj.acceptableExamples))
    throw new Error('polisher response missing acceptableExamples array')
  if (!Array.isArray(obj.unacceptableExamples))
    throw new Error('polisher response missing unacceptableExamples array')
  return {
    acceptableExamples: obj.acceptableExamples.map(String),
    unacceptableExamples: obj.unacceptableExamples.map(String),
    changes:
      typeof obj.changes === 'object' && obj.changes !== null
        ? (obj.changes as PolisherResponse['changes'])
        : undefined
  }
}

function buildSidecar({
  scenario,
  slug,
  proposed,
  polisher
}: {
  scenario: Scenario
  slug: string
  proposed: PolisherResponse
  polisher: ScenarioModel
}): string {
  const lines: string[] = []
  lines.push(`# Proposed rubric for: ${scenario.name}`)
  lines.push('')
  lines.push(
    `_Generated ${new Date().toISOString()} by ${polisher.provider}:${polisher.modelId} — scenario slug \`${slug}\`_`
  )
  lines.push('')
  lines.push(
    'Review this proposal before applying. The polisher is an LLM and can be wrong, especially on criteria that hinge on subtle theological or pastoral judgement.'
  )
  lines.push('')

  if (proposed.changes?.rationale != null && proposed.changes.rationale !== '') {
    lines.push('## Rationale')
    lines.push('')
    lines.push(proposed.changes.rationale)
    lines.push('')
  }

  const sections: Array<[string, string[] | undefined]> = [
    ['Added', proposed.changes?.added],
    ['Refined', proposed.changes?.refined],
    ['Removed', proposed.changes?.removed]
  ]
  for (const [title, items] of sections) {
    if (items != null && items.length > 0) {
      lines.push(`## ${title}`)
      lines.push('')
      for (const item of items) lines.push(`- ${item}`)
      lines.push('')
    }
  }

  lines.push('## Apply this snippet to the scenario file')
  lines.push('')
  lines.push(
    "Paste these two arrays into the scenario's `.eval.ts` file, replacing the existing `acceptableExamples` and `unacceptableExamples`. The strings below use double quotes for safe escaping; convert to single quotes if your file uses that style."
  )
  lines.push('')
  lines.push('```ts')
  lines.push('  acceptableExamples: [')
  for (const ex of proposed.acceptableExamples) {
    lines.push(`    ${JSON.stringify(ex)},`)
  }
  lines.push('  ],')
  lines.push('  unacceptableExamples: [')
  for (const ex of proposed.unacceptableExamples) {
    lines.push(`    ${JSON.stringify(ex)},`)
  }
  lines.push('  ],')
  lines.push('```')

  return lines.join('\n')
}

function collectRunData(slug: string): CellArtifact[] {
  const dir = resolve(resultsRoot, slug)
  if (!existsSync(dir)) return []
  const cells: CellArtifact[] = []
  for (const file of readdirSync(dir, { withFileTypes: true })) {
    if (!file.isFile() || !file.name.endsWith('.md')) continue
    const cell = parseCellArtifact(resolve(dir, file.name))
    if (cell != null) cells.push(cell)
  }
  return cells
}

function parseCellArtifact(filePath: string): CellArtifact | null {
  const content = readFileSync(filePath, 'utf8')
  const metaStart = content.indexOf('<!-- llm-eval-meta')
  if (metaStart === -1) return null
  const metaEnd = content.indexOf('-->', metaStart)
  if (metaEnd === -1) return null
  const metaJson = content.slice(metaStart + '<!-- llm-eval-meta'.length, metaEnd).trim()
  let meta: {
    provider?: unknown
    modelId?: unknown
    score?: unknown
    pass?: unknown
    reason?: unknown
  }
  try {
    meta = JSON.parse(metaJson)
  } catch {
    return null
  }
  if (
    typeof meta.provider !== 'string' ||
    typeof meta.modelId !== 'string' ||
    typeof meta.score !== 'number' ||
    typeof meta.pass !== 'boolean' ||
    typeof meta.reason !== 'string'
  ) {
    return null
  }
  return {
    provider: meta.provider,
    modelId: meta.modelId,
    score: meta.score,
    pass: meta.pass,
    reason: meta.reason,
    output: extractSection(content, 'Output')
  }
}

function extractSection(markdown: string, heading: string): string {
  const marker = `## ${heading}`
  const start = markdown.indexOf(marker)
  if (start === -1) return ''
  const after = markdown.slice(start + marker.length)
  const next = after.indexOf('\n## ')
  const body = next === -1 ? after : after.slice(0, next)
  return body
    .split('\n')
    .map((line) => line.replace(/^>\s?/, ''))
    .join('\n')
    .trim()
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max)}\n…[truncated, full output ${text.length} chars]…`
}

function findScenarioFiles(root: string): string[] {
  if (!existsSync(root)) return []
  const out: string[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = resolve(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.isFile() && entry.name.endsWith('.eval.ts')) out.push(full)
    }
  }
  walk(root)
  return out.sort()
}

async function loadScenario(file: string): Promise<Scenario> {
  const mod = (await import(
    /* webpackChunkName: "scenario" */ file
  )) as { default: Scenario }
  return mod.default
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function parseModelSpec(raw: string): ScenarioModel {
  const idx = raw.indexOf(':')
  if (idx === -1)
    throw new Error(
      `--polisher must be "<provider>:<modelId>" — got "${raw}"`
    )
  const provider = raw.slice(0, idx)
  const modelId = raw.slice(idx + 1)
  if (provider !== 'openrouter' && provider !== 'gemini' && provider !== 'apologist')
    throw new Error(
      `--polisher provider must be openrouter | gemini | apologist — got "${provider}"`
    )
  return { provider: provider as EvalProvider, modelId }
}

function parseArgs(argv: string[]): CliArgs {
  let scenario: string | null = null
  let all = false
  let polisher: ScenarioModel = {
    provider: 'apologist',
    modelId: 'anthropic/claude/sonnet-4.6'
  }
  let withRuns = true
  for (const arg of argv) {
    if (arg === '--all') all = true
    else if (arg === '--no-runs') withRuns = false
    else if (arg.startsWith('--scenario=')) scenario = arg.slice('--scenario='.length)
    else if (arg.startsWith('--polisher='))
      polisher = parseModelSpec(arg.slice('--polisher='.length))
    else {
      console.error(`Unknown argument: ${arg}`)
      process.exit(2)
    }
  }
  return { scenario, all, polisher, withRuns }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
