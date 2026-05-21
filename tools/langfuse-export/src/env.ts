// Environment loading + validation for the Langfuse trace-export tool.
//
// `parseEnv` is pure (no file IO, no __dirname) so it is unit-testable by
// passing a fake source object. `loadEnvFile` is the side-effecting dotenv
// load, called by run.ts with the tool directory so the tool-local
// `.env` is read regardless of the shell's cwd.

import { config as loadDotenv } from 'dotenv'
import { resolve } from 'node:path'
import { z } from 'zod'

const DEFAULT_OPENROUTER_MODEL = 'google/gemini-2.5-flash-lite'

const envSchema = z.object({
  LANGFUSE_PUBLIC_KEY: z.string().trim().min(1),
  LANGFUSE_SECRET_KEY: z.string().trim().min(1),
  LANGFUSE_BASE_URL: z.string().trim().url(),
  OPENROUTER_API_KEY: z.string().trim().min(1),
  OPENROUTER_MODEL: z.string().trim().min(1).optional()
})

export interface ToolEnv {
  langfusePublicKey: string
  langfuseSecretKey: string
  langfuseBaseUrl: string
  openrouterApiKey: string
  openrouterModel: string
}

// Load the tool-local `.env` into process.env. Idempotent; existing
// process.env values win (dotenv does not override by default).
export function loadEnvFile(toolDir: string): void {
  loadDotenv({ path: resolve(toolDir, '.env') })
}

// Validate and normalise the environment. Throws a clear, actionable error
// naming the offending keys and pointing at fetch-env.sh.
export function parseEnv(source: NodeJS.ProcessEnv = process.env): ToolEnv {
  const result = envSchema.safeParse(source)
  if (!result.success) {
    const keys = result.error.issues
      .map((issue) => issue.path.join('.'))
      .filter((key, index, all) => all.indexOf(key) === index)
      .join(', ')
    throw new Error(
      `[langfuse-export] missing/invalid env: ${keys}. ` +
        `Run \`bash tools/langfuse-export/fetch-env.sh\` to populate ` +
        `tools/langfuse-export/.env from Doppler (core/dev).`
    )
  }

  const data = result.data
  return {
    langfusePublicKey: data.LANGFUSE_PUBLIC_KEY,
    langfuseSecretKey: data.LANGFUSE_SECRET_KEY,
    langfuseBaseUrl: data.LANGFUSE_BASE_URL,
    openrouterApiKey: data.OPENROUTER_API_KEY,
    openrouterModel: data.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL
  }
}

export { DEFAULT_OPENROUTER_MODEL }
