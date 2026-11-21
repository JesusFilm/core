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
  FIREBASE_API_KEY: 'private-youtube-key',
  YOUTUBE_CAPTIONS_ACCESS_TOKEN: 'controlled-youtube-oauth'
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

  it('proves catalog stream readiness and follows only supported bounded redirects', async () => {
    const fetcher = vi.fn(async (value: string) =>
      value.includes('arc.gt')
        ? new Response(null, {
            status: 302,
            headers: { location: 'https://stream.mux.com/ready.m3u8' }
          })
        : new Response('#EXTM3U\n#EXT-X-VERSION:3\n')
    )
    vi.stubGlobal('fetch', fetcher)
    await expect(
      mediaProviders(env).catalog('https://arc.gt/ready')
    ).resolves.toBeUndefined()
    expect(fetcher).toHaveBeenCalledTimes(2)
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response(null, {
          status: 302,
          headers: { location: 'http://169.254.169.254/metadata' }
        })
    )
    await expect(
      mediaProviders(env).catalog('https://arc.gt/ready')
    ).rejects.toThrow('VALIDATION_FAILED')
    vi.stubGlobal('fetch', async () => new Response('unready', { status: 404 }))
    await expect(
      mediaProviders(env).catalog('https://stream.mux.com/gone.m3u8')
    ).rejects.toThrow('DEPENDENCY_UNAVAILABLE')
  })

  it('keeps captioned public videos selectable when authorized caption metadata is unavailable', async () => {
    const fetcher = vi.fn(async () =>
      Response.json({
        items: [
          {
            status: {
              privacyStatus: 'public',
              uploadStatus: 'processed',
              embeddable: true
            },
            snippet: {
              title: 'Selectable video',
              description: 'Public description',
              thumbnails: {
                high: {
                  url: 'https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg'
                }
              }
            },
            contentDetails: { duration: 'PT10S', caption: 'true' }
          }
        ]
      })
    )
    vi.stubGlobal('fetch', fetcher)
    expect(
      await mediaProviders({ FIREBASE_API_KEY: 'controlled-key' }).youtube(
        'abcdefghijk'
      )
    ).toMatchObject({
      title: 'Selectable video',
      duration: 10,
      subtitleStatus: 'unavailable',
      subtitleBcp47: []
    })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('refreshes a server-owned scoped OAuth credential and keeps it out of returned metadata', async () => {
    const fetcher = vi.fn(
      async (input: string | URL, options?: RequestInit) => {
        const url = new URL(input)
        if (url.hostname === 'oauth2.googleapis.com') {
          expect(options).toMatchObject({ method: 'POST', redirect: 'error' })
          return Response.json({
            access_token: 'controlled-caption-token',
            expires_in: 3600
          })
        }
        if (url.pathname.endsWith('/captions')) {
          expect(options?.headers).toEqual({
            Authorization: 'Bearer controlled-caption-token'
          })
          return Response.json({ items: [] })
        }
        return Response.json({
          items: [
            {
              status: {
                privacyStatus: 'public',
                uploadStatus: 'processed',
                embeddable: true
              },
              snippet: {
                title: 'Public video',
                description: '',
                thumbnails: {
                  high: {
                    url: 'https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg'
                  }
                }
              },
              contentDetails: { duration: 'PT10S', caption: 'true' }
            }
          ]
        })
      }
    )
    vi.stubGlobal('fetch', fetcher)
    const provider = mediaProviders({
      FIREBASE_API_KEY: 'controlled-key',
      YOUTUBE_CAPTIONS_CLIENT_ID: 'controlled-client',
      YOUTUBE_CAPTIONS_CLIENT_SECRET: 'controlled-secret',
      YOUTUBE_CAPTIONS_REFRESH_TOKEN: 'controlled-refresh'
    })
    const first = await provider.youtube('abcdefghijk')
    await provider.youtube('abcdefghijk')
    expect(first).toMatchObject({ subtitleStatus: 'ready' })
    expect(JSON.stringify(first)).not.toContain('controlled-caption-token')
    expect(
      fetcher.mock.calls.filter(
        ([url]) => new URL(url).hostname === 'oauth2.googleapis.com'
      )
    ).toHaveLength(1)
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
              {
                snippet: {
                  language: 'EN',
                  trackKind: 'standard',
                  status: 'serving',
                  isDraft: false
                }
              },
              {
                snippet: {
                  language: 'es',
                  trackKind: 'ASR',
                  status: 'serving',
                  isDraft: false
                }
              }
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
      subtitleBcp47: ['en'],
      subtitleStatus: 'ready'
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
