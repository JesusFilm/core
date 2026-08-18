import { resolveLegacySize } from './resolveLegacySize'
import type { HttpSizeClient } from './types'

describe('resolveLegacySize', () => {
  it('resolves from the final URL Content-Length', async () => {
    const httpClient: HttpSizeClient = {
      head: vi
        .fn()
        .mockResolvedValue({
          ok: true,
          status: 200,
          contentLength: '12345',
          contentRangeTotal: null
        }),
      rangeGet: vi.fn()
    }

    const result = await resolveLegacySize(
      'https://legacy.example.com/file.mp4',
      httpClient
    )

    expect(result).toEqual({ size: 12345, errorCode: null })
    expect(httpClient.rangeGet).not.toHaveBeenCalled()
  })

  it('falls back to a Range request when HEAD is unusable', async () => {
    const httpClient: HttpSizeClient = {
      head: vi
        .fn()
        .mockResolvedValue({
          ok: false,
          status: 403,
          contentLength: null,
          contentRangeTotal: null
        }),
      rangeGet: vi
        .fn()
        .mockResolvedValue({
          ok: true,
          status: 206,
          contentLength: '1',
          contentRangeTotal: 987654
        })
    }

    const result = await resolveLegacySize(
      'https://legacy.example.com/file.mp4',
      httpClient
    )

    expect(result).toEqual({ size: 987654, errorCode: null })
  })

  it('reports unreachable when both attempts fail', async () => {
    const httpClient: HttpSizeClient = {
      head: vi.fn().mockRejectedValue(new Error('timeout')),
      rangeGet: vi.fn().mockRejectedValue(new Error('timeout'))
    }

    const result = await resolveLegacySize(
      'https://legacy.example.com/file.mp4',
      httpClient
    )

    expect(result).toEqual({ size: null, errorCode: 'httpUnreachable' })
  })
})
