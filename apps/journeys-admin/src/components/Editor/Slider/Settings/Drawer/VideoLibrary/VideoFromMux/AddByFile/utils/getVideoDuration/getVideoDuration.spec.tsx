import { getVideoDuration } from './getVideoDuration'

describe('getVideoDuration', () => {
  let mockVideo: Pick<HTMLVideoElement, 'preload' | 'src'> & {
    duration: number
    onloadedmetadata: jest.Mock<void, []>
    onerror: jest.Mock<void, []>
  }

  beforeEach(() => {
    mockVideo = {
      preload: '',
      src: '',
      duration: 123,
      onloadedmetadata: jest.fn(),
      onerror: jest.fn()
    }

    jest.spyOn(document, 'createElement').mockImplementation(() => {
      return mockVideo as unknown as HTMLVideoElement
    })

    jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
    jest.spyOn(URL, 'revokeObjectURL').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('resolves with video duration when metadata loads', async () => {
    const file = new File(['dummy'], 'video.mp4', { type: 'video/mp4' })
    const promise = getVideoDuration(file)
    console.log('mockVideo.onloadedmetadata', mockVideo.onloadedmetadata)
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
