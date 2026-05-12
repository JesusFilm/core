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

import type { EnvironmentId } from './environments'

interface StoredCredential {
  token: string
  email?: string
  userId?: string
  obtainedAt: string
}

interface CredentialsFile {
  version: 1
  credentials: Partial<Record<EnvironmentId, StoredCredential>>
}

function configDir(): string {
  return env.SCRIBE_CONFIG_DIR ?? join(homedir(), '.config', 'scribe')
}

function credentialsPath(): string {
  return join(configDir(), 'credentials.json')
}

function readFile(): CredentialsFile {
  const path = credentialsPath()
  if (!existsSync(path)) return { version: 1, credentials: {} }
  try {
    const raw = readFileSync(path, 'utf8')
    const parsed = JSON.parse(raw) as Partial<CredentialsFile>
    if (parsed.version !== 1 || parsed.credentials == null) {
      return { version: 1, credentials: {} }
    }
    return parsed as CredentialsFile
  } catch {
    return { version: 1, credentials: {} }
  }
}

function writeFile(data: CredentialsFile): void {
  const path = credentialsPath()
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

export function saveCredential(
  envId: EnvironmentId,
  credential: Omit<StoredCredential, 'obtainedAt'>
): void {
  const file = readFile()
  file.credentials[envId] = {
    ...credential,
    obtainedAt: new Date().toISOString()
  }
  writeFile(file)
}

export function loadCredential(envId: EnvironmentId): StoredCredential | null {
  const file = readFile()
  return file.credentials[envId] ?? null
}

export function clearCredential(envId: EnvironmentId): void {
  const file = readFile()
  delete file.credentials[envId]
  writeFile(file)
}
