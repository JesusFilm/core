import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  cacheKey,
  isPoisonedEnglish,
  loadCache,
  saveCache
} from './translation-cache'
import type { Translation } from '../types'

function tmpFile(name: string): string {
  const dir = mkdtempSync(join(tmpdir(), 'translation-cache-'))
  return join(dir, name)
}

describe('cacheKey', () => {
  it('is deterministic and content-addressed (same string -> same key)', () => {
    expect(cacheKey('¿Resucitó Jesús?')).toBe(cacheKey('¿Resucitó Jesús?'))
  })

  it('differs for different strings', () => {
    expect(cacheKey('a')).not.toBe(cacheKey('b'))
  })

  it('returns a 64-char hex sha256 digest', () => {
    expect(cacheKey('hello')).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('loadCache', () => {
  it('returns an empty map when the file is absent', () => {
    expect(loadCache(tmpFile('missing.json')).size).toBe(0)
  })

  it('returns an empty map when the file is unparseable', () => {
    const path = tmpFile('corrupt.json')
    writeFileSync(path, '{ not valid json', 'utf8')
    expect(loadCache(path).size).toBe(0)
  })

  it('loads well-formed en and non-en records, skipping malformed ones', () => {
    const path = tmpFile('cache.json')
    writeFileSync(
      path,
      JSON.stringify({
        h1: { sourceLanguage: 'bn', english: 'Did it happen?' },
        h2: { sourceLanguage: 'en' },
        h3: { nope: true },
        h4: { sourceLanguage: '' }
      }),
      'utf8'
    )
    const cache = loadCache(path)
    expect(cache.get('h1')).toEqual({
      sourceLanguage: 'bn',
      english: 'Did it happen?'
    })
    expect(cache.get('h2')).toEqual({ sourceLanguage: 'en' })
    expect(cache.has('h3')).toBe(false)
    expect(cache.has('h4')).toBe(false)
  })
})

describe('saveCache', () => {
  it('creates parent dirs and round-trips through loadCache', () => {
    const path = join(
      mkdtempSync(join(tmpdir(), 'translation-cache-')),
      'nested',
      'deeper',
      'cache.json'
    )
    const cache = new Map<string, Translation>([
      [
        cacheKey('¿Resucitó Jesús?'),
        { sourceLanguage: 'es', english: 'Did Jesus rise?' }
      ],
      [cacheKey('Is God real?'), { sourceLanguage: 'en' }]
    ])
    saveCache(path, cache)
    expect(loadCache(path)).toEqual(cache)
  })

  it('swallows and warns on an I/O failure instead of aborting the run', () => {
    // A file where a directory is expected makes mkdir/write throw ENOTDIR —
    // a real persistence failure, no mocking needed.
    const blocker = tmpFile('blocker')
    writeFileSync(blocker, 'i am a file, not a directory', 'utf8')
    const path = join(blocker, 'sub', 'cache.json')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() =>
      saveCache(path, new Map([['h', { sourceLanguage: 'en' }]]))
    ).not.toThrow()
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('could not persist translation cache')
    )
    warn.mockRestore()
  })
})

describe('isPoisonedEnglish', () => {
  it('flags a cached en verdict that script rules out as English', () => {
    expect(
      isPoisonedEnglish({ sourceLanguage: 'en' }, 'আমি যীশুকে বিশ্বাস করি')
    ).toBe(true)
  })

  it('leaves a genuine en verdict on Latin text alone', () => {
    expect(isPoisonedEnglish({ sourceLanguage: 'en' }, 'who is Jesus')).toBe(
      false
    )
  })

  it('is only about en verdicts — a named translation is never poisoned', () => {
    expect(
      isPoisonedEnglish(
        { sourceLanguage: 'bn', english: 'I believe in Jesus' },
        'আমি যীশুকে বিশ্বাস করি'
      )
    ).toBe(false)
  })
})
