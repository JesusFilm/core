import { normalize } from '../pipeline/normalize'

import { fetchTraceData, mapObservation, mapTrace } from './langfuse'

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

describe('v4 observations HTTP contract', () => {
  const client = {
    baseUrl: 'https://offline.invalid',
    authHeader: 'Basic synthetic'
  }
  const window = {
    from: new Date('2026-10-01T00:00:00Z'),
    to: new Date('2026-10-02T00:00:00Z')
  }
  const fetchMock = vi.fn<typeof fetch>()
  const generation = {
    id: 'g1',
    traceId: 't1',
    type: 'GENERATION',
    sessionId: 's1',
    startTime: '2026-10-01T01:00:00Z',
    endTime: '2026-10-01T01:00:01Z',
    environment: 'production',
    metadata: { journeyId: 'j1', ipCountry: 'NZ', language: 'es' },
    tags: ['synthetic'],
    model: 'offline-model',
    input: JSON.stringify([{ role: 'user', content: 'synthetic question' }]),
    output: JSON.stringify('synthetic answer'),
    usageDetails: { input: 5, output: 3, total: 8 },
    totalCost: 0.001,
    latency: 1
  }
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })
  function page(data: unknown[], cursor: string | null = null): Response {
    return new Response(JSON.stringify({ data, meta: { cursor } }))
  }

  it('requests all required fields, follows cursors and reconstructs session context without legacy reads', async () => {
    fetchMock
      .mockResolvedValueOnce(page([generation], 'page-2'))
      .mockResolvedValueOnce(page([], 'page-3'))
      .mockResolvedValueOnce(
        page([
          generation, // duplicate pages must not inflate token/cost totals
          {
            ...generation,
            id: 'g2',
            traceId: 't2',
            startTime: '2026-10-01T02:00:00Z'
          },
          { ...generation, id: 'preview', environment: 'preview' },
          { ...generation, id: 'span', type: 'SPAN' },
          { ...generation, id: 'missing-trace', traceId: null }
        ])
      )
      .mockResolvedValueOnce(page([generation]))
      .mockResolvedValueOnce(page([{ ...generation, id: 'g2', traceId: 't2' }]))
    const data = await fetchTraceData(client, window, {
      throttleMs: 0,
      pageSize: 50,
      environment: 'production'
    })
    expect(data.traces).toHaveLength(2)
    expect(data.observations).toHaveLength(2)
    expect(data.traces[0]).toMatchObject({
      id: 't1',
      sessionId: 's1',
      ipCountry: 'NZ',
      language: 'es',
      journeyId: 'j1',
      tags: ['synthetic']
    })
    expect(data.observations[0]).toMatchObject({
      inputRaw: [{ role: 'user', content: 'synthetic question' }],
      outputRaw: 'synthetic answer',
      inputTokens: 5,
      outputTokens: 3,
      totalTokens: 8,
      costUsd: 0.001,
      latencySeconds: 1
    })
    expect(fetchMock).toHaveBeenCalledTimes(5)
    for (const [url, options] of fetchMock.mock.calls) {
      const parsed = new URL(String(url))
      expect(parsed.pathname).toBe('/api/public/v2/observations')
      if (parsed.searchParams.has('traceId')) {
        expect(parsed.searchParams.get('fields')).toBe(
          'core,basic,io,metadata,model,usage,metrics,trace_context'
        )
        expect(parsed.searchParams.get('expandMetadata')).toBe(
          'journeyId,ipCountry,language,provider,modelId'
        )
        expect(parsed.searchParams.has('fromStartTime')).toBe(false)
        expect(parsed.searchParams.has('toStartTime')).toBe(false)
        expect(parsed.searchParams.has('type')).toBe(false)
      } else {
        expect(Object.fromEntries(parsed.searchParams)).toMatchObject({
          fields: 'core,basic',
          type: 'GENERATION',
          fromStartTime: window.from.toISOString(),
          toStartTime: window.to.toISOString(),
          environment: 'production',
          limit: '50'
        })
      }
      expect(parsed.searchParams.has('parseIoAsJson')).toBe(false)
      expect(options?.headers).toMatchObject({
        Authorization: 'Basic synthetic'
      })
    }
    expect(
      new URL(String(fetchMock.mock.calls[1][0])).searchParams.get('cursor')
    ).toBe('page-2')
    expect(
      new URL(String(fetchMock.mock.calls[2][0])).searchParams.get('cursor')
    ).toBe('page-3')
  })

  it('keeps untagged observations when all environments are requested', async () => {
    fetchMock.mockImplementation(async () =>
      page([{ ...generation, environment: undefined, sessionId: null }])
    )
    const data = await fetchTraceData(client, window, { throttleMs: 0 })
    expect(data.traces[0]).toMatchObject({ sessionId: null, environment: null })
    expect(
      new URL(String(fetchMock.mock.calls[0][0])).searchParams.has(
        'environment'
      )
    ).toBe(false)
  })

  it('rejects repeated cursors rather than publishing an incomplete dataset', async () => {
    fetchMock.mockImplementation(async () => page([generation], 'same'))
    await expect(
      fetchTraceData(client, window, { throttleMs: 0 })
    ).rejects.toThrow('repeated a cursor')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('rejects malformed responses rather than treating missing data as an empty export', async () => {
    fetchMock.mockResolvedValue(new Response('{}'))
    await expect(fetchTraceData(client, window)).rejects.toThrow('missing data')
  })

  it('retries a transient HTTP failure and retains the exact bounded query', async () => {
    vi.useFakeTimers()
    fetchMock
      .mockResolvedValueOnce(new Response('busy', { status: 429 }))
      .mockImplementation(async () => page([generation]))
    const result = fetchTraceData(client, window, { throttleMs: 0 })
    await vi.runAllTimersAsync()
    expect((await result).observations).toHaveLength(1)
    expect(fetchMock.mock.calls[0]).toEqual(fetchMock.mock.calls[1])
  })

  it('fails immediately on authentication errors without fallback to deprecated endpoints', async () => {
    fetchMock.mockResolvedValue(new Response('unauthorized', { status: 401 }))
    await expect(fetchTraceData(client, window)).rejects.toThrow('Langfuse 401')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('decodes JSON IO and metadata while preserving plain or numeric text replies and zero totals', () => {
    expect(
      mapObservation({
        ...generation,
        output: '42',
        inputUsage: 0,
        outputUsage: 0,
        totalUsage: 0,
        totalCost: 0
      })
    ).toMatchObject({
      outputRaw: '42',
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      costUsd: 0
    })
    expect(mapObservation({ output: 'plain reply' }).outputRaw).toBe(
      'plain reply'
    )
    expect(mapObservation({ output: '{broken json' }).outputRaw).toBe(
      '{broken json'
    )
    expect(
      mapTrace({ metadata: JSON.stringify({ ipCountry: 'NZ' }) }).ipCountry
    ).toBe('NZ')
  })

  it('recovers trace metadata from a root observation before applying journey exclusions', async () => {
    const root = {
      ...generation,
      id: 'root',
      type: 'SPAN',
      parentObservationId: null,
      startTime: '2026-10-01T00:59:59Z'
    }
    const legacy = { ...generation, metadata: {}, parentObservationId: 'root' }
    fetchMock
      .mockResolvedValueOnce(page([legacy]))
      .mockResolvedValueOnce(page([legacy, root]))
    const data = await fetchTraceData(client, window, { throttleMs: 0 })
    const included = normalize(data.traces, data.observations)
    expect(included.conversations[0]).toMatchObject({
      journeyId: 'j1',
      language: 'es',
      ipCountry: 'NZ',
      sessionId: 's1'
    })
    const excluded = normalize(data.traces, data.observations, {
      excludeJourneyIds: new Set(['j1'])
    })
    expect(excluded.excludedTurnCount).toBe(1)
    expect(excluded.conversations).toEqual([])
  })

  it('stops a historical export explicitly when trace-only metadata has no v2 root to recover', async () => {
    const legacy = {
      ...generation,
      metadata: {},
      parentObservationId: 'missing-root'
    }
    fetchMock.mockImplementation(async () => page([legacy]))
    await expect(
      fetchTraceData(client, window, { throttleMs: 0 })
    ).rejects.toThrow('no recoverable root or consistent generation context')
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(
      fetchMock.mock.calls.every(
        ([url]) =>
          new URL(String(url)).pathname === '/api/public/v2/observations'
      )
    ).toBe(true)
  })

  it('allows a recovered, genuinely untagged historical root with empty metadata', async () => {
    const root = {
      ...generation,
      id: 'root-untagged',
      type: 'SPAN',
      isRootObservation: true,
      metadata: {},
      tags: [],
      sessionId: null
    }
    const legacy = {
      ...generation,
      metadata: {},
      parentObservationId: 'root-untagged'
    }
    fetchMock
      .mockResolvedValueOnce(page([legacy]))
      .mockResolvedValueOnce(page([legacy, root]))
    const data = await fetchTraceData(client, window, { throttleMs: 0 })
    const normalized = normalize(data.traces, data.observations, {
      excludeJourneyIds: new Set(['j1']),
      excludeTags: new Set(['synthetic'])
    })
    expect(normalized.excludedTurnCount).toBe(0)
    expect(normalized.conversations).toHaveLength(1)
    expect(normalized.conversations[0]).toMatchObject({
      synthetic: true,
      tags: []
    })
    expect(normalized.conversations[0].journeyId).toBeUndefined()
    expect(normalized.conversations[0].turns[0].assistantReply).toBe(
      'synthetic answer'
    )
  })

  it('refuses competing roots instead of attributing a child of B to earlier root A', async () => {
    const rootA = {
      ...generation,
      id: 'root-a',
      type: 'SPAN',
      parentObservationId: '',
      startTime: '2026-09-30T23:59:00Z',
      metadata: { journeyId: 'ordinary-journey' }
    }
    const rootB = {
      ...rootA,
      id: 'root-b',
      startTime: generation.startTime,
      metadata: { journeyId: 'excluded-journey' }
    }
    const child = {
      ...generation,
      parentObservationId: 'root-b',
      metadata: rootB.metadata
    }
    fetchMock
      .mockResolvedValueOnce(page([child]))
      .mockResolvedValueOnce(page([child, rootB, rootA]))
    await expect(
      fetchTraceData(client, window, { throttleMs: 0 })
    ).rejects.toThrow('trace t1 has ambiguous root context (2 root candidates)')
  })

  it.each([undefined, null, 'malformed', []])(
    'recovers generation exclusions when root metadata is invalid: %j',
    async (metadata) => {
      const root = {
        ...generation,
        id: 'invalid-root',
        type: 'SPAN',
        isRootObservation: true,
        metadata,
        tags: []
      }
      const child = { ...generation, parentObservationId: root.id }
      fetchMock
        .mockResolvedValueOnce(page([child]))
        .mockResolvedValueOnce(page([root, child]))
      const data = await fetchTraceData(client, window, { throttleMs: 0 })
      expect(data.traces[0]).toMatchObject({
        journeyId: 'j1',
        ipCountry: 'NZ',
        language: 'es',
        tags: ['synthetic']
      })
      for (const exclusions of [
        { excludeJourneyIds: new Set(['j1']) },
        { excludeTags: new Set(['synthetic']) }
      ]) {
        const result = normalize(data.traces, data.observations, exclusions)
        expect(result.excludedTurnCount).toBe(1)
        expect(result.conversations).toEqual([])
      }
    }
  )

  it('stops when root metadata is missing and generation context cannot recover it', async () => {
    const root = {
      ...generation,
      id: 'invalid-root',
      type: 'SPAN',
      isRootObservation: true,
      metadata: undefined
    }
    const child = { ...generation, parentObservationId: root.id, metadata: {} }
    fetchMock
      .mockResolvedValueOnce(page([child]))
      .mockResolvedValueOnce(page([root, child]))
    await expect(
      fetchTraceData(client, window, { throttleMs: 0 })
    ).rejects.toThrow('no recoverable root or consistent generation context')
  })

  it('refuses conflicting generation context without an authoritative root', async () => {
    fetchMock.mockResolvedValueOnce(page([generation])).mockResolvedValueOnce(
      page([
        generation,
        {
          ...generation,
          id: 'different',
          metadata: { ...generation.metadata, journeyId: 'another-journey' }
        }
      ])
    )
    await expect(
      fetchTraceData(client, window, { throttleMs: 0 })
    ).rejects.toThrow('no recoverable root or consistent generation context')
  })

  it('retains every generation of an in-window trace, including earlier and later turns across detail pages', async () => {
    const earlier = {
      ...generation,
      id: 'early',
      startTime: '2026-09-30T23:59:00Z',
      input: JSON.stringify([{ role: 'user', content: 'original subject' }])
    }
    const later = {
      ...generation,
      id: 'late',
      startTime: '2026-10-02T00:01:00Z'
    }
    fetchMock
      .mockResolvedValueOnce(page([generation]))
      .mockResolvedValueOnce(page([later, generation], 'older'))
      .mockResolvedValueOnce(page([earlier]))
    const data = await fetchTraceData(client, window, { throttleMs: 0 })
    const normalized = normalize(data.traces, data.observations)
    expect(normalized.conversations).toHaveLength(1)
    const turns = normalized.conversations[0].turns
    expect(turns.map((turn) => turn.observationId)).toEqual([
      'early',
      'g1',
      'late'
    ])
    expect(turns[0].userMessage).toBe('original subject')
    expect(turns.reduce((sum, turn) => sum + (turn.totalTokens ?? 0), 0)).toBe(
      24
    )
    expect(
      turns.reduce((sum, turn) => sum + (turn.costUsd ?? 0), 0)
    ).toBeCloseTo(0.003)
    for (const [url] of fetchMock.mock.calls.slice(1)) {
      const params = new URL(String(url)).searchParams
      expect(params.get('traceId')).toBe('t1')
      expect(params.has('fromStartTime')).toBe(false)
      expect(params.has('toStartTime')).toBe(false)
    }
  })

  it.each([
    ['[1,2]', '[1,2]'],
    ['{"answer":"Yes"}', '{"answer":"Yes"}'],
    ['42', '42'],
    ['true', 'true'],
    ['"quoted reply"', 'quoted reply'],
    ['""', ''],
    ['[{"type":"text","text":"parts reply"}]', 'parts reply'],
    ['{"content":"object reply"}', 'object reply'],
    ['plain text', 'plain text']
  ])(
    'preserves assistant output %s through mapping and conversation normalization',
    (output, expected) => {
      const observation = mapObservation({ ...generation, output })
      const result = normalize(
        [mapTrace({ ...generation, id: 't1' })],
        [observation]
      )
      expect(result.conversations[0].turns[0].assistantReply).toBe(expected)
    }
  )
})
