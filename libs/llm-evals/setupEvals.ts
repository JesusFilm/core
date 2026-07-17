import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config as loadDotenv } from 'dotenv'

const here = dirname(fileURLToPath(import.meta.url))

// Lib-local env files. `.env.local` (gitignored, real secrets) overrides
// `.env` (gitignored, lower-priority defaults). Both are optional — if they
// are absent and the required vars are already set in process.env they will
// still be respected.
const candidates = [
  resolve(here, '.env'),
  resolve(here, '.env.local') // takes precedence (loaded last with override)
]

for (const file of candidates) {
  if (!existsSync(file)) continue
  loadDotenv({ path: file, override: true })
}
