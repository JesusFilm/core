import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { generateText } from 'ai'
import { config as loadDotenv } from 'dotenv'

import { buildEvalModel } from '../src/providers'

const here = dirname(fileURLToPath(import.meta.url))
const libRoot = resolve(here, '..')

for (const f of [resolve(libRoot, '.env'), resolve(libRoot, '.env.local')]) {
  if (existsSync(f)) loadDotenv({ path: f, override: true })
}

function redact(value: string | undefined, prefixLen = 8): string {
  if (value == null || value === '') return '(not set)'
  return `${value.slice(0, prefixLen)}…(${value.length} chars)`
}

function hostnameOf(url: string | undefined): string {
  if (url == null || url === '') return '(not set)'
  try {
    return new URL(url).hostname
  } catch {
    return `(invalid URL: ${url})`
  }
}

console.log('## Env presence')
console.log(
  `APOLOGIST_API_URL host  = ${hostnameOf(process.env.APOLOGIST_API_URL)}`
)
console.log(
  `APOLOGIST_API_KEY       = ${redact(process.env.APOLOGIST_API_KEY)}`
)
console.log(
  `OPENROUTER_API_KEY      = ${redact(process.env.OPENROUTER_API_KEY)}`
)

async function main(): Promise<void> {
  console.log('\n## Single live call: apologist:google/gemini/3-flash')
  const { model, provider, modelId } = buildEvalModel({
    provider: 'apologist',
    modelId: 'google/gemini/3-flash'
  })
  console.log(`Resolved   = provider=${provider} modelId=${modelId}`)

  const t0 = Date.now()
  try {
    const { text, usage, finishReason } = await generateText({
      model,
      prompt:
        "Reply with one short word so we can confirm routing. Don't elaborate."
    })
    console.log(`HTTP        = succeeded in ${Date.now() - t0}ms`)
    console.log(`finishReason = ${finishReason}`)
    console.log(
      `usage       = input=${usage?.inputTokens ?? '?'} output=${usage?.outputTokens ?? '?'}`
    )
    console.log(`response    = ${text.slice(0, 200)}`)
    console.log('\n→ Call succeeded — this confirms the request hit the URL at')
    console.log(
      `  ${hostnameOf(process.env.APOLOGIST_API_URL)} with the APOLOGIST_API_KEY,`
    )
    console.log(
      '  because that is the only base URL `createOpenAICompatible({ name: "apologist", … })`'
    )
    console.log('  is configured with in src/providers.ts.')
  } catch (err) {
    console.log(`HTTP       = FAILED in ${Date.now() - t0}ms`)
    console.log(`error      = ${(err as Error).message}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
