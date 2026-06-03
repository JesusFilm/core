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

  it('reads the deployment environment when tagged (NES-1688)', () => {
    expect(
      mapTrace({ id: 't', environment: 'production', metadata: {}, tags: [] })
        .environment
    ).toBe('production')
  })

  it('maps a missing or empty environment to null (pre-NES-1688 untagged traces)', () => {
    expect(mapTrace({ id: 't', metadata: {}, tags: [] }).environment).toBeNull()
    expect(
      mapTrace({ id: 't', environment: '', metadata: {}, tags: [] }).environment
    ).toBeNull()
  })

  // NES-1577 follow-up: production traces have been observed carrying
  // `journeyId` as a number rather than the string the chat zod schema
  // declares. Surface coerced values so the export attributes the trace
  // instead of silently dropping the field.
  it('coerces a numeric journeyId to a string so non-string types surface', () => {
    const result = mapTrace({
      id: 't',
      metadata: { journeyId: 1, ipCountry: 'NZ', language: 'en' },
      tags: []
    })
    expect(result.journeyId).toBe('1')
    expect(result.ipCountry).toBe('NZ')
  })

  it('drops NaN/Infinity rather than rendering "NaN" as a journey id', () => {
    const result = mapTrace({
      id: 't',
      metadata: { journeyId: Number.NaN },
      tags: []
    })
    expect(result.journeyId).toBeUndefined()
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
