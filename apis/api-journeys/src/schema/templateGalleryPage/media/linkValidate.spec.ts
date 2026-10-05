import { canvaSpec } from './canvaOEmbed'
import { googleSlidesSpec } from './googleSlidesValidate'
import { linkValidate, normalizerHostsMissingFrom } from './linkValidate'
import { youTubeSpec } from './youTubeOEmbed'

describe('linkValidate', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
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

  it('rejects EMBED_HOST_NOT_ALLOWED for a host not in the allowlist', async () => {
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
  })

  describe('normalizerHostsMissingFrom (allowlist drift guard)', () => {
    it('returns no missing hosts when the allowlist covers every normalizer host', () => {
      const allowed = new Set([
        'canva.com',
        'www.canva.com',
        'canva.link',
        'youtube.com',
        'www.youtube.com',
        'm.youtube.com',
        'youtu.be',
        'docs.google.com'
      ])
      expect(normalizerHostsMissingFrom(allowed)).toEqual([])
    })

    it('flags a normalizer host the allowlist omits (e.g. youtu.be)', () => {
      const allowed = new Set([
        'canva.com',
        'www.canva.com',
        'canva.link',
        'youtube.com',
        'www.youtube.com',
        'm.youtube.com',
        'docs.google.com'
      ])
      expect(normalizerHostsMissingFrom(allowed)).toContain('youtu.be')
    })

    it('flags every normalizer host when the allowlist is empty', () => {
      expect(normalizerHostsMissingFrom(new Set())).toEqual(
        expect.arrayContaining([
          'canva.com',
          'youtube.com',
          'youtu.be',
          'docs.google.com'
        ])
      )
    })
  })
})
