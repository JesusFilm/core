import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type { LanguageModel } from 'ai'

import { env } from '../../../env'

/**
 * Returns the company LiteLLM gateway's model (Qwen, `coding` by default), or
 * null when the gateway env vars are not set. The builder reports "not set up"
 * on null rather than api-journeys refusing to start.
 */
export function getGatewayModel(): LanguageModel | null {
  if (env.AI_GATEWAY_URL == null || env.AI_GATEWAY_API_KEY == null) return null

  const provider = createOpenAICompatible({
    name: 'ai-gateway',
    baseURL: toV1BaseUrl(env.AI_GATEWAY_URL),
    apiKey: env.AI_GATEWAY_API_KEY,
    supportsStructuredOutputs: true
  })
  return provider.chatModel(env.AI_GATEWAY_MODEL)
}

/** LiteLLM serves the OpenAI routes under `/v1`; accept the URL with or without it. */
export function toV1BaseUrl(url: string): string {
  const trimmed = url.replace(/\/+$/, '')
  return trimmed.endsWith('/v1') ? trimmed : `${trimmed}/v1`
}
