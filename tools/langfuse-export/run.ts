// CLI entry for the Langfuse trace-export tool (NES-1690).
//
//   pnpm exec tsx tools/langfuse-export/run.ts --days 14
//
// See tools/langfuse-export/README.md for credentials + the full flag list.
// Pipeline: fetch (traces -> observations by traceId) -> normalize ->
// sanitise (regex always; llm only under --llm-scrub) -> aggregate ->
// synthesise themes -> render HTML (+ optional PDF).

import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { parseArgs, parseDiscriminator, resolveWindow, USAGE } from './src/cli'
import { createLangfuseClient, fetchTraceData } from './src/clients/langfuse'
import { createLlmScrub, createModel, synthesizeThemes } from './src/clients/openrouter'
import { loadEnvFile, parseEnv } from './src/env'
import { buildStats } from './src/pipeline/aggregate'
import { normalize } from './src/pipeline/normalize'
import { renderReport } from './src/pipeline/report'
import { sanitize } from './src/pipeline/sanitize'
import type { ThemeSynthesis } from './src/types'

function runId(): string {
  const now = new Date()
  const pad = (value: number): string => String(value).padStart(2, '0')
  return (
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}`
  )
}

function progress(message: string): void {
  console.log(`  ${message}`)
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2)
  if (argv.length === 0) {
    console.error(USAGE)
    process.exit(2)
  }

  const options = parseArgs(argv)
  if (options.help) {
    console.log(USAGE)
    return
  }

  const window = resolveWindow(options)
  const normalizeOptions = parseDiscriminator(options.discriminator)

  loadEnvFile(__dirname)
  const env = parseEnv()
  if (options.model != null) env.openrouterModel = options.model

  const fetchOptions = { throttleMs: options.throttleMs, onProgress: progress }

  console.log('=== langfuse-export ===')
  console.log(`Window:        ${window.from.toISOString()} -> ${window.to.toISOString()}`)
  console.log(`Discriminator: ${options.discriminator}`)
  console.log(`LLM scrub:     ${options.llmScrub ? 'on' : 'off'}`)
  console.log(`Model:         ${env.openrouterModel}`)
  console.log('')

  const client = createLangfuseClient(env)

  console.log('Fetching traces + observations...')
  const { traces, observations } = await fetchTraceData(client, window, fetchOptions)
  console.log(`  ${traces.length} traces, ${observations.length} generations`)

  const { conversations, excludedTurnCount } = normalize(
    traces,
    observations,
    normalizeOptions
  )
  console.log(
    `  ${conversations.length} conversations (${excludedTurnCount} turns excluded as load-test)`
  )

  const model = createModel(env)
  const llmScrub = options.llmScrub ? createLlmScrub(model) : undefined
  const sanitised = await sanitize(conversations, llmScrub)

  const stats = buildStats(sanitised, excludedTurnCount, window)

  let themes: ThemeSynthesis | null = null
  try {
    console.log('Synthesising themes via OpenRouter...')
    themes = await synthesizeThemes(model, sanitised)
  } catch (error) {
    console.warn(
      `  theme synthesis failed (${error instanceof Error ? error.message : String(error)}) — rendering stats + verbatim excerpts only`
    )
  }

  const html = renderReport(stats, sanitised, themes)

  const id = runId()
  const outDir = resolve(__dirname, 'output', id)
  mkdirSync(outDir, { recursive: true })

  const htmlPath = resolve(outDir, 'report.html')
  writeFileSync(htmlPath, html, 'utf8')

  if (options.debug) {
    const lines: string[] = []
    for (const conversation of sanitised) {
      for (const turn of conversation.turns) {
        // Deliberately omit `assistantReply`: it is never scrubbed (it's model
        // output) and the apologist often echoes user words, so it can carry
        // user-disclosed PII. The debug record keeps only the sanitised
        // user message + non-PII metadata.
        lines.push(
          JSON.stringify({
            observationId: turn.observationId,
            traceId: turn.traceId,
            startTime: turn.startTime,
            userMessage: turn.userMessage,
            model: turn.model,
            latencySeconds: turn.latencySeconds,
            inputTokens: turn.inputTokens,
            outputTokens: turn.outputTokens,
            totalTokens: turn.totalTokens,
            costUsd: turn.costUsd,
            sessionId: conversation.sessionId,
            synthetic: conversation.synthetic,
            ipCountry: conversation.ipCountry,
            journeyId: conversation.journeyId,
            language: conversation.language
          })
        )
      }
    }
    writeFileSync(resolve(outDir, 'records.ndjson'), `${lines.join('\n')}\n`, 'utf8')
  }

  if (options.pdf) {
    console.log('Rendering PDF...')
    const { renderPdf } = await import('./src/clients/pdf')
    try {
      await renderPdf(htmlPath, resolve(outDir, 'report.pdf'))
    } catch (error) {
      // report.html is already written and fully usable — make that explicit
      // so a PDF-only failure doesn't read as "the whole run failed".
      console.error(`PDF render failed — report.html is available at ${htmlPath}`)
      throw error
    }
  }

  console.log('')
  console.log(`Done. Output: tools/langfuse-export/output/${id}/`)
  console.log('Upload only report.html / report.pdf to Drive (direct-share to Aaron).')
}

main().catch((error) => {
  console.error(`error: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
