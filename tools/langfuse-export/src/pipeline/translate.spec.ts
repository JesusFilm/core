import {
  canonicalLanguageCode,
  cannotBeEnglish,
  collectTranslatable,
  scriptContradictsLanguage
} from './translate'
import type { FacetExtraction } from './facets'
import type { ConversationTurn, SanitisedConversation } from '../types'

function turn(overrides: Partial<ConversationTurn> = {}): ConversationTurn {
  return {
    observationId: 'o',
    traceId: 't',
    startTime: '2026-05-10T00:00:00.000Z',
    userMessage: 'hello',
    assistantReply: 'hi',
    model: 'm',
    latencySeconds: 1,
    inputTokens: 1,
    outputTokens: 1,
    totalTokens: 2,
    costUsd: 0.001,
    ...overrides
  }
}

function conv(
  overrides: Partial<SanitisedConversation> = {}
): SanitisedConversation {
  return {
    sessionId: 's',
    synthetic: false,
    tags: [],
    turns: [turn()],
    ...overrides
  } as SanitisedConversation
}

function facetExtraction(keywordLabels: string[]): FacetExtraction {
  return {
    keywordFacets: keywordLabels.map((label) => ({
      key: `keyword:${label}`,
      label,
      kind: 'keyword',
      count: 1
    })),
    sessionKeywordKeys: new Map(),
    suppressedKeywordCount: 0,
    // Country/language labels are codes — collectTranslatable must NOT pull them.
    countryFacets: [
      { key: 'country:BD', label: 'BD', kind: 'country', count: 1 }
    ],
    sessionCountryKeys: new Map(),
    languageFacets: [
      { key: 'language:bn', label: 'bn', kind: 'language', count: 1 }
    ],
    sessionLanguageKeys: new Map()
  }
}

describe('collectTranslatable', () => {
  it('collects non-empty user + assistant messages and keyword labels', () => {
    const conversations = [
      conv({
        turns: [
          turn({ userMessage: '¿Resucitó Jesús?', assistantReply: 'Sí.' })
        ]
      })
    ]
    const result = collectTranslatable(
      conversations,
      facetExtraction(['resurrección'])
    )
    expect(result).toEqual(['¿Resucitó Jesús?', 'Sí.', 'resurrección'])
  })

  it('skips whitespace-only messages and deduplicates repeats', () => {
    const conversations = [
      conv({
        turns: [
          turn({ userMessage: 'same question', assistantReply: '   ' }),
          turn({ userMessage: 'same question', assistantReply: 'a reply' })
        ]
      })
    ]
    const result = collectTranslatable(conversations, facetExtraction([]))
    expect(result).toEqual(['same question', 'a reply'])
  })

  it('excludes country and language facet labels (they are codes)', () => {
    const result = collectTranslatable([conv()], facetExtraction(['grace']))
    expect(result).not.toContain('BD')
    expect(result).not.toContain('bn')
    expect(result).toContain('grace')
  })

  it('returns an empty array for an empty corpus with no keyword facets', () => {
    expect(collectTranslatable([], facetExtraction([]))).toEqual([])
  })
})

describe('cannotBeEnglish', () => {
  it('rejects an English verdict for non-Latin script', () => {
    expect(cannotBeEnglish('আমি যীশুকে বিশ্বাস করি')).toBe(true) // Bengali
    expect(cannotBeEnglish('من يسوع')).toBe(true) // Arabic
    expect(cannotBeEnglish('예수님')).toBe(true) // Hangul
  })

  it('stays silent on Latin script — it is a script floor, not a detector', () => {
    expect(cannotBeEnglish('who is Jesus')).toBe(false)
    expect(cannotBeEnglish('¿quién es Dios?')).toBe(false) // Spanish: Latin, undecidable here
  })

  it('ignores text with no letters at all', () => {
    expect(cannotBeEnglish('123 !!! ???')).toBe(false)
    expect(cannotBeEnglish('')).toBe(false)
  })

  it('treats majority-non-Latin mixed text as non-English', () => {
    expect(cannotBeEnglish('Jesus আমি যীশুকে বিশ্বাস করি বাংলা')).toBe(true)
    expect(
      cannotBeEnglish('mostly english text with one word যীশু here now')
    ).toBe(false)
  })
})

describe('canonicalLanguageCode', () => {
  it('folds a recognised full name back onto its code', () => {
    expect(canonicalLanguageCode('bengali')).toBe('bn')
    expect(canonicalLanguageCode('Bengali')).toBe('bn')
    expect(canonicalLanguageCode('  SPANISH  ')).toBe('es')
    expect(canonicalLanguageCode('english')).toBe('en')
    // Persian and Farsi both name the same language.
    expect(canonicalLanguageCode('persian')).toBe('fa')
    expect(canonicalLanguageCode('farsi')).toBe('fa')
  })

  it('passes a known code through lowercased and trimmed', () => {
    expect(canonicalLanguageCode('bn')).toBe('bn')
    expect(canonicalLanguageCode(' EN ')).toBe('en')
  })

  it('keeps an unrecognised code rather than dropping a real language', () => {
    // Tamil is a real language we do not list yet — it must survive.
    expect(canonicalLanguageCode('ta')).toBe('ta')
    expect(canonicalLanguageCode('klingon')).toBe('klingon')
  })
})

describe('scriptContradictsLanguage', () => {
  it('disproves a label the script rules out', () => {
    expect(scriptContradictsLanguage('السلام عليكم', 'es')).toBe(true)
    expect(scriptContradictsLanguage('আমি যীশুকে বিশ্বাস করি', 'hi')).toBe(true)
    expect(scriptContradictsLanguage('who is Jesus', 'bn')).toBe(true)
  })

  it('accepts a label the script corroborates', () => {
    expect(scriptContradictsLanguage('السلام عليكم', 'ar')).toBe(false)
    expect(scriptContradictsLanguage('¿quién es Dios?', 'es')).toBe(false)
    expect(scriptContradictsLanguage('আমি যীশুকে', 'bn')).toBe(false)
    // Yiddish is written in Hebrew script — not a contradiction.
    expect(scriptContradictsLanguage('איך בין', 'yi')).toBe(false)
  })

  it('stays silent when it cannot prove anything', () => {
    expect(scriptContradictsLanguage('hello', 'xx')).toBe(false) // unknown code
    expect(scriptContradictsLanguage('123 !!!', 'es')).toBe(false) // no letters
    expect(scriptContradictsLanguage('', 'ar')).toBe(false)
  })
})
