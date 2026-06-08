import { canvaSpec } from './canvaOEmbed'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

describe('canvaSpec.normalize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the iframe src from a 2xx oEmbed response', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        html: '<iframe loading="lazy" src="https://www.canva.com/design/DAF123/abc/view?embed" allow="fullscreen"></iframe>'
      })
    })

    await expect(
      canvaSpec.normalize('https://www.canva.com/design/DAF123/abc/edit')
    ).resolves.toEqual({
      embedUrl: 'https://www.canva.com/design/DAF123/abc/view?embed'
    })
  })

  it('rejects a javascript: src in the oEmbed response (re-validation)', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        html: '<iframe src="javascript:alert(1)"></iframe>'
      })
    })

    await expect(
      canvaSpec.normalize('https://www.canva.com/design/DAF123/abc/edit')
    ).rejects.toThrow(/https/)
  })

  it('falls back to a /view?embed rewrite for a canonical URL when oEmbed fails', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 })

    await expect(
      canvaSpec.normalize('https://www.canva.com/design/DAF123/my-slug/watch')
    ).resolves.toEqual({
      embedUrl: 'https://www.canva.com/design/DAF123/my-slug/view?embed'
    })
  })

  it('falls back when the fetch throws (timeout/network)', async () => {
    fetchMock.mockRejectedValue(new Error('aborted'))

    await expect(
      canvaSpec.normalize('https://www.canva.com/design/DAF123/my-slug/view')
    ).resolves.toEqual({
      embedUrl: 'https://www.canva.com/design/DAF123/my-slug/view?embed'
    })
  })

  it('fails closed with CANVA_UNAVAILABLE for a non-canonical URL when oEmbed fails', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 })

    await expect(
      canvaSpec.normalize('https://www.canva.com/folder/xyz')
    ).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT', reason: 'CANVA_UNAVAILABLE' }
    })
  })

  it('fails closed when oEmbed 2xx response has no iframe and URL is non-canonical', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ html: '<div>no iframe here</div>' })
    })

    await expect(
      canvaSpec.normalize('https://www.canva.com/folder/xyz')
    ).rejects.toMatchObject({
      extensions: { reason: 'CANVA_UNAVAILABLE' }
    })
  })

  describe('canva.link share links', () => {
    const SHARE_LINK = 'https://canva.link/0fi14tc9momlpe8'
    const RESOLVED = 'https://www.canva.com/design/DAF123/abc/view'

    function redirectTo(location: string): {
      status: number
      headers: Headers
    } {
      return { status: 302, headers: new Headers({ location }) }
    }

    it('resolves the redirect, then returns the oEmbed src', async () => {
      fetchMock
        // 1) share-link hop: 302 to the canonical design URL
        .mockResolvedValueOnce(redirectTo(RESOLVED))
        // 2) design URL responds 2xx — redirect resolution complete
        .mockResolvedValueOnce({ status: 200, headers: new Headers() })
        // 3) oEmbed on the resolved URL
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            html: `<iframe src="${RESOLVED}?embed"></iframe>`
          })
        })

      await expect(canvaSpec.normalize(SHARE_LINK)).resolves.toEqual({
        embedUrl: `${RESOLVED}?embed`
      })
    })

    it('falls back to /view?embed on the resolved URL when oEmbed fails', async () => {
      fetchMock
        .mockResolvedValueOnce(redirectTo(RESOLVED))
        .mockResolvedValueOnce({ status: 200, headers: new Headers() })
        .mockResolvedValueOnce({ ok: false, status: 503 })

      await expect(canvaSpec.normalize(SHARE_LINK)).resolves.toEqual({
        embedUrl: 'https://www.canva.com/design/DAF123/abc/view?embed'
      })
    })

    it('fails closed when the share link resolves to a non-canva host', async () => {
      fetchMock.mockResolvedValueOnce(redirectTo('https://evil.example.com/x'))

      await expect(canvaSpec.normalize(SHARE_LINK)).rejects.toMatchObject({
        extensions: { reason: 'CANVA_UNAVAILABLE' }
      })
      // oEmbed must never be reached for a bad resolution
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('fails closed when a redirect hop downgrades to http', async () => {
      fetchMock.mockResolvedValueOnce(
        redirectTo('http://www.canva.com/design/DAF123/abc/view')
      )

      await expect(canvaSpec.normalize(SHARE_LINK)).rejects.toMatchObject({
        extensions: { reason: 'CANVA_UNAVAILABLE' }
      })
      // the http: hop must never be fetched
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('fails closed when the redirect chain exceeds MAX_REDIRECTS', async () => {
      // every hop redirects again — the chain never terminates
      fetchMock.mockResolvedValue(redirectTo('https://canva.link/next'))

      await expect(canvaSpec.normalize(SHARE_LINK)).rejects.toMatchObject({
        extensions: { reason: 'CANVA_UNAVAILABLE' }
      })
      // MAX_REDIRECTS (5) hops followed + the initial fetch, then fail closed
      expect(fetchMock).toHaveBeenCalledTimes(6)
    })

    it('fails closed on a redirect response with no location header', async () => {
      fetchMock.mockResolvedValueOnce({ status: 302, headers: new Headers() })

      await expect(canvaSpec.normalize(SHARE_LINK)).rejects.toMatchObject({
        extensions: { reason: 'CANVA_UNAVAILABLE' }
      })
    })

    it('fails closed when the redirect resolution fetch fails', async () => {
      fetchMock.mockRejectedValueOnce(new Error('network'))

      await expect(canvaSpec.normalize(SHARE_LINK)).rejects.toMatchObject({
        extensions: { reason: 'CANVA_UNAVAILABLE' }
      })
    })
  })
})
