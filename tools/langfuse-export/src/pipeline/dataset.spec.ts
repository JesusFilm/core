import { buildDataset, invertThemes } from './dataset'
import type { FacetExtraction } from './facets'
import type {
  ConversationTurn,
  DateWindow,
  SanitisedConversation,
  ThemeSynthesis
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
  suppressedKeywordCount: 3
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

  it('combines theme and keyword facet keys onto each session', () => {
    const session = dataset.sessions[1] // s1
    expect(session.facetKeys).toContain('theme:Resurrection')
    expect(session.facetKeys).toContain('keyword:resurrection')
    expect(session.themes).toEqual(['Resurrection'])
  })

  it('emits theme facets first, then keyword facets, with session counts', () => {
    const themeFacets = dataset.facets.filter((f) => f.kind === 'theme')
    const keywordFacets = dataset.facets.filter((f) => f.kind === 'keyword')
    expect(themeFacets.map((f) => f.label)).toEqual([
      'Doubt',
      'Resurrection',
      'Suffering'
    ])
    expect(themeFacets.every((f) => f.count === 1)).toBe(true)
    expect(keywordFacets.map((f) => f.label)).toEqual(['resurrection'])
    // Theme facets precede keyword facets in the combined list.
    expect(dataset.facets[0].kind).toBe('theme')
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
    expect(noThemes.facets.every((f) => f.kind === 'keyword')).toBe(true)
    expect(noThemes.sessions[1].themes).toEqual([])
  })
})
