import { logger } from '../../logger'

import { canvaSpec } from './canvaOEmbed'

vi.mock('../../logger', () => ({
  logger: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() }
}))

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

  it('fails closed when the oEmbed src points at a non-canva host', async () => {
    // https is satisfied, but the host pin must reject a foreign iframe src so
    // a poisoned oEmbed response can't plant an arbitrary host on a public page.
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        html: '<iframe src="https://evil.example.com/design/DAF123/abc/view?embed"></iframe>'
      })
    })

    await expect(
      canvaSpec.normalize('https://www.canva.com/design/DAF123/abc/edit')
    ).rejects.toMatchObject({
      extensions: { reason: 'CANVA_UNAVAILABLE' }
    })
  })

  it('accepts an oEmbed src on a canva.com subdomain', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        html: '<iframe src="https://embed.canva.com/design/DAF123/abc/view?embed"></iframe>'
      })
    })

    await expect(
      canvaSpec.normalize('https://www.canva.com/design/DAF123/abc/edit')
    ).resolves.toEqual({
      embedUrl: 'https://embed.canva.com/design/DAF123/abc/view?embed'
    })
  })

  it('fails closed when the oEmbed src carries embedded credentials (userinfo)', async () => {
    // `https://evil.com@canva.com/…` has hostname `canva.com` and would pass the
    // host pin, but userinfo must be rejected so an attacker-shaped string can't
    // be stored as a public iframe src.
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        html: '<iframe src="https://evil.example.com@www.canva.com/design/DAF123/abc/view?embed"></iframe>'
      })
    })

    await expect(
      canvaSpec.normalize('https://www.canva.com/design/DAF123/abc/edit')
    ).rejects.toMatchObject({
      extensions: { reason: 'CANVA_UNAVAILABLE' }
    })
  })

  it('logs and falls back to a /view?embed rewrite when oEmbed returns a 5xx', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 })

    await expect(
      canvaSpec.normalize('https://www.canva.com/design/DAF123/my-slug/watch')
    ).resolves.toEqual({
      embedUrl: 'https://www.canva.com/design/DAF123/my-slug/view?embed'
    })
    // a 5xx is an outage signal, logged distinct from a normal no-iframe fallback
    expect(logger.warn).toHaveBeenCalled()
  })

  it('falls back when the fetch throws (timeout/network) and logs the outage', async () => {
    fetchMock.mockRejectedValue(new Error('aborted'))

    await expect(
      canvaSpec.normalize('https://www.canva.com/design/DAF123/my-slug/view')
    ).resolves.toEqual({
      embedUrl: 'https://www.canva.com/design/DAF123/my-slug/view?embed'
    })
    // a network/timeout failure is logged so a Canva outage is diagnosable
    expect(logger.warn).toHaveBeenCalled()
  })

  it('does NOT log on a normal 2xx-no-iframe fallback (avoids noise)', async () => {
    // oEmbed 200 with no iframe is an expected fallback, not an outage — must
    // not log, or every odd paste would spam warnings.
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ html: '<div>no iframe</div>' })
    })

    await expect(
      canvaSpec.normalize('https://www.canva.com/design/DAF123/my-slug/view')
    ).resolves.toEqual({
      embedUrl: 'https://www.canva.com/design/DAF123/my-slug/view?embed'
    })
    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('falls through to the canonical fallback when the iframe uses srcdoc (no src)', async () => {
    // The `\ssrc=` anchor must not match `srcdoc`; with no real src, oEmbed
    // yields null and the canonical-path fallback handles the canonical URL.
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        html: '<iframe srcdoc="<p>hi</p>"></iframe>'
      })
    })

    await expect(
      canvaSpec.normalize('https://www.canva.com/design/DAF123/abc/view')
    ).resolves.toEqual({
      embedUrl: 'https://www.canva.com/design/DAF123/abc/view?embed'
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

    it('resolves the redirect from the location header without re-fetching the design page', async () => {
      fetchMock
        // 1) share-link hop: 302 to the canonical design URL. The design URL is
        //    taken straight from the location header — Canva returns 403 to
        //    server-side requests for design pages, so re-fetching it to
        //    confirm a 2xx would fail closed and break every share link.
        .mockResolvedValueOnce(redirectTo(RESOLVED))
        // 2) oEmbed on the resolved URL
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
      // Exactly two fetches: the canva.link hop + oEmbed. A third call would
      // mean the design page was re-fetched — the bug that 403'd against real
      // Canva even though the unit test (mocking a 2xx) passed.
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('falls back to /view?embed on the resolved URL when oEmbed fails', async () => {
      fetchMock
        .mockResolvedValueOnce(redirectTo(RESOLVED))
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

    it('fails closed when a redirect hop carries embedded credentials (userinfo)', async () => {
      // `https://evil.com@www.canva.com/…` has hostname `www.canva.com` and
      // would pass the host check, but userinfo must be rejected before the
      // design URL is returned/forwarded to oEmbed.
      fetchMock.mockResolvedValueOnce(
        redirectTo(
          'https://evil.example.com@www.canva.com/design/DAF123/abc/view'
        )
      )

      await expect(canvaSpec.normalize(SHARE_LINK)).rejects.toMatchObject({
        extensions: { reason: 'CANVA_UNAVAILABLE' }
      })
      // rejected at the hop — the design URL is never forwarded to oEmbed
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('resolves through an intermediate canva.link hop to a design host', async () => {
      // canva.link → canva.link → design host: the intermediate canva.link hop
      // is followed (currentUrl advances), the design host is returned from the
      // location header, then oEmbed resolves.
      fetchMock
        .mockResolvedValueOnce(redirectTo('https://canva.link/second'))
        .mockResolvedValueOnce(redirectTo(RESOLVED))
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
      // 2 redirect hops + oEmbed; the design page is never re-fetched
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    it('follows a relative location header against the current hop', async () => {
      fetchMock
        .mockResolvedValueOnce(redirectTo('/design/DAF123/abc/view'))
        .mockResolvedValueOnce({ ok: false, status: 503 })

      // The relative location resolves against canva.link, which is NOT a design
      // host, so the loop continues to fetch it (canva.link hop), then fails the
      // host check downstream — i.e. a relative redirect off canva.link cannot
      // smuggle a design URL. It must redirect to an absolute design host.
      await expect(canvaSpec.normalize(SHARE_LINK)).rejects.toMatchObject({
        extensions: { reason: 'CANVA_UNAVAILABLE' }
      })
    })

    it('fails closed when a design-host redirect lands on a non-design path', async () => {
      // canva.link → canva.com/login (design host, but not a /design/ path).
      // Returned from the location header, oEmbed yields nothing, and the
      // canonical-path fallback rejects the non-design path.
      fetchMock
        .mockResolvedValueOnce(redirectTo('https://www.canva.com/login'))
        .mockResolvedValueOnce({ ok: false, status: 503 })

      await expect(canvaSpec.normalize(SHARE_LINK)).rejects.toMatchObject({
        extensions: { reason: 'CANVA_UNAVAILABLE' }
      })
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

    it('fails closed when canva.link responds 2xx without redirecting (dead/expired link)', async () => {
      fetchMock.mockResolvedValueOnce({ status: 200, headers: new Headers() })

      await expect(canvaSpec.normalize(SHARE_LINK)).rejects.toMatchObject({
        extensions: { reason: 'CANVA_UNAVAILABLE' }
      })
      // never resolved to a design URL → oEmbed must not run
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('fails closed when canva.link returns a non-redirect error status (e.g. 404)', async () => {
      fetchMock.mockResolvedValueOnce({ status: 404, headers: new Headers() })

      await expect(canvaSpec.normalize(SHARE_LINK)).rejects.toMatchObject({
        extensions: { reason: 'CANVA_UNAVAILABLE' }
      })
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('fails closed and logs when the redirect resolution fetch fails', async () => {
      fetchMock.mockRejectedValueOnce(new Error('network'))

      await expect(canvaSpec.normalize(SHARE_LINK)).rejects.toMatchObject({
        extensions: { reason: 'CANVA_UNAVAILABLE' }
      })
      expect(logger.warn).toHaveBeenCalled()
    })
  })
})
