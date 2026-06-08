import { buildFacets } from './facets'
import type { ConversationTurn, SanitisedConversation } from '../types'

function turn(userMessage: string): ConversationTurn {
  return {
    observationId: 'o',
    traceId: 't',
    startTime: '2026-05-10T00:00:00.000Z',
    userMessage,
    assistantReply: 'reply',
    model: 'm',
    latencySeconds: 1,
    inputTokens: 1,
    outputTokens: 1,
    totalTokens: 2,
    costUsd: 0.001
  }
}

// The brand is compile-time only — casting a plain object is safe at runtime.
function conv(
  sessionId: string,
  messages: string[],
  ipCountry?: string,
  language?: string
): SanitisedConversation {
  return {
    sessionId,
    synthetic: false,
    tags: [],
    ipCountry,
    language,
    turns: messages.map(turn)
  } as unknown as SanitisedConversation
}

describe('buildFacets', () => {
  const corpus = [
    conv('s1', ['Why does God allow suffering and evil?']),
    conv('s2', ['Is God real and did the resurrection happen?']),
    conv('s3', ['God and science and the resurrection evidence']),
    conv('s4', ['Suffering and evil in the world, God'])
  ]

  it('suppresses over-common terms and drops rare ones', () => {
    const result = buildFacets(corpus)
    const labels = result.keywordFacets.map((facet) => facet.label)
    // "god" is in every session (df 4/4 > 50%) -> suppressed, never a facet.
    expect(labels).not.toContain('god')
    // df>=2 and <=50%: evil, resurrection, suffering survive.
    expect(labels).toEqual(['evil', 'resurrection', 'suffering'])
    // df==1 noise is dropped.
    expect(labels).not.toContain('science')
    expect(labels).not.toContain('evidence')
  })

  it('counts the suppressed over-common terms (the headline figure)', () => {
    const result = buildFacets(corpus)
    expect(result.suppressedKeywordCount).toBe(1) // just "god"
  })

  it('sets each facet count to its document frequency', () => {
    const result = buildFacets(corpus)
    const byLabel = new Map(
      result.keywordFacets.map((facet) => [facet.label, facet.count])
    )
    expect(byLabel.get('resurrection')).toBe(2)
    expect(byLabel.get('suffering')).toBe(2)
    expect(byLabel.get('evil')).toBe(2)
  })

  it('maps each session to the facet keys it matches, sorted', () => {
    const result = buildFacets(corpus)
    expect(result.sessionKeywordKeys.get('s1')).toEqual([
      'keyword:evil',
      'keyword:suffering'
    ])
    expect(result.sessionKeywordKeys.get('s2')).toEqual([
      'keyword:resurrection'
    ])
    expect(result.sessionKeywordKeys.get('s4')).toEqual([
      'keyword:evil',
      'keyword:suffering'
    ])
  })

  it('returns empty extraction for an empty corpus', () => {
    const result = buildFacets([])
    expect(result.keywordFacets).toEqual([])
    expect(result.sessionKeywordKeys.size).toBe(0)
    expect(result.suppressedKeywordCount).toBe(0)
    expect(result.countryFacets).toEqual([])
    expect(result.sessionCountryKeys.size).toBe(0)
    expect(result.languageFacets).toEqual([])
    expect(result.sessionLanguageKeys.size).toBe(0)
  })

  it('builds country facets from ipCountry, one vote per session', () => {
    const result = buildFacets([
      conv('s1', ['hello'], 'US'),
      conv('s2', ['hello'], 'US'),
      conv('s3', ['hello'], 'NZ'),
      conv('s4', ['hello']) // no ipCountry -> no country facet
    ])
    expect(result.countryFacets.map((f) => `${f.label}=${f.count}`)).toEqual([
      'US=2',
      'NZ=1'
    ])
    expect(result.countryFacets.every((f) => f.kind === 'country')).toBe(true)
    expect(result.sessionCountryKeys.get('s1')).toEqual(['country:US'])
    expect(result.sessionCountryKeys.get('s4')).toEqual([])
  })

  it('builds journey-language facets from the language field', () => {
    const result = buildFacets([
      conv('s1', ['hello'], 'US', 'en'),
      conv('s2', ['hello'], 'NZ', 'en'),
      conv('s3', ['hello'], 'MX', 'es'),
      conv('s4', ['hello'], 'US') // no language -> no language facet
    ])
    expect(result.languageFacets.map((f) => `${f.label}=${f.count}`)).toEqual([
      'en=2',
      'es=1'
    ])
    expect(result.languageFacets.every((f) => f.kind === 'language')).toBe(true)
    expect(result.sessionLanguageKeys.get('s1')).toEqual(['language:en'])
    expect(result.sessionLanguageKeys.get('s4')).toEqual([])
  })

  it('respects the maxFacets cap, keeping the highest-frequency terms', () => {
    const result = buildFacets(corpus, { maxFacets: 1 })
    expect(result.keywordFacets).toHaveLength(1)
    // All three survivors tie at df 2, so the alphabetical winner is "evil".
    expect(result.keywordFacets[0].label).toBe('evil')
  })

  it('a single chatty session cannot inflate document frequency', () => {
    // Repeating "resurrection" many times within one session is still df 1.
    const chatty = [
      conv('a', ['resurrection resurrection resurrection resurrection']),
      conv('b', ['unrelated topic about morality and morality'])
    ]
    const result = buildFacets(chatty)
    // df 1 each (only one session contains each) -> below MIN_DF -> no facets.
    expect(result.keywordFacets).toEqual([])
  })
})
