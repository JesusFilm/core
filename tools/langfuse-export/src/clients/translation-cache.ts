// Content-addressed translation cache (NES-1762). Translation is paid once:
// the key is the sha256 of the exact source string, so re-rendering a report
// reuses the cache and costs nothing, and the cache is order-independent
// (keyed by content, not position). The on-disk form is a JSON object mapping
// hash -> Translation.

import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

import type { Translation } from '../types'

// sha256 of the exact source string. Same string in -> same key out.
export function cacheKey(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

// Coerce one on-disk value into a Translation, or null if it isn't one.
// An 'en' record has no `english`; a non-'en' record must carry a non-empty
// `english` (we never store a translation we don't have).
function toTranslation(value: unknown): Translation | null {
  if (value == null || typeof value !== 'object') return null
  const record = value as Record<string, unknown>
  const sourceLanguage =
    typeof record.sourceLanguage === 'string'
      ? record.sourceLanguage.trim()
      : ''
  if (sourceLanguage.length === 0) return null
  const english =
    typeof record.english === 'string' && record.english.length > 0
      ? record.english
      : undefined
  return english != null ? { sourceLanguage, english } : { sourceLanguage }
}

// Load the cache. Returns an empty Map when the file is absent or unparseable —
// a missing/corrupt cache must never abort the run, only cost a re-translation.
export function loadCache(path: string): Map<string, Translation> {
  const cache = new Map<string, Translation>()
  let raw: string
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    return cache // absent
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return cache // unparseable
  }
  if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return cache
  }
  for (const [key, value] of Object.entries(
    parsed as Record<string, unknown>
  )) {
    const translation = toTranslation(value)
    if (translation != null) cache.set(key, translation)
  }
  return cache
}

// Persist the cache, creating parent directories. Keys are sorted so the file
// is a stable, diff-friendly artifact regardless of insertion order.
export function saveCache(
  path: string,
  cache: ReadonlyMap<string, Translation>
): void {
  mkdirSync(dirname(path), { recursive: true })
  const record: Record<string, Translation> = {}
  for (const key of [...cache.keys()].sort()) {
    record[key] = cache.get(key) as Translation
  }
  writeFileSync(path, JSON.stringify(record, null, 2), 'utf8')
}
