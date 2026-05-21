import {
  DEFAULT_LOAD_TEST_REGEX,
  extractAssistantReply,
  extractLatestUserMessage,
  normalize
} from './normalize'
import type { ObservationRecord, TraceRecord } from '../types'

function trace(overrides: Partial<TraceRecord> = {}): TraceRecord {
  return {
    id: 't1',
    sessionId: 's1',
    timestamp: '2026-05-19T00:00:00.000Z',
    metadata: {},
    tags: [],
    ...overrides
  }
}

function observation(overrides: Partial<ObservationRecord> = {}): ObservationRecord {
  return {
    id: 'o1',
    traceId: 't1',
    type: 'GENERATION',
    model: 'google/gemini-3-flash-preview',
    startTime: '2026-05-19T00:00:00.000Z',
    endTime: '2026-05-19T00:00:01.000Z',
    latencySeconds: 0.9,
    inputRaw: [{ role: 'user', content: [{ type: 'text', text: 'hello' }] }],
    outputRaw: 'hi there',
    inputTokens: 10,
    outputTokens: 3,
    totalTokens: 13,
    costUsd: 0.0001,
    ...overrides
  }
}

describe('extractLatestUserMessage', () => {
  it('reads the last user text from a content-parts array', () => {
    const input = [
      { role: 'user', content: [{ type: 'text', text: 'first' }] },
      { role: 'assistant', content: 'reply' },
      { role: 'user', content: [{ type: 'text', text: 'latest question' }] }
    ]
    expect(extractLatestUserMessage(input)).toBe('latest question')
  })

  it('reads the last user text from string-content (ModelMessage) shape', () => {
    const input = [
      { role: 'user', content: 'an earlier turn' },
      { role: 'assistant', content: 'reply' },
      { role: 'user', content: 'the newest turn' }
    ]
    expect(extractLatestUserMessage(input)).toBe('the newest turn')
  })

  it('returns empty string for empty input without throwing', () => {
    expect(extractLatestUserMessage([])).toBe('')
    expect(extractLatestUserMessage(undefined)).toBe('')
  })

  it('returns empty string (never assistant/system text) when no user role is present', () => {
    const input = [
      { role: 'system', content: 'you are a helpful assistant' },
      { role: 'assistant', content: 'how can I help?' }
    ]
    expect(extractLatestUserMessage(input)).toBe('')
  })
})

describe('extractAssistantReply', () => {
  it('reads a plain string output', () => {
    expect(extractAssistantReply('the answer')).toBe('the answer')
  })

  it('reads from a content-parts output object', () => {
    expect(
      extractAssistantReply({ content: [{ type: 'text', text: 'parted' }] })
    ).toBe('parted')
  })

  it('returns empty string for missing output', () => {
    expect(extractAssistantReply(undefined)).toBe('')
  })
})

describe('normalize', () => {
  it('groups two traces sharing a sessionId into one ordered conversation', () => {
    const traces = [
      trace({ id: 't1', sessionId: 's1' }),
      trace({ id: 't2', sessionId: 's1' })
    ]
    const observations = [
      observation({
        id: 'o2',
        traceId: 't2',
        startTime: '2026-05-19T00:05:00.000Z',
        inputRaw: [{ role: 'user', content: 'second' }]
      }),
      observation({
        id: 'o1',
        traceId: 't1',
        startTime: '2026-05-19T00:00:00.000Z',
        inputRaw: [{ role: 'user', content: 'first' }]
      })
    ]
    const { conversations } = normalize(traces, observations)
    expect(conversations).toHaveLength(1)
    const turns = conversations[0].turns
    expect(turns.map((t) => t.userMessage)).toEqual(['first', 'second'])
    expect(conversations[0].synthetic).toBe(false)
  })

  it('keeps an orphan observation (missing trace) as a synthetic single-turn conversation', () => {
    const observations = [observation({ id: 'o9', traceId: 'missing' })]
    const { conversations } = normalize([], observations)
    expect(conversations).toHaveLength(1)
    expect(conversations[0].synthetic).toBe(true)
    expect(conversations[0].turns).toHaveLength(1)
  })

  it('does not collapse distinct null-session traces together', () => {
    const traces = [
      trace({ id: 't1', sessionId: null }),
      trace({ id: 't2', sessionId: null })
    ]
    const observations = [
      observation({ id: 'o1', traceId: 't1' }),
      observation({ id: 'o2', traceId: 't2' })
    ]
    const { conversations } = normalize(traces, observations)
    expect(conversations).toHaveLength(2)
    expect(conversations.every((c) => c.synthetic)).toBe(true)
  })

  it('carries trace metadata (ipCountry/journeyId/language/tags) onto the conversation', () => {
    const traces = [
      trace({
        id: 't1',
        sessionId: 's1',
        ipCountry: 'NZ',
        journeyId: 'j1',
        language: 'en',
        tags: ['apologist-chat']
      })
    ]
    const { conversations } = normalize(traces, [observation()])
    expect(conversations[0]).toMatchObject({
      ipCountry: 'NZ',
      journeyId: 'j1',
      language: 'en',
      tags: ['apologist-chat']
    })
  })

  it('excludes load-test turns via the message regex and counts them', () => {
    const observations = [
      observation({
        id: 'o1',
        traceId: 't1',
        inputRaw: [{ role: 'user', content: 'load test concurrent client' }]
      }),
      observation({
        id: 'o2',
        traceId: 't2',
        inputRaw: [{ role: 'user', content: 'what is a christian?' }]
      })
    ]
    const traces = [
      trace({ id: 't1', sessionId: null }),
      trace({ id: 't2', sessionId: null })
    ]
    const { conversations, excludedTurnCount } = normalize(traces, observations, {
      excludeMessageRegex: DEFAULT_LOAD_TEST_REGEX
    })
    expect(excludedTurnCount).toBe(1)
    expect(conversations).toHaveLength(1)
    expect(conversations[0].turns[0].userMessage).toBe('what is a christian?')
  })

  it('excludes turns whose trace journeyId is in the exclude set', () => {
    const traces = [trace({ id: 't1', sessionId: 's1', journeyId: 'load-journey' })]
    const { conversations, excludedTurnCount } = normalize(traces, [observation()], {
      excludeJourneyIds: new Set(['load-journey'])
    })
    expect(excludedTurnCount).toBe(1)
    expect(conversations).toHaveLength(0)
  })

  it('produces empty-string fields for empty input / missing output without throwing', () => {
    const observations = [
      observation({ inputRaw: [], outputRaw: undefined })
    ]
    const { conversations } = normalize([trace()], observations)
    expect(conversations[0].turns[0].userMessage).toBe('')
    expect(conversations[0].turns[0].assistantReply).toBe('')
  })

  it('does not collapse distinct id-less orphan observations into one conversation', () => {
    const observations = [
      observation({ id: '', traceId: 'missing-a' }),
      observation({ id: '', traceId: 'missing-b' })
    ]
    const { conversations } = normalize([], observations)
    expect(conversations).toHaveLength(2)
  })

  it('default load-test regex does not match unrelated messages', () => {
    const observations = [
      observation({ id: 'o1', traceId: 't1', inputRaw: [{ role: 'user', content: 'load factor in beam design' }] })
    ]
    const { conversations, excludedTurnCount } = normalize([trace({ id: 't1', sessionId: null })], observations, {
      excludeMessageRegex: DEFAULT_LOAD_TEST_REGEX
    })
    expect(excludedTurnCount).toBe(0)
    expect(conversations).toHaveLength(1)
  })
})
