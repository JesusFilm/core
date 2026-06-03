import {
  buildStats,
  LONG_CONVERSATION_TURNS,
  REGION_TOP_QUESTIONS
} from './aggregate'
import { renderReport } from './report'
import type {
  ConversationTurn,
  DateWindow,
  SanitisedConversation
} from '../types'

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
      conv({
        sessionId: 's1',
        turns: [turn({ costUsd: 0.002 }), turn({ costUsd: 0.003 })]
      }),
      conv({
        sessionId: 's2',
        turns: [turn({ model: 'openai/gpt/4o-mini', costUsd: 0.001 })]
      })
    ]
    const stats = buildStats(conversations, 5, window)
    expect(stats.totalConversations).toBe(2)
    expect(stats.totalTurns).toBe(3)
    expect(stats.perModel['google/gemini-3-flash-preview']).toBe(2)
    expect(stats.perModel['openai/gpt/4o-mini']).toBe(1)
    expect(stats.totalCostUsd).toBeCloseTo(0.006, 6)
    expect(stats.excludedLoadTest.count).toBe(5)
  })

  it('computes latency percentiles (incl. interpolation) for a known set', () => {
    const turns = [0.5, 1, 1.5, 2, 10].map((latencySeconds) =>
      turn({ latencySeconds })
    )
    const stats = buildStats([conv({ turns })], 0, window)
    expect(stats.latencySeconds.count).toBe(5)
    expect(stats.latencySeconds.p50).toBeCloseTo(1.5, 6)
    // p95 rank = 0.95*(5-1) = 3.8 -> interp(2, 10, 0.8) = 8.4
    expect(stats.latencySeconds.p95).toBeCloseTo(8.4, 6)
    // p99 rank = 0.99*4 = 3.96 -> interp(2, 10, 0.96) = 9.68
    expect(stats.latencySeconds.p99).toBeCloseTo(9.68, 6)
    expect(stats.latencySeconds.max).toBe(10)
  })

  it('buckets turns with an unparseable startTime under "unknown" so perDay reconciles', () => {
    const turns = [
      turn({ startTime: '2026-05-10T00:00:00.000Z' }),
      turn({ startTime: '' })
    ]
    const stats = buildStats([conv({ turns })], 0, window)
    const perDayTotal = Object.values(stats.perDay).reduce(
      (sum, n) => sum + n,
      0
    )
    expect(perDayTotal).toBe(stats.totalTurns)
    expect(stats.perDay.unknown).toBe(1)
  })

  it('buckets a malformed (non-date) startTime under "unknown", not a bogus key', () => {
    const turns = [
      turn({ startTime: '2026-05-10T00:00:00.000Z' }),
      turn({ startTime: 'not-a-timestamp-string' })
    ]
    const stats = buildStats([conv({ turns })], 0, window)
    expect(stats.perDay.unknown).toBe(1)
    // 'not-a-timestamp-string'.slice(0, 10) === 'not-a-time' must not survive.
    expect(stats.perDay['not-a-time']).toBeUndefined()
  })

  it('excludes real-session single-turn conversations from top-questions', () => {
    const single = conv({
      sessionId: 'real-single',
      synthetic: false,
      turns: [turn({ userMessage: 'one-shot question' })]
    })
    const stats = buildStats([single], 0, window)
    expect(stats.topQuestionsIncludedConversations).toBe(0)
    expect(stats.topQuestions.map((q) => q.message)).not.toContain(
      'one-shot question'
    )
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

describe('buildStats perRegion (NES-1577)', () => {
  function multiTurn(
    sessionId: string,
    overrides: Partial<SanitisedConversation>
  ): SanitisedConversation {
    return conv({
      sessionId,
      synthetic: false,
      turns: [
        turn({ userMessage: 'Tell me about salvation' }),
        turn({ userMessage: 'and what about grace?' })
      ],
      ...overrides
    })
  }

  it('groups conversations by ipCountry and surfaces per-region top questions', () => {
    const conversations = [
      multiTurn('nz-1', {
        ipCountry: 'NZ',
        language: 'en',
        turns: [
          turn({ userMessage: 'How can I trust the Bible?' }),
          turn({ userMessage: 'Thanks' })
        ]
      }),
      multiTurn('nz-2', {
        ipCountry: 'NZ',
        language: 'en',
        turns: [
          turn({ userMessage: 'How can I trust the Bible?' }),
          turn({ userMessage: 'Tell me more' })
        ]
      }),
      multiTurn('mx-1', {
        ipCountry: 'MX',
        language: 'es',
        turns: [
          turn({ userMessage: '¿Cómo protejo a mi familia?' }),
          turn({ userMessage: 'Gracias' })
        ]
      })
    ]
    const stats = buildStats(conversations, 0, window)

    expect(Object.keys(stats.perRegion)).toEqual(['NZ', 'MX'])

    const nz = stats.perRegion.NZ
    expect(nz.conversations).toBe(2)
    expect(nz.realConversations).toBe(2)
    expect(nz.syntheticConversations).toBe(0)
    expect(nz.turns).toBe(4)
    expect(nz.multiTurn.count).toBe(2)
    expect(nz.multiTurn.share).toBeCloseTo(1.0, 6)
    expect(nz.perLanguage.en).toBe(4)
    expect(nz.topQuestions[0].message).toBe('How can I trust the Bible?')
    expect(nz.topQuestions[0].count).toBe(2)
    expect(nz.topQuestionsIncludedConversations).toBe(2)

    const mx = stats.perRegion.MX
    expect(mx.conversations).toBe(1)
    expect(mx.perLanguage.es).toBe(2)
    expect(mx.topQuestions[0].message).toBe('¿Cómo protejo a mi familia?')
  })

  it('orders regions by conversation count, breaking ties on country code', () => {
    const conversations = [
      multiTurn('us-1', { ipCountry: 'US' }),
      multiTurn('us-2', { ipCountry: 'US' }),
      multiTurn('za-1', { ipCountry: 'ZA' }),
      multiTurn('br-1', { ipCountry: 'BR' })
    ]
    const stats = buildStats(conversations, 0, window)
    // US has 2 conversations; BR and ZA each have 1 — BR wins the tie on
    // alphabetical country code.
    expect(Object.keys(stats.perRegion)).toEqual(['US', 'BR', 'ZA'])
  })

  it('uppercases the country key and buckets a missing one under "unknown"', () => {
    const conversations = [
      multiTurn('lower-1', { ipCountry: 'nz' }),
      // Missing/empty ipCountry should land under 'unknown' rather than ''.
      multiTurn('missing-1', { ipCountry: undefined }),
      multiTurn('empty-1', { ipCountry: '' })
    ]
    const stats = buildStats(conversations, 0, window)
    expect(stats.perRegion.NZ.conversations).toBe(1)
    expect(stats.perRegion.unknown.conversations).toBe(2)
  })

  it('counts the long-conversation threshold (> 5 turns, matching > 10 messages)', () => {
    const longTurns = Array.from(
      { length: LONG_CONVERSATION_TURNS + 1 },
      (_unused, index) => turn({ userMessage: `q${index}` })
    )
    const shortTurns = Array.from(
      { length: LONG_CONVERSATION_TURNS },
      (_unused, index) => turn({ userMessage: `q${index}` })
    )
    const conversations = [
      conv({
        sessionId: 'long-1',
        synthetic: false,
        ipCountry: 'NZ',
        turns: longTurns
      }),
      conv({
        sessionId: 'short-1',
        synthetic: false,
        ipCountry: 'NZ',
        turns: shortTurns
      })
    ]
    const stats = buildStats(conversations, 0, window)
    expect(stats.perRegion.NZ.longConversation.count).toBe(1)
    expect(stats.perRegion.NZ.longConversation.share).toBeCloseTo(0.5, 6)
  })

  it('caps per-region top questions at REGION_TOP_QUESTIONS', () => {
    const turns = (text: string): ConversationTurn[] => [
      turn({ userMessage: text }),
      turn({ userMessage: 'follow-up' })
    ]
    const conversations = Array.from(
      { length: REGION_TOP_QUESTIONS + 5 },
      (_unused, index) =>
        conv({
          sessionId: `nz-${index}`,
          synthetic: false,
          ipCountry: 'NZ',
          turns: turns(`distinct question ${index}`)
        })
    )
    const stats = buildStats(conversations, 0, window)
    expect(stats.perRegion.NZ.topQuestions.length).toBe(REGION_TOP_QUESTIONS)
  })

  it('separates real and synthetic conversations within a region', () => {
    const conversations = [
      conv({
        sessionId: 'real-1',
        synthetic: false,
        ipCountry: 'NZ',
        turns: [turn(), turn()]
      }),
      conv({
        sessionId: 'synth-1',
        synthetic: true,
        ipCountry: 'NZ',
        turns: [turn()]
      })
    ]
    const stats = buildStats(conversations, 0, window)
    const nz = stats.perRegion.NZ
    expect(nz.conversations).toBe(2)
    expect(nz.realConversations).toBe(1)
    expect(nz.syntheticConversations).toBe(1)
    // Multi-turn share denominates over all conversations in the region,
    // including the synthetic single-turn one.
    expect(nz.multiTurn.share).toBeCloseTo(0.5, 6)
  })

  it('emits an empty perRegion when there are no conversations', () => {
    const stats = buildStats([], 0, window)
    expect(stats.perRegion).toEqual({})
  })
})

describe('renderReport', () => {
  const sanitised = [
    conv({
      sessionId: 'real-1',
      synthetic: false,
      turns: [
        turn({ userMessage: 'What is the meaning of salvation?' }),
        turn()
      ]
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

  it('escapes ampersands, double quotes, and single quotes in excerpts', () => {
    const tricky = [
      conv({
        sessionId: 'q',
        synthetic: false,
        turns: [turn({ userMessage: `Q&A says "it's fine"` }), turn()]
      })
    ]
    const stats = buildStats(tricky, 0, window)
    const html = renderReport(stats, tricky, null)
    expect(html).toContain('Q&amp;A')
    expect(html).toContain('&quot;')
    expect(html).toContain('&#39;')
  })

  it('renders a distinct note for an empty themes array', () => {
    const stats = buildStats(sanitised, 0, window)
    const html = renderReport(stats, sanitised, { themes: [] })
    expect(html).toMatch(/No themes were produced/i)
  })

  describe('long-message handling', () => {
    it('truncates over-long user messages with an ellipsis and never writes the full string', () => {
      const long = 'a'.repeat(500)
      const conversations = [
        conv({
          sessionId: 'noise',
          synthetic: false,
          turns: [
            turn({ userMessage: long }),
            turn({ userMessage: 'follow-up' })
          ]
        })
      ]
      const stats = buildStats(conversations, 0, window)
      const html = renderReport(stats, conversations, null)
      // The raw 500-char run never appears verbatim in the HTML.
      expect(html).not.toContain(long)
      // A truncated run of 'a' ends with the ellipsis marker.
      expect(html).toMatch(/a{50,250}…/)
    })

    it('wraps user-attributed text in the clamp container at every render site', () => {
      const stats = buildStats(sanitised, 0, window)
      const html = renderReport(stats, sanitised, {
        themes: [{ label: 'Salvation', sessionIds: ['real-1'] }]
      })
      // Global top-questions cell.
      expect(html).toContain(
        '<td><div class="clamp">What is the meaning of salvation?</div></td>'
      )
      // Theme excerpt list item.
      expect(html).toContain(
        '<li><div class="clamp">What is the meaning of salvation?</div></li>'
      )
    })

    it('wraps the degradation-path flat sample in the clamp container too', () => {
      const stats = buildStats(sanitised, 0, window)
      const html = renderReport(stats, sanitised, null)
      // null themes -> flat sample fallback under the AI-grouped themes section.
      expect(html).toContain(
        '<li><div class="clamp">What is the meaning of salvation?</div></li>'
      )
    })
  })

  describe('per-region section (NES-1577)', () => {
    const multiCountry: SanitisedConversation[] = [
      conv({
        sessionId: 'nz-1',
        synthetic: false,
        ipCountry: 'NZ',
        language: 'en',
        turns: [
          turn({ userMessage: 'How can I trust the Bible?' }),
          turn({ userMessage: 'Tell me more' })
        ]
      }),
      conv({
        sessionId: 'nz-2',
        synthetic: false,
        ipCountry: 'NZ',
        language: 'en',
        turns: [
          turn({ userMessage: 'How can I trust the Bible?' }),
          turn({ userMessage: 'Thanks' })
        ]
      }),
      conv({
        sessionId: 'mx-1',
        synthetic: false,
        ipCountry: 'MX',
        language: 'es',
        turns: [
          turn({ userMessage: '¿Cómo protejo a mi familia?' }),
          turn({ userMessage: 'Gracias' })
        ]
      })
    ]

    it('renders one card per country with country-specific top questions', () => {
      const stats = buildStats(multiCountry, 0, window)
      const html = renderReport(stats, multiCountry, null)
      expect(html).toContain('By region')
      // Both countries appear as headings in their cards.
      expect(html).toMatch(/<h3>NZ\b/)
      expect(html).toMatch(/<h3>MX\b/)
      // Per-region top questions render verbatim.
      expect(html).toContain('How can I trust the Bible?')
      expect(html).toContain('¿Cómo protejo a mi familia?')
      // The long-conversation data label uses the >10 messages threshold
      // (rendered HTML-escaped) — every region card carries it.
      expect(html).toMatch(/Long \(&gt;10 messages\)/)
    })

    it('annotates themes with a per-country geo breakdown', () => {
      const stats = buildStats(multiCountry, 0, window)
      const themes = {
        themes: [{ label: 'Salvation', sessionIds: ['nz-1', 'nz-2', 'mx-1'] }]
      }
      const html = renderReport(stats, multiCountry, themes)
      // Geo annotation: NZ ×2 · MX ×1 (dominant country first).
      expect(html).toMatch(/Geo:\s*NZ\s*&times;2.*MX\s*&times;1/)
    })

    it('shows a "no regional signals" note when conversations are empty', () => {
      const stats = buildStats([], 0, window)
      const html = renderReport(stats, [], null)
      expect(html).toContain('No regional signals in this window.')
    })
  })
})
