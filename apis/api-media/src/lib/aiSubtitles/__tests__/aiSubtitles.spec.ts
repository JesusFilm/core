import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  buildFallbackVtt,
  getProfileForClass,
  parseBcp47,
  postProcessSubtitles,
  validateWebVtt
} from '../index'

const fixturesDir = join(__dirname, 'fixtures')

function loadFixture(name: string): string {
  return readFileSync(join(fixturesDir, name), 'utf8')
}

function loadSegments(name: string) {
  return JSON.parse(loadFixture(name)) as {
    id: string
    start: number
    end: number
    text: string
  }[]
}

describe('ai subtitle post-processor', () => {
  it('produces deterministic fallback VTT for English', () => {
    const segments = loadSegments('english.json')
    const profile = getProfileForClass(parseBcp47('en').languageClass)
    const vtt = buildFallbackVtt(segments, 'LTR', profile)
    const expected = loadFixture('english.vtt')

    expect(vtt).toBe(expected)
    expect(validateWebVtt(vtt, profile).valid).toBe(true)
  })

  it('produces deterministic fallback VTT for Arabic', () => {
    const segments = loadSegments('arabic.json')
    const profile = getProfileForClass(parseBcp47('ar').languageClass)
    const vtt = buildFallbackVtt(segments, 'RTL', profile)
    const expected = loadFixture('arabic.vtt')

    expect(vtt).toBe(expected)
    expect(validateWebVtt(vtt, profile).valid).toBe(true)
  })

  it('produces deterministic fallback VTT for Japanese', () => {
    const segments = loadSegments('japanese.json')
    const profile = getProfileForClass(parseBcp47('ja').languageClass)
    const vtt = buildFallbackVtt(segments, 'CJK', profile)
    const expected = loadFixture('japanese.vtt')

    expect(vtt).toBe(expected)
    expect(validateWebVtt(vtt, profile).valid).toBe(true)
  })

  it('handles mixed-script Arabic', () => {
    const segments = loadSegments('mixed-arabic.json')
    const profile = getProfileForClass(parseBcp47('ar').languageClass)
    const vtt = buildFallbackVtt(segments, 'RTL', profile)
    const expected = loadFixture('mixed-arabic.vtt')

    expect(vtt).toBe(expected)
    expect(validateWebVtt(vtt, profile).valid).toBe(true)
  })

  it('handles non-speech tokens', () => {
    const segments = loadSegments('non-speech.json')
    const profile = getProfileForClass(parseBcp47('en').languageClass)
    const vtt = buildFallbackVtt(segments, 'LTR', profile)
    const expected = loadFixture('non-speech.vtt')

    expect(vtt).toBe(expected)
    expect(validateWebVtt(vtt, profile).valid).toBe(true)
  })

  it('retries AI output before fallback', async () => {
    const segments = loadSegments('english.json')
    const invalidVtt = 'WEBVTT\n\n00:00:00.000 --> 00:00:00.500\nBad'
    const validVtt = loadFixture('english.vtt')

    let calls = 0
    const aiClient = async () => {
      calls += 1
      return calls === 1 ? invalidVtt : validVtt
    }

    const result = await postProcessSubtitles('asset', 'en', segments, {
      aiClient
    })

    expect(calls).toBe(2)
    expect(result.metadata.aiPostProcessed).toBe(true)
    expect(result.metadata.fallbackUsed).toBe(false)
    expect(result.vtt).toBe(validVtt)
  })

  it('validates fallback output against profile constraints', () => {
    const segments = loadSegments('english.json')
    const profile = getProfileForClass(parseBcp47('en').languageClass)

    const vtt = buildFallbackVtt(segments, 'LTR', profile)
    const validation = validateWebVtt(vtt, profile)

    expect(validation.valid).toBe(true)
    expect(validation.errors).toHaveLength(0)
  })

  it('keeps randomized fallback output within constraints', () => {
    const profile = getProfileForClass(parseBcp47('en').languageClass)
    const random = seededRandom(42)

    for (let i = 0; i < 10; i += 1) {
      const segments = Array.from({ length: 5 }).map((_, idx) => {
        const start = idx * 1.5
        const end = start + 1.2 + random() * 0.8
        const wordCount = 4 + Math.floor(random() * 6)
        const text = Array.from({ length: wordCount })
          .map(() => `word${Math.floor(random() * 100)}`)
          .join(' ')
        return { id: `${idx}`, start, end, text }
      })

      const vtt = buildFallbackVtt(segments, 'LTR', profile)
      const validation = validateWebVtt(vtt, profile)

      expect(validation.valid).toBe(true)
    }
  })
})

function seededRandom(seed: number): () => number {
  let value = seed
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}
