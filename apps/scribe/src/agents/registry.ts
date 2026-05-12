import {
  type ApiProviderId,
  type ProviderId,
  loadProviderCredential
} from '../config/providers'

import { createClaudeCodeProvider } from './claudeCode'
import { createOpenAICompatProvider } from './openaiCompat'
import type { AgentProvider, ProviderMeta } from './types'

const OPENROUTER_DEFAULT_BASE_URL = 'https://openrouter.ai/api/v1'
const LM_STUDIO_DEFAULT_BASE_URL = 'http://localhost:1234/v1'
const OLLAMA_DEFAULT_BASE_URL = 'http://localhost:11434/v1'

export const PROVIDER_METAS: ProviderMeta[] = [
  {
    id: 'claude-code',
    label: 'Claude Code',
    description:
      'Anthropic Claude via the Claude Agent SDK (uses your Claude Code credentials).',
    needsCredential: false,
    needsApiKey: false,
    needsBaseUrl: false
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    description:
      'OpenAI-compatible router across many models (anthropic/*, openai/*, meta/*, …).',
    needsCredential: true,
    needsApiKey: true,
    needsBaseUrl: false,
    defaultBaseUrl: OPENROUTER_DEFAULT_BASE_URL
  },
  {
    id: 'hermes',
    label: 'Hermes',
    description:
      'OpenAI-compatible Hermes agent endpoint. Requires a base URL plus an API key.',
    needsCredential: true,
    needsApiKey: true,
    needsBaseUrl: true
  },
  {
    id: 'lm-studio',
    label: 'LM Studio',
    description:
      'Local OpenAI-compatible server (default http://localhost:1234/v1). No API key required.',
    needsCredential: true,
    needsApiKey: false,
    needsBaseUrl: true,
    defaultBaseUrl: LM_STUDIO_DEFAULT_BASE_URL
  },
  {
    id: 'ollama',
    label: 'Ollama',
    description:
      'Local Ollama server via its OpenAI-compatible endpoint (default http://localhost:11434/v1). No API key required.',
    needsCredential: true,
    needsApiKey: false,
    needsBaseUrl: true,
    defaultBaseUrl: OLLAMA_DEFAULT_BASE_URL
  }
]

export function getProviderMeta(id: ProviderId): ProviderMeta {
  const meta = PROVIDER_METAS.find((p) => p.id === id)
  if (meta == null) {
    throw new Error(`Unknown provider "${id}".`)
  }
  return meta
}

export function isProviderId(value: string): value is ProviderId {
  return PROVIDER_METAS.some((p) => p.id === value)
}

/**
 * Returns true when the provider can run right now. Claude Code rides on
 * external credentials and is always considered ready; OpenAI-compatible
 * providers need a stored API key when `needsApiKey` is set, and a stored
 * base URL when `needsBaseUrl` is set with no default to fall back on.
 */
export function isProviderReady(id: ProviderId): boolean {
  if (id === 'claude-code') return true
  const meta = getProviderMeta(id)
  const cred = loadProviderCredential(id)
  if (meta.needsApiKey) {
    if (cred == null || cred.apiKey.length === 0) return false
  }
  if (meta.needsBaseUrl) {
    const hasStoredBaseUrl =
      cred?.baseUrl != null && cred.baseUrl.length > 0
    const hasDefault =
      meta.defaultBaseUrl != null && meta.defaultBaseUrl.length > 0
    if (!hasStoredBaseUrl && !hasDefault) return false
  }
  return true
}

export interface ProviderInstantiationError {
  kind: 'missing-credential' | 'missing-base-url' | 'unknown'
  message: string
}

export function createProvider(
  id: ProviderId
): AgentProvider | ProviderInstantiationError {
  if (id === 'claude-code') {
    return createClaudeCodeProvider()
  }
  return createOpenAICompatProviderById(id)
}

function createOpenAICompatProviderById(
  id: ApiProviderId
): AgentProvider | ProviderInstantiationError {
  const meta = getProviderMeta(id)
  const cred = loadProviderCredential(id)
  if (meta.needsApiKey && (cred == null || cred.apiKey.length === 0)) {
    return {
      kind: 'missing-credential',
      message: `${meta.label} has no stored API key. Run /provider to configure it.`
    }
  }
  const baseUrl =
    cred?.baseUrl != null && cred.baseUrl.length > 0
      ? cred.baseUrl
      : meta.defaultBaseUrl
  if (baseUrl == null || baseUrl.length === 0) {
    return {
      kind: 'missing-base-url',
      message: `${meta.label} requires a base URL. Run /provider to configure it.`
    }
  }
  // When no key is stored (LM Studio without auth), pass an empty string —
  // the OpenAI-compat client drops the Authorization header in that case.
  const apiKey =
    cred?.apiKey != null && cred.apiKey.length > 0 ? cred.apiKey : ''
  return createOpenAICompatProvider({
    id,
    label: meta.label,
    apiKey,
    baseUrl,
    extraHeaders:
      id === 'openrouter'
        ? {
            'HTTP-Referer': 'https://github.com/JesusFilm/core/tree/main/apps/scribe',
            'X-Title': 'scribe'
          }
        : undefined
  })
}

export function isInstantiationError(
  value: AgentProvider | ProviderInstantiationError
): value is ProviderInstantiationError {
  return 'kind' in value
}
