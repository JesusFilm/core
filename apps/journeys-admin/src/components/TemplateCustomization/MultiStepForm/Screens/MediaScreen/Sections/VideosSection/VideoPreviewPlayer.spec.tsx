import { render, screen } from '@testing-library/react'

import type { GetJourney_journey_blocks_VideoBlock } from '../../../../../../../../__generated__/GetJourney'
import { VideoBlockSource } from '../../../../../../../../__generated__/globalTypes'
import { getVideoPoster } from '../../utils/videoSectionUtils'

import { VideoPreviewPlayer } from './VideoPreviewPlayer'

const mockVideojsDispose = jest.fn()
jest.mock('video.js', () =>
  jest.fn(() => ({
    isDisposed: () => false,
    dispose: mockVideojsDispose
  }))
)

jest.mock('../../utils/videoSectionUtils', () => ({
  getVideoPoster: jest.fn()
}))

const mockVideojs = jest.requireMock('video.js')
const mockGetVideoPoster = getVideoPoster as jest.MockedFunction<
  typeof getVideoPoster
>

function createBaseVideoBlock(
  overrides: Partial<GetJourney_journey_blocks_VideoBlock> = {}
): GetJourney_journey_blocks_VideoBlock {
  return {
    __typename: 'VideoBlock',
    id: 'video-block-1',
    parentBlockId: null,
    parentOrder: 0,
    muted: null,
    autoplay: null,
    startAt: null,
    endAt: null,
    posterBlockId: null,
    fullsize: null,
    videoId: null,
    videoVariantLanguageId: null,
    source: VideoBlockSource.internal,
    title: null,
    description: null,
    image: null,
    duration: null,
    objectFit: null,
    showGeneratedSubtitles: null,
    subtitleLanguage: null,
    mediaVideo: null,
    action: null,
    eventLabel: null,
    endEventLabel: null,
    customizable: null,
    ...overrides
  }
}

describe('VideoPreviewPlayer', () => {
  let container: HTMLElement

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetVideoPoster.mockReturnValue(undefined)
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (container?.parentNode) {
      document.body.removeChild(container)
    }
  })

  it('renders YouTube source with correct src and type', () => {
    const videoBlock = createBaseVideoBlock({
      source: VideoBlockSource.youTube,
      videoId: 'dQw4w9WgXcQ'
    })

    render(<VideoPreviewPlayer videoBlock={videoBlock} />, { container })

    const source = document.querySelector(
      'source[src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"][type="video/youtube"]'
    )
    expect(source).toBeInTheDocument()
  })

  it('renders Mux source with correct src and type', () => {
    const videoBlock = createBaseVideoBlock({
      source: VideoBlockSource.mux,
      mediaVideo: {
        __typename: 'MuxVideo',
        id: 'mux-id',
        assetId: 'asset-id',
        playbackId: 'mux-playback-456'
      }
    })

    render(<VideoPreviewPlayer videoBlock={videoBlock} />, { container })

    const source = document.querySelector(
      'source[src="https://stream.mux.com/mux-playback-456.m3u8"][type="application/x-mpegURL"]'
    )
    expect(source).toBeInTheDocument()
  })

  it('renders internal/Cloudflare source with HLS URL and type', () => {
    const hlsUrl =
      'https://customer-xxx.cloudflarestream.com/abc123/manifest/video.m3u8'
    const videoBlock = createBaseVideoBlock({
      source: VideoBlockSource.internal,
      mediaVideo: {
        __typename: 'Video',
        id: 'video-id',
        title: [],
        images: [],
        variant: {
          __typename: 'VideoVariant',
          id: 'variant-id',
          hls: hlsUrl
        },
        variantLanguages: []
      }
    })

    render(<VideoPreviewPlayer videoBlock={videoBlock} />, { container })

    const source = document.querySelector(
      `source[src="${hlsUrl}"][type="application/x-mpegURL"]`
    )
    expect(source).toBeInTheDocument()
  })

  it('renders VideoPreviewPlayer-unsupported when no source type matches', () => {
    const videoBlock = createBaseVideoBlock({
      source: VideoBlockSource.youTube,
      videoId: null,
      mediaVideo: null
    })

    render(<VideoPreviewPlayer videoBlock={videoBlock} />, { container })

    expect(
      screen.getByTestId('VideoPreviewPlayer-unsupported')
    ).toBeInTheDocument()
  })

  it('renders VideoPreviewPlayer-unsupported when source is internal but mediaVideo is not Video', () => {
    const videoBlock = createBaseVideoBlock({
      source: VideoBlockSource.internal,
      mediaVideo: {
        __typename: 'MuxVideo',
        id: 'mux-id',
        assetId: null,
        playbackId: null
      }
    })

    render(<VideoPreviewPlayer videoBlock={videoBlock} />, { container })

    expect(
      screen.getByTestId('VideoPreviewPlayer-unsupported')
    ).toBeInTheDocument()
  })

  it('calls getVideoPoster with videoBlock and passes result as poster to videojs', () => {
    const posterUrl = 'https://image.mux.com/playback-123/thumbnail.png?time=1'
    mockGetVideoPoster.mockReturnValue(posterUrl)

    const videoBlock = createBaseVideoBlock({
      source: VideoBlockSource.mux,
      mediaVideo: {
        __typename: 'MuxVideo',
        id: 'mux-id',
        assetId: null,
        playbackId: 'playback-123'
      }
    })

    render(<VideoPreviewPlayer videoBlock={videoBlock} />, { container })

    expect(mockGetVideoPoster).toHaveBeenCalledWith(videoBlock)
    expect(mockVideojs).toHaveBeenCalledWith(
      expect.any(HTMLVideoElement),
      expect.objectContaining({
        poster: posterUrl
      })
    )
  })

  it('passes undefined poster to videojs when getVideoPoster returns undefined', () => {
    mockGetVideoPoster.mockReturnValue(undefined)

    const videoBlock = createBaseVideoBlock({
      source: VideoBlockSource.youTube,
      videoId: 'abc123',
      image: null
    })

    render(<VideoPreviewPlayer videoBlock={videoBlock} />, { container })

    expect(mockVideojs).toHaveBeenCalledWith(
      expect.any(HTMLVideoElement),
      expect.objectContaining({
        poster: undefined
      })
    )
  })

  it('calls dispose exactly once on unmount when player is not disposed', () => {
    const mockDispose = jest.fn()
    mockVideojs.mockImplementationOnce(() => ({
      isDisposed: () => false,
      dispose: mockDispose
    }))

    const videoBlock = createBaseVideoBlock({
      source: VideoBlockSource.youTube,
      videoId: 'abc123'
    })

    const { unmount } = render(<VideoPreviewPlayer videoBlock={videoBlock} />, {
      container
    })

    unmount()

    expect(mockDispose).toHaveBeenCalledTimes(1)
  })

  it('does not call dispose when player is already disposed', () => {
    const mockDispose = jest.fn()
    mockVideojs.mockImplementationOnce(() => ({
      isDisposed: () => true,
      dispose: mockDispose
    }))

    const videoBlock = createBaseVideoBlock({
      source: VideoBlockSource.youTube,
      videoId: 'abc123'
    })

    const { unmount } = render(<VideoPreviewPlayer videoBlock={videoBlock} />, {
      container
    })

    unmount()

    expect(mockDispose).not.toHaveBeenCalled()
  })

  it('renders video preview region with aria-label', () => {
    const videoBlock = createBaseVideoBlock({
      source: VideoBlockSource.youTube,
      videoId: 'abc123'
    })

    render(<VideoPreviewPlayer videoBlock={videoBlock} />, { container })

    expect(
      screen.getByRole('region', { name: 'Video preview' })
    ).toBeInTheDocument()
  })
})
