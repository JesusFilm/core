import { resolveImageAsset } from './resolveImageAsset'

describe('resolveImageAsset', () => {
  afterEach(() => vi.unstubAllGlobals())

  it.each([
    'http://localhost:4000/image',
    'https://127.0.0.1/image',
    'https://example.com/image',
    'https://user:pass@images.unsplash.com/image'
  ])('rejects a non-library image URL before fetching: %s', async (src) => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(
      resolveImageAsset(src, new AbortController().signal)
    ).rejects.toThrow('supported libraries')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('reads real metadata from a library asset and rejects redirects', async () => {
    const bytes = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jEioAAAAASUVORK5CYII=',
      'base64'
    )
    const fetchMock = vi.fn(async () => ({
      ok: true,
      headers: new Headers(),
      arrayBuffer: async () => bytes
    }))
    vi.stubGlobal('fetch', fetchMock)
    expect(
      await resolveImageAsset(
        'https://imagedelivery.net/upload/public',
        new AbortController().signal
      )
    ).toMatchObject({ width: 1, height: 1 })
    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        redirect: 'error',
        signal: expect.any(AbortSignal)
      })
    )
  })
})
