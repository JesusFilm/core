import { extractMuxResolutionFromUrl, resolveMuxSize } from './resolveMuxSize'
import type { HttpSizeClient, MuxAssetLike } from './types'

const URL = 'https://stream.mux.com/playback123/720p.mp4'

function makeHttpClient(overrides: Partial<HttpSizeClient> = {}): HttpSizeClient {
  return {
    head: vi
      .fn()
      .mockResolvedValue({ ok: false, status: 500, contentLength: null, contentRangeTotal: null }),
    rangeGet: vi
      .fn()
      .mockResolvedValue({ ok: false, status: 500, contentLength: null, contentRangeTotal: null }),
    ...overrides
  }
}

describe('extractMuxResolutionFromUrl', () => {
  it('extracts the resolution segment from a Mux rendition URL', () => {
    expect(extractMuxResolutionFromUrl(URL)).toBe('720p')
  })

  it('returns null for a URL without a resolution segment', () => {
    expect(extractMuxResolutionFromUrl('https://stream.mux.com/playback123.m3u8')).toBeNull()
  })
})

describe('resolveMuxSize', () => {
  it('prefers the matching static rendition filesize', async () => {
    const muxAsset: MuxAssetLike = {
      static_renditions: {
        files: [{ resolution: '720p', filesize: '1296505318', status: 'ready' }]
      }
    }
    const httpClient = makeHttpClient()

    const result = await resolveMuxSize(URL, muxAsset, httpClient)

    expect(result).toEqual({ size: 1296505318, errorCode: null })
    expect(httpClient.head).not.toHaveBeenCalled()
  })

  it('falls back to HTTP verification when the rendition metadata is missing a filesize', async () => {
    const muxAsset: MuxAssetLike = {
      static_renditions: {
        files: [{ resolution: '720p', filesize: null, status: 'ready' }]
      }
    }
    const httpClient = makeHttpClient({
      head: vi
        .fn()
        .mockResolvedValue({ ok: true, status: 200, contentLength: '243808898', contentRangeTotal: null })
    })

    const result = await resolveMuxSize(URL, muxAsset, httpClient)

    expect(result).toEqual({ size: 243808898, errorCode: null })
  })

  it('falls back to HTTP verification when no rendition matches the URL resolution', async () => {
    const muxAsset: MuxAssetLike = {
      static_renditions: { files: [{ resolution: '1080p', filesize: '9999', status: 'ready' }] }
    }
    const httpClient = makeHttpClient({
      head: vi
        .fn()
        .mockResolvedValue({ ok: true, status: 200, contentLength: '500', contentRangeTotal: null })
    })

    const result = await resolveMuxSize(URL, muxAsset, httpClient)

    expect(result).toEqual({ size: 500, errorCode: null })
  })

  it('falls back to HTTP verification when there is no Mux asset metadata at all', async () => {
    const httpClient = makeHttpClient({
      head: vi
        .fn()
        .mockResolvedValue({ ok: true, status: 200, contentLength: '700', contentRangeTotal: null })
    })

    const result = await resolveMuxSize(URL, null, httpClient)

    expect(result).toEqual({ size: 700, errorCode: null })
  })

  it('reports unreachable when the rendition is invalid and HTTP verification also fails', async () => {
    const muxAsset: MuxAssetLike = {
      static_renditions: {
        files: [{ resolution: '720p', filesize: '0', status: 'ready' }]
      }
    }
    const httpClient = makeHttpClient()

    const result = await resolveMuxSize(URL, muxAsset, httpClient)

    expect(result).toEqual({ size: null, errorCode: 'httpUnreachable' })
  })

  it('falls back to HTTP verification when the rendition is still preparing', async () => {
    const muxAsset: MuxAssetLike = {
      static_renditions: {
        files: [
          { resolution: '720p', filesize: '1296505318', status: 'preparing' }
        ]
      }
    }
    const httpClient = makeHttpClient({
      head: vi
        .fn()
        .mockResolvedValue({ ok: true, status: 200, contentLength: '500', contentRangeTotal: null })
    })

    const result = await resolveMuxSize(URL, muxAsset, httpClient)

    expect(result).toEqual({ size: 500, errorCode: null })
    expect(httpClient.head).toHaveBeenCalled()
  })

  it.each(['500bytes', '1e3', '0x10', ' 500', '500.5', ''])(
    'falls back to HTTP verification for a malformed filesize (%p)',
    async (filesize) => {
      const muxAsset: MuxAssetLike = {
        static_renditions: {
          files: [{ resolution: '720p', filesize, status: 'ready' }]
        }
      }
      const httpClient = makeHttpClient({
        head: vi
          .fn()
          .mockResolvedValue({ ok: true, status: 200, contentLength: '500', contentRangeTotal: null })
      })

      const result = await resolveMuxSize(URL, muxAsset, httpClient)

      expect(result).toEqual({ size: 500, errorCode: null })
    }
  )
})
