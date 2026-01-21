import { getVideoDuration } from './getVideoDuration'

describe('getVideoDuration', () => {
  let mockVideo: any

  beforeEach(() => {
    mockVideo = {
      preload: '',
      src: '',
      duration: 123,
      onloadedmetadata: null as (() => void) | null,
      onerror: null as (() => void) | null
    }

    jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'video') return mockVideo
      return document.createElement(tag)
    })

    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('resolves with video duration when metadata loads', async () => {
    const file = new File(['dummy'], 'video.mp4', { type: 'video/mp4' })
    const promise = getVideoDuration(file)
    mockVideo.onloadedmetadata()

    await expect(promise).resolves.toBe(123)
    expect(URL.createObjectURL).toHaveBeenCalledWith(file)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('rejects when metadata fails to load', async () => {
    const file = new File(['dummy'], 'video.mp4', { type: 'video/mp4' })
    const promise = getVideoDuration(file)
    mockVideo.onerror()

    await expect(promise).rejects.toThrow('Metadata load failed')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('returns small video durations accurately', async () => {
    const videoFail = new File(['tiny'], 'tiny.mp4', { type: 'video/mp4' })
    mockVideo.duration = 0.49
    const durationFail = getVideoDuration(videoFail)
    mockVideo.onloadedmetadata?.()
    await expect(durationFail).resolves.toBe(0.49)

    const videoPass = new File(['tiny'], 'tiny.mp4', { type: 'video/mp4' })
    mockVideo.duration = 0.5
    const durationPass = getVideoDuration(videoPass)
    mockVideo.onloadedmetadata?.()
    await expect(durationPass).resolves.toBe(0.5)
  })
})
