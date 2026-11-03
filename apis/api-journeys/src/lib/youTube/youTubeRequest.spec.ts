import { YouTubeApiError, youTubeRequest } from './youTubeRequest'

function toError(error: YouTubeApiError): Error {
  return new Error(`youTube ${error.code}: ${error.message}`)
}

function response(status: number, json: () => Promise<unknown>): Response {
  return { ok: status < 400, status, json } as unknown as Response
}

describe('youTubeRequest', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it('returns the body of a successful request to the resource', async () => {
    const body = { items: [{ id: 'videoId' }] }
    fetchSpy.mockResolvedValue(response(200, async () => body))

    await expect(
      youTubeRequest('videos', { id: 'videoId' }, toError)
    ).resolves.toEqual(body)
    const url = new URL(String(fetchSpy.mock.calls[0][0]))
    expect(url.origin + url.pathname).toBe(
      'https://www.googleapis.com/youtube/v3/videos'
    )
    expect(url.searchParams.get('id')).toBe('videoId')
  })

  it('maps the error YouTube reports in the body through toError', async () => {
    fetchSpy.mockResolvedValue(
      response(403, async () => ({
        error: { code: 403, message: 'quota exceeded' }
      }))
    )

    await expect(
      youTubeRequest('videos', { id: 'videoId' }, toError)
    ).rejects.toThrow('youTube 403: quota exceeded')
  })

  it('maps a non-OK status whose body is not JSON to status <n>', async () => {
    fetchSpy.mockResolvedValue(
      response(502, async () => {
        throw new SyntaxError('Unexpected token < in JSON at position 0')
      })
    )

    await expect(
      youTubeRequest('playlistItems', { playlistId: 'PL' }, toError)
    ).rejects.toThrow('youTube 502: status 502')
  })

  it('maps a fetch that throws to code 0', async () => {
    fetchSpy.mockRejectedValue(new Error('network down'))

    await expect(
      youTubeRequest('videos', { id: 'videoId' }, toError)
    ).rejects.toThrow('youTube 0: network down')
  })
})
