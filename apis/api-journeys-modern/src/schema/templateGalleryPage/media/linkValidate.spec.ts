import { canvaSpec } from './canvaOEmbed'
import { googleSlidesSpec } from './googleSlidesValidate'
import { linkValidate } from './linkValidate'
import { youTubeSpec } from './youTubeOEmbed'

vi.mock('@core/prisma/media/client', () => ({
  prisma: {
    shortLinkBlocklistDomain: {
      findFirst: vi.fn()
    }
  }
}))

const { prisma: mockPrismaMedia } = await vi.importMock<any>(
  '@core/prisma/media/client'
)

describe('linkValidate', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
    // No host is blocklisted by default.
    mockPrismaMedia.shortLinkBlocklistDomain.findFirst.mockResolvedValue(null)
  })

  describe('normalizer dispatch (tier-1 hosts)', () => {
    it('dispatches a canva.com URL to the canva normalizer', async () => {
      const spy = vi
        .spyOn(canvaSpec, 'normalize')
        .mockResolvedValue({ embedUrl: 'canva-embed' })

      await expect(
        linkValidate('https://www.canva.com/design/DAF/abc/edit')
      ).resolves.toEqual({ embedUrl: 'canva-embed' })
      expect(spy).toHaveBeenCalledWith(
        'https://www.canva.com/design/DAF/abc/edit'
      )
    })

    it('dispatches a youtube.com URL to the youtube normalizer', async () => {
      const spy = vi
        .spyOn(youTubeSpec, 'normalize')
        .mockResolvedValue({ embedUrl: 'yt-embed' })

      await expect(
        linkValidate('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      ).resolves.toEqual({ embedUrl: 'yt-embed' })
      expect(spy).toHaveBeenCalled()
    })

    it('dispatches a docs.google.com URL to the slides normalizer', async () => {
      const spy = vi
        .spyOn(googleSlidesSpec, 'normalize')
        .mockResolvedValue({ embedUrl: 'slides-embed' })

      await expect(
        linkValidate('https://docs.google.com/presentation/d/1/pub')
      ).resolves.toEqual({ embedUrl: 'slides-embed' })
      expect(spy).toHaveBeenCalled()
    })
  })

  it('stores an allowlisted host with no normalizer as-is', async () => {
    // loom.com is in the test env allowlist and has no normalizer.
    await expect(
      linkValidate('https://loom.com/share/abc123')
    ).resolves.toEqual({ embedUrl: 'https://loom.com/share/abc123' })
  })

  it('rejects EMBED_HOST_BLOCKED before the allowlist, even for a built-in host', async () => {
    mockPrismaMedia.shortLinkBlocklistDomain.findFirst.mockResolvedValue({
      hostname: 'www.canva.com'
    })
    const spy = vi.spyOn(canvaSpec, 'normalize')

    await expect(
      linkValidate('https://www.canva.com/design/DAF/abc/edit')
    ).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT', reason: 'EMBED_HOST_BLOCKED' }
    })
    expect(spy).not.toHaveBeenCalled()
  })

  it('rejects EMBED_HOST_NOT_ALLOWED for a host in neither set', async () => {
    await expect(
      linkValidate('https://evil.example.com/x')
    ).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT', reason: 'EMBED_HOST_NOT_ALLOWED' }
    })
  })

  it('rejects a non-https URL before any host check', async () => {
    await expect(linkValidate('http://www.canva.com/design/x')).rejects.toThrow(
      /https/
    )
    expect(
      mockPrismaMedia.shortLinkBlocklistDomain.findFirst
    ).not.toHaveBeenCalled()
  })

  it('queries the blocklist with the lowercased hostname', async () => {
    vi.spyOn(canvaSpec, 'normalize').mockResolvedValue({ embedUrl: 'x' })
    await linkValidate('https://www.canva.com/design/DAF/abc/edit')
    expect(
      mockPrismaMedia.shortLinkBlocklistDomain.findFirst
    ).toHaveBeenCalledWith({ where: { hostname: 'www.canva.com' } })
  })
})
