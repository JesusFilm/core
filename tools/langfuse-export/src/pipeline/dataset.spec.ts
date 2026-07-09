import { buildDataset, invertThemes } from './dataset'
import type { FacetExtraction } from './facets'
import type {
  ConversationTurn,
  DateWindow,
  SanitisedConversation,
  ThemeSynthesis,
  Translation
} from '../types'

const window: DateWindow = {
  from: new Date('2026-05-01T00:00:00.000Z'),
  to: new Date('2026-05-31T00:00:00.000Z')
}

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

describe('invertThemes', () => {
  it('maps each session to its theme labels, de-duplicated', () => {
    const synthesis: ThemeSynthesis = {
      themes: [
        { label: 'A', sessionIds: ['s1', 's2'] },
        { label: 'B', sessionIds: ['s2'] },
        { label: 'A', sessionIds: ['s2'] }
      ]
    }
    const bySession = invertThemes(synthesis)
    expect(bySession.get('s1')).toEqual(['A'])
    expect(bySession.get('s2')).toEqual(['A', 'B'])
  })

  it('returns an empty map for no themes', () => {
    expect(invertThemes({ themes: [] }).size).toBe(0)
  })
})

const facets: FacetExtraction = {
  keywordFacets: [
    {
      key: 'keyword:resurrection',
      label: 'resurrection',
      kind: 'keyword',
      count: 2
    }
  ],
  sessionKeywordKeys: new Map([
    ['s1', ['keyword:resurrection']],
    ['s2', []]
  ]),
  suppressedKeywordCount: 3,
  countryFacets: [
    { key: 'country:US', label: 'US', kind: 'country', count: 1 }
  ],
  sessionCountryKeys: new Map([
    ['s1', ['country:US']],
    ['s2', []]
  ]),
  languageFacets: [
    { key: 'language:en', label: 'en', kind: 'language', count: 1 }
  ],
  sessionLanguageKeys: new Map([
    ['s1', ['language:en']],
    ['s2', []]
  ])
}

describe('buildDataset', () => {
  const s1 = conv({
    sessionId: 's1',
    language: 'en',
    turns: [
      turn({
        startTime: '2026-05-10T09:00:00.000Z',
        userMessage: 'Did the resurrection happen?',
        assistantReply: 'There is strong evidence.'
      }),
      turn({
        startTime: '2026-05-10T09:01:00.000Z',
        userMessage: 'What is the evidence?',
        assistantReply: 'Empty tomb and testimony.'
      })
    ]
  })
  const s2 = conv({
    sessionId: 's2',
    synthetic: true,
    turns: [
      turn({
        startTime: '2026-05-09T09:00:00.000Z',
        userMessage: 'Why does God allow suffering?',
        assistantReply: '' // empty assistant reply -> dropped from messages
      })
    ]
  })
  const themesBySession = new Map<string, string[]>([
    ['s1', ['Resurrection']],
    ['s2', ['Suffering', 'Doubt']]
  ])

  const dataset = buildDataset(
    [s1, s2],
    window,
    facets,
    themesBySession,
    7,
    '2026-06-04T00:00:00.000Z'
  )

  it('orders sessions by start time and assigns stable anonymous labels', () => {
    expect(dataset.sessions[0].id).toBe('s2') // earlier start
    expect(dataset.sessions[0].label).toBe('Session 001')
    expect(dataset.sessions[1].id).toBe('s1')
    expect(dataset.sessions[1].label).toBe('Session 002')
  })

  it('flattens turns into ordered user/assistant messages, dropping empties', () => {
    const session = dataset.sessions[1] // s1
    expect(session.messages.map((m) => m.role)).toEqual([
      'user',
      'assistant',
      'user',
      'assistant'
    ])
    expect(session.messages[0].text).toBe('Did the resurrection happen?')
    expect(session.messageCount).toBe(4)
    expect(session.firstUserMessage).toBe('Did the resurrection happen?')

    const synthetic = dataset.sessions[0] // s2, empty assistant reply
    expect(synthetic.messages).toHaveLength(1)
    expect(synthetic.messages[0].role).toBe('user')
    expect(synthetic.messageCount).toBe(1)
  })

  it('combines country, language, theme and keyword facet keys onto each session', () => {
    const session = dataset.sessions[1] // s1
    expect(session.facetKeys).toContain('theme:Resurrection')
    expect(session.facetKeys).toContain('country:US')
    expect(session.facetKeys).toContain('language:en')
    expect(session.facetKeys).toContain('keyword:resurrection')
    expect(session.themes).toEqual(['Resurrection'])
  })

  it('emits country, language, theme and keyword facets with session counts', () => {
    const countryFacets = dataset.facets.filter((f) => f.kind === 'country')
    const languageFacets = dataset.facets.filter((f) => f.kind === 'language')
    const themeFacets = dataset.facets.filter((f) => f.kind === 'theme')
    const keywordFacets = dataset.facets.filter((f) => f.kind === 'keyword')
    expect(countryFacets.map((f) => f.label)).toEqual(['US'])
    expect(languageFacets.map((f) => f.label)).toEqual(['en'])
    expect(themeFacets.map((f) => f.label)).toEqual([
      'Doubt',
      'Resurrection',
      'Suffering'
    ])
    expect(themeFacets.every((f) => f.count === 1)).toBe(true)
    expect(keywordFacets.map((f) => f.label)).toEqual(['resurrection'])
    // Country facets lead the combined list; keyword facets trail it.
    expect(dataset.facets[0].kind).toBe('country')
    expect(dataset.facets[dataset.facets.length - 1].kind).toBe('keyword')
  })

  it('computes the data-quality summary', () => {
    expect(dataset.summary).toMatchObject({
      windowFrom: '2026-05-01T00:00:00.000Z',
      windowTo: '2026-05-31T00:00:00.000Z',
      generatedAt: '2026-06-04T00:00:00.000Z',
      totalSessions: 2,
      totalMessages: 5,
      nullSessionCount: 1,
      singleTurnCount: 1,
      excludedLoadTestTurns: 7,
      suppressedKeywordCount: 3,
      themesAvailable: true
    })
  })

  it('marks themes unavailable when no enrichment map is supplied', () => {
    const noThemes = buildDataset(
      [s1, s2],
      window,
      facets,
      null,
      0,
      '2026-06-04T00:00:00.000Z'
    )
    expect(noThemes.summary.themesAvailable).toBe(false)
    expect(noThemes.facets.some((f) => f.kind === 'theme')).toBe(false)
    expect(noThemes.sessions[1].themes).toEqual([])
  })

  it('marks translation unavailable and zeroed when no translations are supplied', () => {
    expect(dataset.summary.translationAvailable).toBe(false)
    expect(dataset.summary.translatedMessageCount).toBe(0)
    expect(dataset.summary.sourceLanguages).toEqual([])
    expect(dataset.sessions[1].messages[0].textEnglish).toBeUndefined()
    expect(dataset.sessions[1].sourceLanguage).toBeUndefined()
  })
})

describe('buildDataset with translations', () => {
  // spanish (05-11) sorts before english (05-12): sessions[0]=es1, [1]=en1.
  const spanish = conv({
    sessionId: 'es1',
    language: 'es',
    turns: [
      turn({
        startTime: '2026-05-11T09:00:00.000Z',
        userMessage: '¿Resucitó Jesús?',
        assistantReply: 'Hay evidencia fuerte.'
      })
    ]
  })
  const english = conv({
    sessionId: 'en1',
    language: 'en',
    turns: [
      turn({
        startTime: '2026-05-12T09:00:00.000Z',
        userMessage: 'Is God real?',
        assistantReply: 'Consider the evidence.'
      })
    ]
  })

  const translations = new Map<string, Translation>([
    ['¿Resucitó Jesús?', { sourceLanguage: 'es', english: 'Did Jesus rise?' }],
    [
      'Hay evidencia fuerte.',
      { sourceLanguage: 'es', english: 'There is strong evidence.' }
    ],
    ['Is God real?', { sourceLanguage: 'en' }],
    ['Consider the evidence.', { sourceLanguage: 'en' }],
    ['resurrección', { sourceLanguage: 'es', english: 'resurrection' }]
  ])

  const glossFacets: FacetExtraction = {
    keywordFacets: [
      {
        key: 'keyword:resurrección',
        label: 'resurrección',
        kind: 'keyword',
        count: 1
      }
    ],
    sessionKeywordKeys: new Map([
      ['es1', ['keyword:resurrección']],
      ['en1', []]
    ]),
    suppressedKeywordCount: 0,
    countryFacets: [],
    sessionCountryKeys: new Map([
      ['es1', []],
      ['en1', []]
    ]),
    languageFacets: [],
    sessionLanguageKeys: new Map([
      ['es1', []],
      ['en1', []]
    ])
  }

  const dataset = buildDataset(
    [spanish, english],
    window,
    glossFacets,
    null,
    0,
    '2026-06-04T00:00:00.000Z',
    translations
  )

  it('adds textEnglish + sourceLanguage to translated messages without mutating text', () => {
    const es = dataset.sessions[0]
    expect(es.messages[0].text).toBe('¿Resucitó Jesús?') // original untouched
    expect(es.messages[0].textEnglish).toBe('Did Jesus rise?')
    expect(es.messages[0].sourceLanguage).toBe('es')
  })

  it('leaves English messages as pass-through (no textEnglish)', () => {
    const en = dataset.sessions[1]
    expect(en.messages[0].text).toBe('Is God real?')
    expect(en.messages[0].textEnglish).toBeUndefined()
    expect(en.messages[0].sourceLanguage).toBeUndefined()
  })

  it('populates firstUserMessageEnglish + session sourceLanguage', () => {
    const es = dataset.sessions[0]
    expect(es.firstUserMessageEnglish).toBe('Did Jesus rise?')
    expect(es.sourceLanguage).toBe('es')

    const en = dataset.sessions[1]
    expect(en.firstUserMessageEnglish).toBeUndefined()
    // `sourceLanguage` names the language of a TRANSLATED preview. An English
    // preview has no translation, so there is nothing to name.
    expect(en.sourceLanguage).toBeUndefined()
  })

  it('glosses keyword facets while keeping the original label + filter key', () => {
    const keyword = dataset.facets.filter((f) => f.kind === 'keyword')[0]
    expect(keyword.label).toBe('resurrección')
    expect(keyword.key).toBe('keyword:resurrección')
    expect(keyword.labelEnglish).toBe('resurrection')
    expect(keyword.sourceLanguage).toBe('es')
  })

  it('summarises translation counts and distinct non-en languages', () => {
    expect(dataset.summary.translationAvailable).toBe(true)
    expect(dataset.summary.translatedMessageCount).toBe(2) // es user + es assistant
    expect(dataset.summary.sourceLanguages).toEqual(['es'])
  })
})

describe('buildDataset — translation guards (NES-1762)', () => {
  // A model that mislabels 'sup' as Spanish and echoes it back must not produce
  // a TRANSLATED chip above identical text.
  it('ignores a translation identical to its source', () => {
    const conversations = [
      conv({
        sessionId: 's1',
        turns: [turn({ userMessage: 'sup', assistantReply: 'hi' })]
      })
    ]
    const translations = new Map<string, Translation>([
      ['sup', { sourceLanguage: 'es', english: 'sup' }]
    ])
    const dataset = buildDataset(
      conversations,
      window,
      emptyFacets(),
      null,
      0,
      '2026-05-31T00:00:00.000Z',
      translations
    )
    const [message] = dataset.sessions[0].messages
    expect(message.text).toBe('sup')
    expect(message.textEnglish).toBeUndefined()
    expect(message.sourceLanguage).toBeUndefined()
    expect(dataset.summary.translatedMessageCount).toBe(0)
    expect(dataset.sessions[0].firstUserMessageEnglish).toBeUndefined()
  })

  it('ignores an identical translation that differs only by surrounding whitespace', () => {
    const conversations = [
      conv({
        sessionId: 's1',
        turns: [turn({ userMessage: 'Hum', assistantReply: '' })]
      })
    ]
    const translations = new Map<string, Translation>([
      ['Hum', { sourceLanguage: 'hi', english: '  Hum  ' }]
    ])
    const dataset = buildDataset(
      conversations,
      window,
      emptyFacets(),
      null,
      0,
      '2026-05-31T00:00:00.000Z',
      translations
    )
    expect(dataset.sessions[0].messages[0].textEnglish).toBeUndefined()
  })

  it('suppresses a keyword facet whose English gloss is a stopword, and drops its session keys', () => {
    const extraction: FacetExtraction = {
      ...emptyFacets(),
      keywordFacets: [
        { key: 'keyword:que', label: 'que', kind: 'keyword', count: 2 },
        { key: 'keyword:dios', label: 'dios', kind: 'keyword', count: 3 }
      ],
      sessionKeywordKeys: new Map([['s1', ['keyword:que', 'keyword:dios']]])
    }
    const translations = new Map<string, Translation>([
      ['que', { sourceLanguage: 'es', english: 'that' }],
      ['dios', { sourceLanguage: 'es', english: 'God' }]
    ])
    const dataset = buildDataset(
      [conv({ sessionId: 's1' })],
      window,
      extraction,
      null,
      0,
      '2026-05-31T00:00:00.000Z',
      translations
    )
    const keywords = dataset.facets.filter((f) => f.kind === 'keyword')
    expect(keywords.map((f) => f.key)).toEqual(['keyword:dios'])
    // Gloss is lowercased so it sits beside untranslated terms.
    expect(keywords[0].labelEnglish).toBe('god')
    expect(keywords[0].label).toBe('dios')
    expect(dataset.summary.suppressedTranslatedKeywordCount).toBe(1)
    expect(dataset.sessions[0].facetKeys).not.toContain('keyword:que')
    expect(dataset.sessions[0].facetKeys).toContain('keyword:dios')
  })

  it('leaves untranslated keyword facets and their keys intact', () => {
    const extraction: FacetExtraction = {
      ...emptyFacets(),
      keywordFacets: [
        {
          key: 'keyword:resurrection',
          label: 'resurrection',
          kind: 'keyword',
          count: 2
        }
      ],
      sessionKeywordKeys: new Map([['s1', ['keyword:resurrection']]])
    }
    const dataset = buildDataset(
      [conv({ sessionId: 's1' })],
      window,
      extraction,
      null,
      0,
      '2026-05-31T00:00:00.000Z',
      new Map()
    )
    expect(dataset.facets.filter((f) => f.kind === 'keyword')).toHaveLength(1)
    expect(dataset.sessions[0].facetKeys).toContain('keyword:resurrection')
    expect(dataset.summary.suppressedTranslatedKeywordCount).toBe(0)
  })
})

function emptyFacets(): FacetExtraction {
  return {
    keywordFacets: [],
    sessionKeywordKeys: new Map(),
    suppressedKeywordCount: 0,
    countryFacets: [],
    sessionCountryKeys: new Map(),
    languageFacets: [],
    sessionLanguageKeys: new Map()
  }
}

describe('buildDataset — session language reporting (NES-1762)', () => {
  // A session's journey language routinely disagrees with what was typed, and a
  // session is often not monolingual. The card must be able to say so.
  it('reports every non-English language actually detected in a session', () => {
    const conversations = [
      conv({
        sessionId: 's1',
        language: 'English',
        turns: [
          turn({ userMessage: 'hi', assistantReply: 'goeie dag' }),
          turn({ userMessage: 'مرحبا', assistantReply: 'איך בין' })
        ]
      })
    ]
    const translations = new Map<string, Translation>([
      ['hi', { sourceLanguage: 'en' }],
      ['goeie dag', { sourceLanguage: 'af', english: 'good day' }],
      ['مرحبا', { sourceLanguage: 'ar', english: 'hello' }],
      ['איך בין', { sourceLanguage: 'yi', english: 'I am' }]
    ])
    const dataset = buildDataset(
      conversations,
      window,
      emptyFacets(),
      null,
      0,
      '2026-05-31T00:00:00.000Z',
      translations
    )
    const [session] = dataset.sessions
    expect(session.translatedLanguages.sort()).toEqual(['af', 'ar', 'yi'])
    // The journey language says English; the typed languages say otherwise.
    expect(session.language).toBe('English')
    expect(session.languageLabel).toBe('English')
  })

  it('normalises the journey language label but preserves the raw value', () => {
    const dataset = buildDataset(
      [conv({ sessionId: 's1', language: 'Spanish, Latin American' })],
      window,
      emptyFacets(),
      null,
      0,
      '2026-05-31T00:00:00.000Z'
    )
    expect(dataset.sessions[0].language).toBe('Spanish, Latin American')
    expect(dataset.sessions[0].languageLabel).toBe('Spanish')
    expect(dataset.sessions[0].translatedLanguages).toEqual([])
  })

  it('suppresses a keyword facet whose gloss is only function words', () => {
    const extraction: FacetExtraction = {
      ...emptyFacets(),
      keywordFacets: [
        { key: 'keyword:hacer', label: 'hacer', kind: 'keyword', count: 2 },
        { key: 'keyword:kitab', label: 'kitab', kind: 'keyword', count: 2 }
      ],
      sessionKeywordKeys: new Map([['s1', ['keyword:hacer', 'keyword:kitab']]])
    }
    const translations = new Map<string, Translation>([
      ['hacer', { sourceLanguage: 'es', english: 'to do' }],
      ['kitab', { sourceLanguage: 'ar', english: 'the book' }]
    ])
    const dataset = buildDataset(
      [conv({ sessionId: 's1' })],
      window,
      extraction,
      null,
      0,
      '2026-05-31T00:00:00.000Z',
      translations
    )
    const keywords = dataset.facets.filter((f) => f.kind === 'keyword')
    // 'to do' is all function words; 'the book' keeps a content word.
    expect(keywords.map((f) => f.labelEnglish)).toEqual(['the book'])
    expect(dataset.summary.suppressedTranslatedKeywordCount).toBe(1)
  })
})

describe('buildDataset — typed-language facets (NES-1762)', () => {
  // Journey language and typed language disagree often. Filtering "Bengali" on
  // the journey facet returns sessions containing no Bengali at all; the typed
  // facet answers the question an analyst is actually asking.
  it('facets on what was typed, not on the journey language', () => {
    const conversations = [
      // Journey says Bengali; the user wrote English throughout.
      conv({
        sessionId: 's1',
        language: 'Bengali (Indian)',
        turns: [
          turn({
            userMessage: 'who is Jesus',
            assistantReply: 'He is the Christ'
          })
        ]
      }),
      // Journey says English; the user wrote Afrikaans.
      conv({
        sessionId: 's2',
        language: 'en',
        turns: [turn({ userMessage: 'goeie dag', assistantReply: 'good day' })]
      })
    ]
    const translations = new Map<string, Translation>([
      ['who is Jesus', { sourceLanguage: 'en' }],
      ['He is the Christ', { sourceLanguage: 'en' }],
      ['goeie dag', { sourceLanguage: 'af', english: 'good day' }],
      ['good day', { sourceLanguage: 'en' }]
    ])
    const dataset = buildDataset(
      conversations,
      window,
      emptyFacets(),
      null,
      0,
      '2026-05-31T00:00:00.000Z',
      translations
    )
    const typed = dataset.facets.filter((f) => f.kind === 'typedLanguage')
    // s2's English comes from the ASSISTANT's reply, not the user, so it must
    // not count toward "what people wrote".
    expect(typed.map((f) => `${f.label}=${f.count}`).sort()).toEqual([
      'Afrikaans=1',
      'English=1'
    ])
    // The Bengali-journey session contains no Bengali, so it must not appear
    // under a typed-Bengali facet — there isn't one.
    expect(typed.find((f) => f.label === 'Bengali')).toBeUndefined()
    expect(dataset.sessions[0].facetKeys).toContain('typedLanguage:English')
    expect(dataset.sessions[0].facetKeys).not.toContain('typedLanguage:Bengali')
    expect(dataset.sessions[1].facetKeys).toContain('typedLanguage:Afrikaans')
    expect(dataset.sessions[1].facetKeys).not.toContain('typedLanguage:English')
  })

  // A model that tags an Arabic message `es` must not produce a facet or a
  // badge claiming Spanish. The translation survives; the attribution does not.
  it('drops a language attribution the script disproves', () => {
    const arabic = 'السلام عليكم ورحمة الله'
    const conversations = [
      conv({
        sessionId: 's1',
        turns: [turn({ userMessage: arabic, assistantReply: '' })]
      })
    ]
    const translations = new Map<string, Translation>([
      [arabic, { sourceLanguage: 'es', english: 'Peace be upon you' }]
    ])
    const dataset = buildDataset(
      conversations,
      window,
      emptyFacets(),
      null,
      0,
      '2026-05-31T00:00:00.000Z',
      translations
    )
    const [message] = dataset.sessions[0].messages
    expect(message.textEnglish).toBe('Peace be upon you')
    expect(message.sourceLanguage).toBeUndefined()
    expect(dataset.facets.filter((f) => f.kind === 'typedLanguage')).toEqual([])
    expect(dataset.summary.sourceLanguages).not.toContain('es')
  })

  it('keeps an attribution the script corroborates', () => {
    const arabic = 'السلام عليكم ورحمة الله'
    const dataset = buildDataset(
      [
        conv({
          sessionId: 's1',
          turns: [turn({ userMessage: arabic, assistantReply: '' })]
        })
      ],
      window,
      emptyFacets(),
      null,
      0,
      '2026-05-31T00:00:00.000Z',
      new Map<string, Translation>([
        [arabic, { sourceLanguage: 'ar', english: 'Peace be upon you' }]
      ])
    )
    expect(dataset.sessions[0].messages[0].sourceLanguage).toBe('ar')
    expect(
      dataset.facets
        .filter((f) => f.kind === 'typedLanguage')
        .map((f) => f.label)
    ).toEqual(['Arabic'])
  })

  it('emits no typed-language facets when no translation pass ran', () => {
    const dataset = buildDataset(
      [conv({ sessionId: 's1', language: 'en' })],
      window,
      emptyFacets(),
      null,
      0,
      '2026-05-31T00:00:00.000Z'
    )
    expect(dataset.facets.filter((f) => f.kind === 'typedLanguage')).toEqual([])
  })
})

describe('buildDataset — a foreign word that looks English (NES-1762)', () => {
  // Afrikaans 'die' means 'the'. The model calls it English, because it IS an
  // English word — so it renders as a plain keyword meaning 'death'. A term
  // never once used in an English message is not an English term.
  it('attributes a keyword used only in non-English messages', () => {
    const extraction: FacetExtraction = {
      ...emptyFacets(),
      keywordFacets: [
        { key: 'keyword:die', label: 'die', kind: 'keyword', count: 1 },
        { key: 'keyword:bible', label: 'bible', kind: 'keyword', count: 1 }
      ],
      sessionKeywordKeys: new Map([['s1', ['keyword:die', 'keyword:bible']]])
    }
    const afrikaans = 'Kan ek die bybel glo'
    const english = 'is the bible reliable'
    const conversations = [
      conv({
        sessionId: 's1',
        turns: [
          turn({ userMessage: afrikaans, assistantReply: '' }),
          turn({ userMessage: english, assistantReply: '' })
        ]
      })
    ]
    const translations = new Map<string, Translation>([
      [afrikaans, { sourceLanguage: 'af', english: 'Can I believe the bible' }],
      [english, { sourceLanguage: 'en' }]
    ])
    const dataset = buildDataset(
      conversations,
      window,
      extraction,
      null,
      0,
      '2026-05-31T00:00:00.000Z',
      translations
    )
    const byLabel = Object.fromEntries(
      dataset.facets
        .filter((f) => f.kind === 'keyword')
        .map((f) => [f.label, f])
    )
    // 'die' appears only in the Afrikaans message -> attributed.
    expect(byLabel.die.sourceLanguage).toBe('af')
    expect(byLabel.die.labelEnglish).toBeUndefined()
    // 'bible' appears in an English message too -> no claim.
    expect(byLabel.bible.sourceLanguage).toBeUndefined()
  })

  it('makes no claim when a term spans several non-English languages', () => {
    const extraction: FacetExtraction = {
      ...emptyFacets(),
      keywordFacets: [
        { key: 'keyword:amen', label: 'amen', kind: 'keyword', count: 2 }
      ],
      sessionKeywordKeys: new Map([['s1', ['keyword:amen']]])
    }
    const conversations = [
      conv({
        sessionId: 's1',
        turns: [
          turn({ userMessage: 'amen hermano', assistantReply: '' }),
          turn({ userMessage: 'amen broer', assistantReply: '' })
        ]
      })
    ]
    const translations = new Map<string, Translation>([
      ['amen hermano', { sourceLanguage: 'es', english: 'amen brother' }],
      ['amen broer', { sourceLanguage: 'af', english: 'amen brother' }]
    ])
    const dataset = buildDataset(
      conversations,
      window,
      extraction,
      null,
      0,
      '2026-05-31T00:00:00.000Z',
      translations
    )
    const amen = dataset.facets.find((f) => f.label === 'amen')
    expect(amen?.sourceLanguage).toBeUndefined()
  })
})

describe('buildDataset — the card cannot out-claim the conversation (NES-1762)', () => {
  // Romanized Bengali is Latin script. The message pipeline refuses to name it;
  // the session card must refuse too, or one message is "Bengali" on the card
  // and unnamed one click later.
  it('drops a card language claim the script disproves', () => {
    const romanized = 'Biwasa holo akta asa'
    const dataset = buildDataset(
      [
        conv({
          sessionId: 's1',
          turns: [turn({ userMessage: romanized, assistantReply: '' })]
        })
      ],
      window,
      emptyFacets(),
      null,
      0,
      '2026-05-31T00:00:00.000Z',
      new Map<string, Translation>([
        [romanized, { sourceLanguage: 'bn', english: 'Faith is a hope' }]
      ])
    )
    const [session] = dataset.sessions
    // The translation still shows; only the attribution is withheld.
    expect(session.firstUserMessageEnglish).toBe('Faith is a hope')
    expect(session.sourceLanguage).toBeUndefined()
    // And it agrees with the message the card is previewing.
    expect(session.messages[0].textEnglish).toBe('Faith is a hope')
    expect(session.messages[0].sourceLanguage).toBeUndefined()
  })

  it('keeps a card language claim the script corroborates', () => {
    const bengali = 'যীশু কী সত্য?'
    const dataset = buildDataset(
      [
        conv({
          sessionId: 's1',
          turns: [turn({ userMessage: bengali, assistantReply: '' })]
        })
      ],
      window,
      emptyFacets(),
      null,
      0,
      '2026-05-31T00:00:00.000Z',
      new Map<string, Translation>([
        [bengali, { sourceLanguage: 'bn', english: 'Is Jesus real?' }]
      ])
    )
    expect(dataset.sessions[0].sourceLanguage).toBe('bn')
    expect(dataset.sessions[0].messages[0].sourceLanguage).toBe('bn')
  })
})
