import { mapObservation, mapTrace } from './langfuse'

describe('mapTrace', () => {
  it('extracts ipCountry/journeyId/language from metadata and keeps string tags', () => {
    const result = mapTrace({
      id: 't1',
      sessionId: 's1',
      timestamp: '2026-05-19T00:00:00.000Z',
      metadata: { ipCountry: 'NZ', journeyId: 'j1', language: 'en', other: 5 },
      tags: ['apologist-chat', 42, 'world-cup']
    })
    expect(result).toMatchObject({
      id: 't1',
      sessionId: 's1',
      ipCountry: 'NZ',
      journeyId: 'j1',
      language: 'en',
      tags: ['apologist-chat', 'world-cup']
    })
  })

  it('treats an empty sessionId as null and passes the ISO timestamp through', () => {
    const result = mapTrace({
      id: 't2',
      sessionId: '',
      timestamp: '2026-05-19T12:00:00.000Z',
      metadata: {},
      tags: []
    })
    expect(result.sessionId).toBeNull()
    expect(result.timestamp).toBe('2026-05-19T12:00:00.000Z')
    expect(result.ipCountry).toBeUndefined()
  })
})

describe('mapObservation', () => {
  it('maps usageDetails input/output/total to token fields', () => {
    const result = mapObservation({
      id: 'o1',
      traceId: 't1',
      type: 'GENERATION',
      model: 'google/gemini-3-flash-preview',
      startTime: '2026-05-19T00:00:00.000Z',
      endTime: '2026-05-19T00:00:01.000Z',
      latency: 0.9,
      input: [{ role: 'user', content: 'hi' }],
      output: 'hello',
      usageDetails: { input: 1701, output: 42, total: 1743 },
      calculatedTotalCost: 0.0009765
    })
    expect(result).toMatchObject({
      inputTokens: 1701,
      outputTokens: 42,
      totalTokens: 1743,
      costUsd: 0.0009765,
      latencySeconds: 0.9
    })
  })

  it('falls back to usage when usageDetails is absent, and totalCost when calculatedTotalCost is absent', () => {
    const result = mapObservation({
      id: 'o2',
      traceId: 't1',
      type: 'GENERATION',
      usage: { input: 10, output: 3, total: 13 },
      totalCost: 0.0001
    })
    expect(result.inputTokens).toBe(10)
    expect(result.totalTokens).toBe(13)
    expect(result.costUsd).toBe(0.0001)
  })

  it('yields nulls and empty strings for missing fields without throwing', () => {
    const result = mapObservation({})
    expect(result.id).toBe('')
    expect(result.traceId).toBe('')
    expect(result.model).toBeNull()
    expect(result.inputTokens).toBeNull()
    expect(result.costUsd).toBeNull()
    expect(result.endTime).toBeNull()
  })
})
