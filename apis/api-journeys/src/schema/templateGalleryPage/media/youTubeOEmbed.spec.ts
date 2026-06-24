import { youTubeSpec } from './youTubeOEmbed'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

const VIDEO_ID = 'dQw4w9WgXcQ'
const EMBED = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}`

describe('youTubeSpec.normalize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fetchMock.mockResolvedValue({ ok: true, status: 200 })
  })

  it.each([
    ['watch', `https://youtube.com/watch?v=${VIDEO_ID}`],
    ['youtu.be', `https://youtu.be/${VIDEO_ID}`],
    ['shorts', `https://youtube.com/shorts/${VIDEO_ID}`],
    ['embed', `https://youtube.com/embed/${VIDEO_ID}`],
    ['live', `https://youtube.com/live/${VIDEO_ID}`],
    ['m.youtube watch', `https://m.youtube.com/watch?v=${VIDEO_ID}`]
  ])('extracts the video ID from the %s shape', async (_name, url) => {
    await expect(youTubeSpec.normalize(url)).resolves.toEqual({
      embedUrl: EMBED
    })
  })

  it('extracts the ID when a ?t= time fragment is present', async () => {
    await expect(
      youTubeSpec.normalize(`https://youtu.be/${VIDEO_ID}?t=30`)
    ).resolves.toEqual({ embedUrl: EMBED })
  })

  it('stores the privacy-enhanced nocookie embed URL on 200', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200 })
    await expect(
      youTubeSpec.normalize(`https://www.youtube.com/watch?v=${VIDEO_ID}`)
    ).resolves.toEqual({ embedUrl: EMBED })
  })

  it('maps 401 to YOUTUBE_PRIVATE', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 401 })
    await expect(
      youTubeSpec.normalize(`https://www.youtube.com/watch?v=${VIDEO_ID}`)
    ).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT', reason: 'YOUTUBE_PRIVATE' }
    })
  })

  it('maps 404 to YOUTUBE_UNAVAILABLE', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404 })
    await expect(
      youTubeSpec.normalize(`https://www.youtube.com/watch?v=${VIDEO_ID}`)
    ).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT', reason: 'YOUTUBE_UNAVAILABLE' }
    })
  })

  it('maps other statuses to INTERNAL_SERVER_ERROR', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 503 })
    await expect(
      youTubeSpec.normalize(`https://www.youtube.com/watch?v=${VIDEO_ID}`)
    ).rejects.toMatchObject({
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  })

  it('maps a network/timeout failure to INTERNAL_SERVER_ERROR', async () => {
    fetchMock.mockRejectedValue(new Error('aborted'))
    await expect(
      youTubeSpec.normalize(`https://www.youtube.com/watch?v=${VIDEO_ID}`)
    ).rejects.toMatchObject({
      extensions: { code: 'INTERNAL_SERVER_ERROR' }
    })
  })

  it('rejects a URL with no extractable video ID before any fetch', async () => {
    await expect(
      youTubeSpec.normalize('https://www.youtube.com/feed/subscriptions')
    ).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT', reason: 'YOUTUBE_INVALID_URL' }
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
