import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync
} from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

import { env } from '../env'

/**
 * Identifier for an agent backend. `claude-code` rides on Claude Code's own
 * credentials and therefore stores nothing here. `openrouter`, `hermes`, and
 * `lm-studio` all speak the OpenAI chat-completions protocol. OpenRouter and
 * Hermes need an API key (and, for Hermes, an endpoint base URL). LM Studio
 * runs locally and accepts any auth value — only its base URL is stored,
 * defaulting to `http://localhost:1234/v1`.
 */
export type ProviderId = 'claude-code' | 'openrouter' | 'hermes' | 'lm-studio'

export type ApiProviderId = Exclude<ProviderId, 'claude-code'>

export interface ProviderCredential {
  apiKey: string
  /** Endpoint base URL (without `/chat/completions`). Required for Hermes. */
  baseUrl?: string
  obtainedAt: string
}

interface ProvidersFile {
  version: 1
  /**
   * Last provider the operator activated. Mirrors `--provider` and `/provider`
   * so the choice survives across runs.
   */
  active?: ProviderId
  providers: Partial<Record<ApiProviderId, ProviderCredential>>
}

const DEFAULT_FILE: ProvidersFile = { version: 1, providers: {} }

function configDir(): string {
  return env.SCRIBE_CONFIG_DIR ?? join(homedir(), '.config', 'scribe')
}

function providersPath(): string {
  return join(configDir(), 'providers.json')
}

function readFile(): ProvidersFile {
  const path = providersPath()
  if (!existsSync(path)) return { version: 1, providers: {} }
  try {
    const raw = readFileSync(path, 'utf8')
    const parsed = JSON.parse(raw) as Partial<ProvidersFile>
    if (parsed.version !== 1 || parsed.providers == null) return DEFAULT_FILE
    return {
      version: 1,
      active: parsed.active,
      providers: parsed.providers
    }
  } catch {
    return DEFAULT_FILE
  }
}

function writeFile(data: ProvidersFile): void {
  const path = providersPath()
  const dir = dirname(path)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 })
  writeFileSync(path, JSON.stringify(data, null, 2), { mode: 0o600 })
  // Best-effort permission tightening on existing files.
  try {
    chmodSync(path, 0o600)
  } catch {
    // ignore on platforms where chmod is a no-op
  }
}

export function loadProviderCredential(
  id: ApiProviderId
): ProviderCredential | null {
  const file = readFile()
  return file.providers[id] ?? null
}

export function saveProviderCredential(
  id: ApiProviderId,
  credential: { apiKey: string; baseUrl?: string }
): void {
  const file = readFile()
  file.providers[id] = {
    apiKey: credential.apiKey,
    baseUrl: credential.baseUrl,
    obtainedAt: new Date().toISOString()
  }
  writeFile(file)
}

export function clearProviderCredential(id: ApiProviderId): void {
  const file = readFile()
  delete file.providers[id]
  writeFile(file)
}

export function loadActiveProvider(): ProviderId | null {
  const file = readFile()
  return file.active ?? null
}

export function saveActiveProvider(id: ProviderId): void {
  const file = readFile()
  file.active = id
  writeFile(file)
}
