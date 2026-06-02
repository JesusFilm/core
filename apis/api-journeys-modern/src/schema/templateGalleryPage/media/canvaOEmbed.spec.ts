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
})
