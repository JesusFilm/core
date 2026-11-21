import sharp from 'sharp'

import {
  catalogStreamUrl,
  mediaProviders,
  publicMediaUrl
} from './mcpMediaProviders'

const photo = {
  id: 'photo',
  width: 1200,
  height: 800,
  blur_hash: 'trusted-blurhash',
  alt_description: 'Synthetic photo',
  urls: {
    regular: 'https://images.unsplash.com/photo',
    small: 'https://images.unsplash.com/photo?w=100'
  }
}
const env = {
  UNSPLASH_ACCESS_KEY: 'private-provider-key',
  FIREBASE_API_KEY: 'private-youtube-key'
}
describe('fixed-origin media providers', () => {
  afterEach(() => vi.unstubAllGlobals())
  it('permits supported catalog delivery origins while rejecting internal or executable stream references', () => {
    expect(catalogStreamUrl('https://stream.mux.com/ready.m3u8')).toBe(
      'https://stream.mux.com/ready.m3u8'
    )
    expect(catalogStreamUrl('https://cdn.cloudfront.net/ready.m3u8')).toBe(
      'https://cdn.cloudfront.net/ready.m3u8'
    )
    for (const url of [
      'http://169.254.169.254/file',
      'https://localhost/file',
      'https://unsupported.example/file',
      'javascript:alert(1)',
      'https://stream.mux.com:444/file'
    ])
      expect(() => catalogStreamUrl(url)).toThrow()
  })
  it.each([
    'http://imagedelivery.net/file',
    'https://127.0.0.1/file',
    'https://169.254.169.254/file',
    'https://[::1]/file',
    'file:///etc/passwd',
    'data:image/png;base64,abc',
    'https://imagedelivery.net.attacker.example/file',
    'https://user:password@images.unsplash.com/file',
    'https://images.unsplash.com:444/file',
    'https://images.unsplash.com/file#fragment'
  ])('rejects unsafe or unsupported URL %s', (url) => {
    expect(() => publicMediaUrl(url)).toThrow()
  })
  it('keeps the existing public delivery URL and derives image dimensions and blurhash from decoded bytes', async () => {
    const bytes = await sharp({
      create: { width: 120, height: 80, channels: 4, background: '#123456' }
    })
      .png()
      .toBuffer()
    const fetcher = vi.fn(async () => new Response(new Uint8Array(bytes)))
    vi.stubGlobal('fetch', fetcher)
    const url = 'https://imagedelivery.net/account/asset/public'
    const result = await mediaProviders(env).image(url)
    expect(result).toMatchObject({
      kind: 'image',
      src: url,
      width: 120,
      height: 80
    })
    expect(result.blurhash.length).toBeGreaterThan(10)
    expect(fetcher.mock.calls[0]).toEqual([
      url,
      expect.objectContaining({ redirect: 'error' })
    ])
  })
  it('rejects oversized, invalid and failed image responses', async () => {
    const p = mediaProviders(env)
    vi.stubGlobal('fetch', async () => new Response(new Uint8Array(10000001)))
    await expect(
      p.image('https://imagedelivery.net/account/asset/public')
    ).rejects.toThrow('LIMIT_EXCEEDED')
    vi.stubGlobal('fetch', async () => new Response('not-an-image'))
    await expect(
      p.image('https://imagedelivery.net/account/asset/public')
    ).rejects.toThrow()
    vi.stubGlobal('fetch', async () => new Response(null, { status: 503 }))
    await expect(
      p.image('https://imagedelivery.net/account/asset/public')
    ).rejects.toThrow('DEPENDENCY_UNAVAILABLE')
    await expect(p.image('https://i.ytimg.com/file')).rejects.toThrow(
      'VALIDATION_FAILED'
    )
  })
  it('uses trusted Unsplash facts and sends its credential only to the fixed API origin', async () => {
    const fetcher = vi.fn(async () => Response.json(photo))
    vi.stubGlobal('fetch', fetcher)
    const p = mediaProviders(env)
    expect(await p.unsplash('photo')).toEqual({
      kind: 'image',
      src: photo.urls.regular,
      width: 1200,
      height: 800,
      blurhash: 'trusted-blurhash'
    })
    const [url, options] = fetcher.mock.calls[0] as unknown as [
      URL,
      RequestInit
    ]
    expect(url.origin).toBe('https://api.unsplash.com')
    expect(options.redirect).toBe('error')
    expect(JSON.stringify(await p.unsplash('photo'))).not.toContain(
      'private-provider-key'
    )
    vi.stubGlobal('fetch', async () => Response.json({ results: [photo] }))
    expect(await p.searchUnsplash('nature', 2, 10)).toEqual([
      { id: 'photo', preview: photo.urls.small, alt: 'Synthetic photo' }
    ])
    await expect(mediaProviders({}).unsplash('photo')).rejects.toThrow(
      'DEPENDENCY_UNAVAILABLE'
    )
  })
  it('derives public embeddable YouTube duration and supported subtitle languages without a guest fallback', async () => {
    vi.stubGlobal('fetch', async (url: URL) =>
      url.pathname.endsWith('/captions')
        ? Response.json({
            items: [
              { snippet: { language: 'EN', trackKind: 'standard' } },
              { snippet: { language: 'es', trackKind: 'ASR' } }
            ]
          })
        : Response.json({
            items: [
              {
                status: {
                  privacyStatus: 'public',
                  uploadStatus: 'processed',
                  embeddable: true
                },
                snippet: {
                  title: 'Trusted title',
                  description: 'Trusted description',
                  thumbnails: {
                    high: {
                      url: 'https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg'
                    }
                  }
                },
                contentDetails: { duration: 'PT1H2M3S', caption: 'true' }
              }
            ]
          })
    )
    expect(await mediaProviders(env).youtube('abcdefghijk')).toEqual({
      title: 'Trusted title',
      description: 'Trusted description',
      image: 'https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg',
      duration: 3723,
      subtitleBcp47: ['en']
    })
    await expect(mediaProviders({}).youtube('abcdefghijk')).rejects.toThrow(
      'DEPENDENCY_UNAVAILABLE'
    )
    vi.stubGlobal('fetch', async () => Response.json({ items: [] }))
    await expect(mediaProviders(env).youtube('abcdefghijk')).rejects.toThrow(
      'ACCESS_DENIED_OR_NOT_FOUND'
    )
  })
  it.each([
    { privacyStatus: 'private', uploadStatus: 'processed', embeddable: true },
    { privacyStatus: 'public', uploadStatus: 'failed', embeddable: true },
    { privacyStatus: 'public', uploadStatus: 'processed', embeddable: false }
  ])(
    'rejects a YouTube source which is not publicly ready and embeddable',
    async (status) => {
      vi.stubGlobal('fetch', async () =>
        Response.json({
          items: [
            {
              status,
              snippet: {
                title: 'Protected title',
                description: 'Protected description',
                thumbnails: { high: { url: 'https://i.ytimg.com/file' } }
              },
              contentDetails: { duration: 'PT10S' }
            }
          ]
        })
      )
      await expect(mediaProviders(env).youtube('abcdefghijk')).rejects.toThrow()
    }
  )
})
