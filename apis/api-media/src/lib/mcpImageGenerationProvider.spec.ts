import sharp from 'sharp'

import { cloudflareGenerationProvider } from './mcpImageGenerationProvider'

describe('credential-owning generation adapter', () => {
  afterEach(() => vi.unstubAllGlobals())

  const provider = () =>
    cloudflareGenerationProvider({
      CLOUDFLARE_ACCOUNT_ID: 'controlled-account',
      CLOUDFLARE_IMAGES_TOKEN: 'images-credential-sentinel',
      CLOUDFLARE_WORKERS_AI_TOKEN: 'ai-credential-sentinel'
    })
  const image = () =>
    sharp({ create: { width: 4, height: 3, channels: 3, background: 'red' } })
      .jpeg()
      .toBuffer()
  const details = () =>
    Response.json({
      success: true,
      result: { id: 'persisted-id', uploaded: '2026-11-25T00:00:00Z' }
    })

  it('generates once, validates bytes and uploads the persisted identity, then recovers authenticated original-image metadata', async () => {
    const bytes = await image()
    const calls: Array<{ url: string; init?: RequestInit }> = []
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      calls.push({ url, init })
      if (url.includes('/ai/run/'))
        return Response.json({
          success: true,
          result: { image: bytes.toString('base64') }
        })
      if (url.endsWith('/blob')) return new Response(new Uint8Array(bytes))
      return details()
    })
    const adapter = provider()
    expect(
      await adapter.dispatch('persisted-id', 'private-prompt-sentinel')
    ).toBe('ready')
    expect(typeof calls[0].init?.body).toBe('string')
    expect(JSON.parse(calls[0].init?.body as string)).toEqual({
      prompt: 'private-prompt-sentinel'
    })
    expect(calls[1].init?.body).toBeInstanceOf(FormData)
    expect((calls[1].init?.body as FormData).get('id')).toBe('persisted-id')
    expect(await adapter.status('persisted-id')).toMatchObject({
      state: 'ready',
      metadata: { width: 4, height: 3, blurhash: expect.any(String) }
    })
    expect(calls.filter((c) => c.url.includes('/ai/run/'))).toHaveLength(1)
    expect(calls.slice(2).every((c) => c.init?.method !== 'POST')).toBe(true)
    expect(
      calls.every((c) => c.init?.redirect === 'error' && c.init?.signal)
    ).toBe(true)
  })

  it.each([401, 403, 413, 415])(
    'records qualified refusal %i and never uploads',
    async (status) => {
      let calls = 0
      vi.stubGlobal('fetch', async () => {
        calls++
        return Response.json(
          {
            success: false,
            result: null,
            errors: [{ code: 10000, message: 'private-prompt-sentinel' }]
          },
          { status }
        )
      })
      expect(
        await provider().dispatch('persisted-id', 'private-prompt-sentinel')
      ).toBe('rejected')
      expect(calls).toBe(1)
    }
  )

  it.each([
    'network',
    'server',
    'invalid-image',
    'invalid-json',
    'contradictory-rejection'
  ])('keeps %s ambiguous and redacts raw failures', async (failure) => {
    let calls = 0
    vi.stubGlobal('fetch', async () => {
      calls++
      if (failure === 'network')
        throw new Error('private-prompt-sentinel ai-credential-sentinel')
      if (failure === 'server')
        return new Response('private-prompt-sentinel', { status: 503 })
      if (failure === 'invalid-json')
        return new Response('private-prompt-sentinel')
      if (failure === 'contradictory-rejection')
        return Response.json(
          {
            success: false,
            result: { id: 'persisted-id' },
            errors: [{ code: 1 }]
          },
          { status: 403 }
        )
      return Response.json({
        success: true,
        result: { image: Buffer.from('invalid').toString('base64') }
      })
    })
    await expect(
      provider().dispatch('persisted-id', 'private-prompt-sentinel')
    ).rejects.toThrow('Generation handoff unresolved')
    expect(calls).toBe(1)
  })

  it('never repeats generation after a lost upload response and recovers only the known asset', async () => {
    const bytes = await image()
    let generations = 0
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      if (url.includes('/ai/run/')) {
        generations++
        return Response.json({
          success: true,
          result: { image: bytes.toString('base64') }
        })
      }
      if (init?.method === 'POST') throw new Error('images-credential-sentinel')
      if (url.endsWith('/blob')) return new Response(new Uint8Array(bytes))
      return details()
    })
    const adapter = provider()
    await expect(adapter.dispatch('persisted-id', 'prompt')).rejects.toThrow(
      'Generation handoff unresolved'
    )
    expect(await adapter.status('persisted-id')).toMatchObject({
      state: 'ready'
    })
    expect(generations).toBe(1)
  })

  it.each([
    'missing',
    'processing',
    'blob-denied',
    'oversized',
    'broken-blob',
    'status-unavailable'
  ])('does not fabricate readiness from %s', async (outcome) => {
    vi.stubGlobal('fetch', async (url: string) => {
      if (outcome === 'status-unavailable')
        throw new Error('ai-credential-sentinel')
      if (outcome === 'missing') return new Response(null, { status: 404 })
      if (outcome === 'processing')
        return Response.json({
          success: true,
          result: { id: 'persisted-id', draft: true }
        })
      if (!url.endsWith('/blob')) return details()
      if (outcome === 'blob-denied') return new Response(null, { status: 403 })
      return new Response(
        outcome === 'oversized'
          ? new Uint8Array(10_000_001)
          : new Uint8Array([0])
      )
    })
    expect(await provider().status('persisted-id')).toBe(
      outcome === 'processing' ? 'processing' : 'unknown'
    )
  })
})
