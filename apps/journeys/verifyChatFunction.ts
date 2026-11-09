import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// Check the built function, not just whether a glob matches a source filename.
const functionsRoot = process.argv[2] ?? '.vercel/output/functions'
const candidates = ['api/chat.func', 'api/chat/index.func'].map((name) =>
  join(functionsRoot, name, '.vc-config.json')
)
const configs = candidates.filter(existsSync)
if (configs.length === 0) {
  throw new Error('The built Journeys chat function was not found')
}
for (const file of configs) {
  const config = JSON.parse(readFileSync(file, 'utf8'))
  if (config.supportsCancellation !== true) {
    throw new Error(`Request cancellation is not enabled in ${file}`)
  }
}
console.log('Journeys chat function: supportsCancellation=true')
