import { buildStats } from './aggregate'
import { renderReport } from './report'
import type {
  ConversationTurn,
  DateWindow,
  SanitisedConversation
} from './types'

const window: DateWindow = {
  from: new Date('2026-05-01T00:00:00.000Z'),
  to: new Date('2026-05-15T00:00:00.000Z')
}

function turn(overrides: Partial<ConversationTurn> = {}): ConversationTurn {
  return {
    observationId: 'o',
    traceId: 't',
    startTime: '2026-05-10T00:00:00.000Z',
    userMessage: 'hello',
    assistantReply: 'hi',
    model: 'google/gemini-3-flash-preview',
    latencySeconds: 1,
    inputTokens: 100,
    outputTokens: 10,
    totalTokens: 110,
    costUsd: 0.001,
    ...overrides
  }
}

// Test helper: the brand is a compile-time-only marker, so casting a plain
// Conversation is safe at runtime for fixtures.
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

describe('buildStats', () => {
  it('computes totals, per-model counts, and total cost', () => {
    const conversations = [
      conv({ sessionId: 's1', turns: [turn({ costUsd: 0.002 }), turn({ costUsd: 0.003 })] }),
      conv({ sessionId: 's2', turns: [turn({ model: 'openai/gpt/4o-mini', costUsd: 0.001 })] })
    ]
    const stats = buildStats(conversations, 5, window)
    expect(stats.totalConversations).toBe(2)
    expect(stats.totalTurns).toBe(3)
    expect(stats.perModel['google/gemini-3-flash-preview']).toBe(2)
    expect(stats.perModel['openai/gpt/4o-mini']).toBe(1)
    expect(stats.totalCostUsd).toBeCloseTo(0.006, 6)
    expect(stats.excludedLoadTest.count).toBe(5)
  })

  it('computes latency percentiles for a known set', () => {
    const turns = [0.5, 1, 1.5, 2, 10].map((latencySeconds) =>
      turn({ latencySeconds })
    )
    const stats = buildStats([conv({ turns })], 0, window)
    expect(stats.latencySeconds.count).toBe(5)
    expect(stats.latencySeconds.p50).toBeCloseTo(1.5, 6)
    expect(stats.latencySeconds.max).toBe(10)
  })

  it('returns zeroed stats with no NaN for an empty set', () => {
    const stats = buildStats([], 0, window)
    expect(stats.totalConversations).toBe(0)
    expect(stats.totalCostUsd).toBe(0)
    expect(stats.nullSession.share).toBe(0)
    expect(stats.latencySeconds.p95).toBe(0)
    expect(Number.isNaN(stats.singleTurn.share)).toBe(false)
  })

  it('computes top-questions only over real-session, multi-turn conversations', () => {
    const probes = Array.from({ length: 5 }, (_unused, index) =>
      conv({
        sessionId: `probe-${index}`,
        synthetic: true,
        turns: [turn({ userMessage: 'load test concurrent client' })]
      })
    )
    const real = conv({
      sessionId: 'real-1',
      synthetic: false,
      turns: [
        turn({ userMessage: 'What is grace?' }),
        turn({ userMessage: 'Tell me more' })
      ]
    })
    const stats = buildStats([...probes, real], 0, window)

    expect(stats.topQuestionsIncludedConversations).toBe(1)
    expect(stats.topQuestionsExcludedConversations).toBe(5)
    const questions = stats.topQuestions.map((q) => q.message)
    expect(questions).toContain('What is grace?')
    expect(questions).not.toContain('load test concurrent client')
  })

  it('surfaces grouping-fidelity figures', () => {
    const stats = buildStats(
      [
        conv({ sessionId: 'a', synthetic: true, turns: [turn()] }),
        conv({ sessionId: 'b', synthetic: false, turns: [turn(), turn()] })
      ],
      0,
      window
    )
    expect(stats.nullSession.count).toBe(1)
    expect(stats.nullSession.share).toBeCloseTo(0.5, 6)
    expect(stats.singleTurn.count).toBe(1)
    expect(stats.conversationLengthHistogram['1']).toBe(1)
    expect(stats.conversationLengthHistogram['2']).toBe(1)
  })
})

describe('renderReport', () => {
  const sanitised = [
    conv({
      sessionId: 'real-1',
      synthetic: false,
      turns: [turn({ userMessage: 'What is the meaning of salvation?' }), turn()]
    })
  ]

  it('renders computed totals and a verbatim excerpt', () => {
    const stats = buildStats(sanitised, 0, window)
    const html = renderReport(stats, sanitised, {
      themes: [{ label: 'Salvation', sessionIds: ['real-1'] }]
    })
    expect(html).toContain('Total conversations')
    // Verbatim excerpt rendered from the sanitised record (HTML-escaped).
    expect(html).toContain('What is the meaning of salvation?')
    expect(html).toContain('Salvation')
  })

  it('renders a degradation note when themes are null', () => {
    const stats = buildStats(sanitised, 0, window)
    const html = renderReport(stats, sanitised, null)
    expect(html).toMatch(/Thematic grouping unavailable/i)
    // Stats + verbatim sample still present.
    expect(html).toContain('What is the meaning of salvation?')
  })

  it('escapes HTML in user content', () => {
    const malicious = [
      conv({
        sessionId: 'x',
        synthetic: false,
        turns: [turn({ userMessage: '<script>alert(1)</script>' }), turn()]
      })
    ]
    const stats = buildStats(malicious, 0, window)
    const html = renderReport(stats, malicious, null)
    expect(html).toContain('&lt;script&gt;')
    expect(html).not.toContain('<script>alert(1)</script>')
  })
})
