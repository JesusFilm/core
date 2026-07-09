// CLI entry for the Langfuse trace-export tool (NES-1690 / NES-1719).
//
//   pnpm exec tsx tools/langfuse-export/run.ts --days 14
//
// See tools/langfuse-export/README.md for credentials + the full flag list.
//
// Default deliverable (NES-1719): the insights-explorer bundle.
//   fetch (traces -> observations by traceId) -> normalize -> sanitise
//   -> facets (deterministic keyword vocabulary) -> enrich (LLM per-session
//   themes) -> dataset (lossless corpus) -> explorer (offline HTML viewer)
//   -> zip (dataset + viewer, opens by double-clicking from file://).
//
// Build offline from a local fixture with --fixture PATH.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { parseArgs, parseDiscriminator, resolveWindow, USAGE } from './src/cli'
import { createLangfuseClient, fetchTraceData } from './src/clients/langfuse'
import {
  createLlmScrub,
  createModel,
  synthesizeThemes,
  translateTexts
} from './src/clients/openrouter'
import { cacheKey, loadCache, saveCache } from './src/clients/translation-cache'
import { createZip } from './src/clients/zip'
import { loadEnvFile, parseEnv } from './src/env'
import { buildDataset, invertThemes } from './src/pipeline/dataset'
import { buildFacets } from './src/pipeline/facets'
import { renderExplorer } from './src/pipeline/explorer'
import { normalize } from './src/pipeline/normalize'
import { sanitize } from './src/pipeline/sanitize'
import { cannotBeEnglish, collectTranslatable } from './src/pipeline/translate'
import type {
  ObservationRecord,
  ThemeSynthesis,
  TraceRecord,
  Translation
} from './src/types'

interface FixtureData {
  traces: TraceRecord[]
  observations: ObservationRecord[]
  themes?: Record<string, string[]>
}

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

// Load a local {traces, observations, themes?} JSON so the whole pipeline can
// run offline — no Langfuse, no OpenRouter, no credentials. Used for tests and
// for producing a reviewable, PII-free demo bundle from a synthetic fixture.
function loadFixture(path: string): FixtureData {
  const raw = JSON.parse(readFileSync(path, 'utf8')) as Partial<FixtureData>
  if (!Array.isArray(raw.traces) || !Array.isArray(raw.observations)) {
    throw new Error(
      `fixture ${path} must be an object with "traces" and "observations" arrays`
    )
  }
  return {
    traces: raw.traces,
    observations: raw.observations,
    themes: raw.themes
  }
}

const BUNDLE_README = `Apologist chat — insights explorer
====================================

HOW TO USE
  1. Unzip this folder.
  2. Double-click index.html — it opens in your browser.

It runs fully offline (no internet, no install). Use the left panel to filter
by theme/keyword facets, click a session to read the whole conversation in
order. dataset.json is the same data as a plain file for reference.

TRANSLATION
  Many messages are not in English. When a translation is shown it is
  MACHINE-GENERATED (automatic) and its accuracy is NOT guaranteed. The
  original message is always kept exactly as written and never altered — read
  it as the source of truth and treat the English as an aid only.

PRIVACY
  User messages are PII-scrubbed but scrubbing is best-effort, not a guarantee.
  Share this folder directly with named recipients — do not post it publicly.
`

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
  const useFixture = options.fixture != null

  console.log('=== langfuse-export ===')
  console.log(
    `Window:        ${window.from.toISOString()} -> ${window.to.toISOString()}`
  )
  console.log('Deliverable:   insights-explorer bundle')
  console.log(`Discriminator: ${options.discriminator}`)

  // ---- source: live Langfuse, or an offline fixture ----
  let traces: TraceRecord[]
  let observations: ObservationRecord[]
  let fixtureThemes: Record<string, string[]> | undefined
  let model: ReturnType<typeof createModel> | undefined

  if (useFixture) {
    console.log(`Source:        fixture ${options.fixture} (offline)`)
    console.log(`Translate:     ${options.translate ? 'on' : 'off'}`)
    // --translate needs OpenRouter credentials, so load env + create the model
    // even under --fixture (the fixture only replaces the Langfuse source, not
    // the translation LLM). parseEnv validates all four keys, including the
    // Langfuse ones, which is acceptable — --translate is an online operation.
    if (options.translate) {
      loadEnvFile(__dirname)
      const env = parseEnv()
      if (options.model != null) env.openrouterModel = options.model
      console.log(`Model:         ${env.openrouterModel}`)
      model = createModel(env)
    }
    console.log('')
    const fixture = loadFixture(
      resolve(process.cwd(), options.fixture as string)
    )
    traces = fixture.traces
    observations = fixture.observations
    fixtureThemes = fixture.themes
    console.log(
      `  ${traces.length} traces, ${observations.length} generations (from fixture)`
    )
  } else {
    console.log(`Environment:   ${options.environment}`)
    console.log(`LLM scrub:     ${options.llmScrub ? 'on' : 'off'}`)
    console.log(`Translate:     ${options.translate ? 'on' : 'off'}`)
    loadEnvFile(__dirname)
    const env = parseEnv()
    if (options.model != null) env.openrouterModel = options.model
    console.log(`Model:         ${env.openrouterModel}`)
    console.log('')

    const environment =
      options.environment === 'all' ? undefined : options.environment
    const client = createLangfuseClient(env)
    console.log('Fetching traces + observations...')
    const fetched = await fetchTraceData(client, window, {
      throttleMs: options.throttleMs,
      onProgress: progress,
      environment
    })
    traces = fetched.traces
    observations = fetched.observations
    console.log(`  ${traces.length} traces, ${observations.length} generations`)
    if (traces.length === 0 && environment != null) {
      console.log(
        `  (no traces tagged environment=${environment} in this window — ` +
          `pre-NES-1688 traces are untagged; use --environment all to include them)`
      )
    }
    model = createModel(env)
  }

  // ---- shared deterministic pipeline ----
  const { conversations, excludedTurnCount } = normalize(
    traces,
    observations,
    normalizeOptions
  )
  console.log(
    `  ${conversations.length} conversations (${excludedTurnCount} turns excluded as load-test)`
  )

  const llmScrub =
    !useFixture && options.llmScrub && model != null
      ? createLlmScrub(model)
      : undefined
  const sanitised = await sanitize(conversations, llmScrub)

  // Facets are computed before translation (keyword labels are translated too)
  // and are pure/cheap, so build them up front — ahead of the LLM passes.
  const facets = buildFacets(sanitised)

  // Theme synthesis is the one LLM call shared by both deliverables. Skipped
  // entirely under --fixture (offline). Degrades to null on failure.
  let themeSynthesis: ThemeSynthesis | null = null
  if (!useFixture && model != null) {
    try {
      console.log('Synthesising themes via OpenRouter...')
      themeSynthesis = await synthesizeThemes(model, sanitised)
    } catch (error) {
      console.warn(
        `  theme synthesis failed (${error instanceof Error ? error.message : String(error)}) — continuing without themes`
      )
    }
  }

  // Translation pass (--translate). Paid once: translations are cached by
  // content hash, so a re-render reuses the cache and costs nothing. Degrades
  // to no translation on failure; the original text is always retained.
  let translations: Map<string, Translation> | null = null
  if (options.translate && model != null) {
    try {
      console.log('Translating corpus via OpenRouter...')
      const cachePath =
        options.translationCache != null
          ? resolve(process.cwd(), options.translationCache)
          : resolve(__dirname, 'output', '.translation-cache.json')
      const strings = collectTranslatable(sanitised, facets)
      const cache = loadCache(cachePath)

      // Translate only the cache misses; each item is keyed by its content hash.
      // A cached "this is English" verdict on non-Latin-script text is a lie an
      // earlier run recorded — treat it as a miss so the cache self-heals.
      const misses = strings.filter((text) => {
        const cached = cache.get(cacheKey(text))
        if (cached == null) return true
        return cached.sourceLanguage === 'en' && cannotBeEnglish(text)
      })
      const fresh = await translateTexts(
        model,
        misses.map((text) => ({ id: cacheKey(text), text })),
        { onProgress: progress }
      )

      for (const [key, translation] of fresh) cache.set(key, translation)
      saveCache(cachePath, cache)

      // buildDataset looks up by the exact original string, so rebuild the map
      // keyed by text (out of the content-hash cache).
      translations = new Map<string, Translation>()
      for (const text of strings) {
        const translation = cache.get(cacheKey(text))
        if (translation != null) translations.set(text, translation)
      }

      const cacheHits = strings.length - misses.length
      const failed = misses.length - fresh.size
      console.log(
        `  translation: ${strings.length} strings, ${cacheHits} cache hits, ` +
          `${fresh.size} newly translated, ${failed} failed`
      )
    } catch (error) {
      console.warn(
        `  translation failed (${error instanceof Error ? error.message : String(error)}) — continuing without translation`
      )
      translations = null
    }
  }

  const id = runId()
  const outDir = resolve(__dirname, 'output', id)
  mkdirSync(outDir, { recursive: true })
  const generatedAt = new Date().toISOString()

  // ---- build the insights-explorer bundle ----
  const themesBySession = useFixture
    ? fixtureThemes != null
      ? new Map(Object.entries(fixtureThemes))
      : null
    : themeSynthesis != null
      ? invertThemes(themeSynthesis)
      : null

  const dataset = buildDataset(
    sanitised,
    window,
    facets,
    themesBySession,
    excludedTurnCount,
    generatedAt,
    translations
  )
  const html = renderExplorer(dataset)
  const datasetJson = JSON.stringify(dataset, null, 2)
  const zip = createZip([
    { name: 'index.html', data: html },
    { name: 'dataset.json', data: datasetJson },
    { name: 'README.txt', data: BUNDLE_README }
  ])

  writeFileSync(resolve(outDir, 'insights-explorer.zip'), zip)
  // Unzipped copies too, so the engineer can preview without extracting.
  writeFileSync(resolve(outDir, 'index.html'), html, 'utf8')
  writeFileSync(resolve(outDir, 'dataset.json'), datasetJson, 'utf8')
  console.log(
    `  explorer: ${dataset.sessions.length} sessions, ${dataset.facets.length} facets, ` +
      `${dataset.summary.suppressedKeywordCount} over-common keywords suppressed`
  )
  if (dataset.summary.suppressedTranslatedKeywordCount > 0) {
    console.log(
      `  explorer: ${dataset.summary.suppressedTranslatedKeywordCount} translated keyword facets ` +
        `suppressed (English gloss is a stopword — e.g. 'que' -> 'that')`
    )
  }

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
    writeFileSync(
      resolve(outDir, 'records.ndjson'),
      `${lines.join('\n')}\n`,
      'utf8'
    )
  }

  console.log('')
  console.log(`Done. Output: tools/langfuse-export/output/${id}/`)
  console.log(
    'Share insights-explorer.zip directly with named recipients (offline; double-click index.html).'
  )
}

main().catch((error) => {
  console.error(
    `error: ${error instanceof Error ? error.message : String(error)}`
  )
  process.exit(1)
})
