import sharp from 'sharp'

import { cloudflareUploadProvider } from './mcpImageProvider'
import { imageHash, validateImageInput } from './mcpImageInput'

const file = (bytes: Buffer, mime = 'image/png', name = 'fixture.png') => ({
  name,
  mime: mime as 'image/png',
  size: bytes.length,
  sha256: imageHash(bytes)
})
afterEach(() => vi.unstubAllGlobals())
describe('trusted image content validation', () => {
  it.each(['png', 'jpeg', 'webp', 'gif'] as const)(
    'decodes actual %s bytes and derives image metadata',
    async (format) => {
      const bytes = await sharp({
        create: { width: 4, height: 3, channels: 3, background: 'red' }
      })
        .toFormat(format)
        .toBuffer()
      const metadata = await validateImageInput(
        bytes,
        file(bytes, `image/${format}`, `fixture.${format}`)
      )
      expect(metadata).toMatchObject({ width: 4, height: 3 })
      expect(metadata.blurhash).toHaveLength(36)
    }
  )
  it('rejects false hashes, format declarations, unsupported decoded content and oversized dimensions', async () => {
    const bytes = await sharp({
      create: { width: 4, height: 3, channels: 3, background: 'red' }
    })
      .png()
      .toBuffer()
    await expect(
      validateImageInput(bytes, { ...file(bytes), sha256: '0'.repeat(64) })
    ).rejects.toThrow()
    await expect(
      validateImageInput(bytes, file(bytes, 'image/jpeg', 'fixture.jpg'))
    ).rejects.toThrow()
    await expect(
      validateImageInput(bytes, file(bytes, 'image/png', 'fixture.gif'))
    ).rejects.toThrow()
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="3"><rect width="4" height="3"/></svg>'
    )
    await expect(validateImageInput(svg, file(svg))).rejects.toThrow()
    const wide = await sharp({
      create: { width: 12001, height: 1, channels: 3, background: 'red' }
    })
      .png()
      .toBuffer()
    await expect(validateImageInput(wide, file(wide))).rejects.toThrow()
    await expect(
      validateImageInput(
        Buffer.from('not an image'),
        file(Buffer.from('not an image'))
      )
    ).rejects.toThrow()
  })
})
describe('credential-owning Cloudflare upload adapter', () => {
  const provider = () =>
    cloudflareUploadProvider({
      CLOUDFLARE_ACCOUNT_ID: 'controlled-account',
      CLOUDFLARE_IMAGES_TOKEN: 'credential-sentinel'
    })
  it('uses one persisted custom identity and authenticated status, without exposing credentials or allocation as readiness', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = []
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      calls.push({ url, init })
      return Response.json({
        success: true,
        result: {
          id: 'stable-id',
          draft: calls.length === 1,
          uploaded: '2026-11-21T00:00:00Z'
        }
      })
    })
    const adapter = provider()
    expect(
      await adapter.dispatch(
        'stable-id',
        Buffer.from('validated input'),
        'image/png'
      )
    ).toBe('processing')
    expect((calls[0].init?.body as FormData).get('id')).toBe('stable-id')
    expect(calls[0].init?.redirect).toBe('error')
    expect(await adapter.status('stable-id')).toBe('ready')
    expect(calls[1].url).toBe(
      'https://api.cloudflare.com/client/v4/accounts/controlled-account/images/v1/stable-id'
    )
    expect(calls[1].init?.headers).toEqual({
      Authorization: 'Bearer credential-sentinel'
    })
  })
  it('keeps missing allocations, forged identities, redirects and lost responses unresolved', async () => {
    const adapter = provider()
    vi.stubGlobal('fetch', async () => new Response(null, { status: 404 }))
    expect(await adapter.status('stable-id')).toBe('unknown')
    vi.stubGlobal('fetch', async () =>
      Response.json({
        success: true,
        result: { id: 'foreign-id', uploaded: 'now' }
      })
    )
    await expect(adapter.status('stable-id')).rejects.toThrow()
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response(null, {
          status: 302,
          headers: { Location: 'http://169.254.169.254/' }
        })
    )
    await expect(
      adapter.dispatch('stable-id', Buffer.from('validated input'), 'image/png')
    ).rejects.toThrow('unresolved')
    vi.stubGlobal('fetch', async () => {
      throw new Error('controlled lost HTTP response')
    })
    await expect(
      adapter.dispatch('stable-id', Buffer.from('validated input'), 'image/png')
    ).rejects.toThrow()
  })
})
