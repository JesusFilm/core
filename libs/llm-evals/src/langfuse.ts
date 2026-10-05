import { Langfuse } from 'langfuse'

let cached: Langfuse | null | undefined

export function getLangfuse(): Langfuse {
  if (cached != null) return cached

  const publicKey = process.env.LANGFUSE_PUBLIC_KEY
  const secretKey = process.env.LANGFUSE_SECRET_KEY
  const baseUrl = process.env.LANGFUSE_BASE_URL

  if (
    publicKey == null ||
    publicKey === '' ||
    secretKey == null ||
    secretKey === '' ||
    baseUrl == null ||
    baseUrl === ''
  ) {
    throw new Error(
      'LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY / LANGFUSE_BASE_URL must all be set. Run `pnpm exec nx run llm-evals:fetch-secrets` (requires $DOPPLER_JOURNEYS_TOKEN) to populate libs/llm-evals/.env from Doppler.'
    )
  }

  cached = new Langfuse({ publicKey, secretKey, baseUrl })
  return cached
}

export async function fetchSystemPrompt({
  name,
  label,
  variables
}: {
  name: string
  label: string
  variables?: Record<string, string>
}): Promise<string> {
  const langfuse = getLangfuse()
  const promptClient = await langfuse.getPrompt(name, undefined, { label })

  if (promptClient.type !== 'text') {
    throw new Error(
      `Expected text prompt for ${name} (label=${label}), got ${promptClient.type}`
    )
  }

  // Journeys always supplies the ESV translation to this prompt. Keep evals
  // aligned with the live chat path while allowing a scenario to override it.
  return promptClient.compile({ translation: 'ESV', ...variables })
}
