import { fireEvent, render, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'

import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'
import { mswServer } from '../../../../../../../../../test/mswServer'
import {
  getVideosLoading,
  getVideosWithOffsetAndUrl
} from '../VideoFromYouTube.handlers'

import { YouTubeDetails } from '.'

jest.mock('../../../../../../../../libs/useYouTubeClosedCaptions', () => ({
  useYouTubeClosedCaptions: jest.fn()
}))

jest.mock('video.js', () => {
  const mockPlayer = {
    on: jest.fn(),
    dispose: jest.fn(),
    tech_: {
      ytPlayer: {
        loadModule: jest.fn(),
        setOption: jest.fn()
      }
    }
  }
  return jest.fn(() => mockPlayer)
})

const mockUseYouTubeClosedCaptions = jest.requireMock(
  '../../../../../../../../libs/useYouTubeClosedCaptions'
).useYouTubeClosedCaptions

const mockVideoJs = jest.requireMock('video.js')

describe('YouTubeDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseYouTubeClosedCaptions.mockReturnValue({
      languages: [],
      loading: false,
      error: undefined
    })
  })

  it('should render loading state', () => {
    mswServer.use(getVideosLoading)
    const { getByTestId } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
      </SWRConfig>
    )
    const container = getByTestId('YoutubeDetails')
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
  })

  it('should render details of a video', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    const { getByText, getByRole } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
      </SWRConfig>
    )
    await waitFor(() =>
      expect(
        getByRole('heading', { name: 'Blessing and Curse' })
      ).toBeInTheDocument()
    )
    expect(
      getByText(
        'Trace the theme of blessing and curse in the Bible to see how Jesus defeats the curse and restores the blessing of life to creation.'
      )
    ).toBeInTheDocument()
  })

  it('should initialize video player with correct source and poster', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    const { getByRole } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
      </SWRConfig>
    )

    await waitFor(() =>
      expect(
        getByRole('heading', { name: 'Blessing and Curse' })
      ).toBeInTheDocument()
    )

    const videoElement = document.querySelector('video')
    expect(videoElement).toBeInTheDocument()
    const sourceTag = videoElement?.querySelector('source')
    expect(sourceTag?.getAttribute('src')).toBe(
      'https://www.youtube.com/watch?v=jQaeIJOA6J0'
    )
    expect(sourceTag?.getAttribute('type')).toBe('video/youtube')

    expect(mockVideoJs).toHaveBeenCalledWith(
      expect.any(HTMLVideoElement),
      expect.objectContaining({
        fluid: true,
        controls: true,
        poster: 'https://i.ytimg.com/vi/jQaeIJOA6J0/default.jpg'
      })
    )
  })

  it('should display video duration', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    const { getByText } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
      </SWRConfig>
    )

    await waitFor(() => expect(getByText('06:03')).toBeInTheDocument())
  })

  it('should call onSelect on select click', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    const onSelect = jest.fn()
    const { getByRole } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <YouTubeDetails id="jQaeIJOA6J0" open onSelect={onSelect} />
      </SWRConfig>
    )
    await waitFor(() =>
      expect(
        getByRole('heading', { name: 'Blessing and Curse' })
      ).toBeInTheDocument()
    )
    fireEvent.click(getByRole('button', { name: 'Select' }))
    expect(onSelect).toHaveBeenCalledWith({
      endAt: 363,
      startAt: 0,
      source: VideoBlockSource.youTube,
      videoId: 'jQaeIJOA6J0'
    })
  })

  it('should fetch closed captions when open', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
      </SWRConfig>
    )

    await waitFor(() => {
      expect(mockUseYouTubeClosedCaptions).toHaveBeenCalledWith({
        videoId: 'jQaeIJOA6J0',
        enabled: true
      })
    })
  })

  it('should initialize video player with subtitle options when activeVideoBlock has subtitleLanguageId', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    mockUseYouTubeClosedCaptions.mockReturnValue({
      languages: [
        { id: 'lang1', bcp47: 'en', name: { value: 'English', primary: true } },
        { id: 'lang2', bcp47: 'es', name: { value: 'Spanish', primary: false } }
      ],
      loading: false,
      error: undefined
    })

    const activeVideoBlock = {
      id: 'video1',
      __typename: 'VideoBlock' as const,
      parentBlockId: null,
      parentOrder: 0,
      muted: false,
      autoplay: false,
      startAt: 0,
      endAt: null,
      posterBlockId: null,
      fullsize: false,
      videoId: 'jQaeIJOA6J0',
      videoVariantLanguageId: null,
      source: VideoBlockSource.youTube,
      title: null,
      description: null,
      image: null,
      duration: null,
      objectFit: null,
      subtitleLanguageId: 'lang2',
      mediaVideo: null,
      action: null,
      children: []
    }

    const { getByRole } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <YouTubeDetails
          id="jQaeIJOA6J0"
          open
          onSelect={jest.fn()}
          activeVideoBlock={activeVideoBlock}
        />
      </SWRConfig>
    )

    await waitFor(() =>
      expect(
        getByRole('heading', { name: 'Blessing and Curse' })
      ).toBeInTheDocument()
    )

    expect(mockVideoJs).toHaveBeenCalledWith(
      expect.any(HTMLVideoElement),
      expect.objectContaining({
        youtube: {
          cc_load_policy: 1,
          cc_lang_pref: 'es'
        },
        fluid: true,
        controls: true
      })
    )
  })

  it('should initialize video player without subtitle options when no subtitleLanguageId', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    mockUseYouTubeClosedCaptions.mockReturnValue({
      languages: [
        { id: 'lang1', bcp47: 'en', name: { value: 'English', primary: true } }
      ],
      loading: false,
      error: undefined
    })

    const { getByRole } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
      </SWRConfig>
    )

    await waitFor(() =>
      expect(
        getByRole('heading', { name: 'Blessing and Curse' })
      ).toBeInTheDocument()
    )

    expect(mockVideoJs).toHaveBeenCalledWith(
      expect.any(HTMLVideoElement),
      expect.objectContaining({
        fluid: true,
        controls: true
      })
    )
    expect(mockVideoJs).toHaveBeenCalledWith(
      expect.any(HTMLVideoElement),
      expect.not.objectContaining({
        youtube: expect.anything()
      })
    )
  })

  it('should set up playing event handler on video player', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    const { getByRole } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
      </SWRConfig>
    )

    await waitFor(() =>
      expect(
        getByRole('heading', { name: 'Blessing and Curse' })
      ).toBeInTheDocument()
    )

    const mockPlayer = mockVideoJs.mock.results[0].value
    expect(mockPlayer.on).toHaveBeenCalledWith('playing', expect.any(Function))
  })

  it('should disable select button while loading', () => {
    mswServer.use(getVideosLoading)
    const { getByRole } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
      </SWRConfig>
    )

    const selectButton = getByRole('button', { name: 'Select' })
    expect(selectButton).toBeDisabled()
  })

  it('should not fetch data when not open', () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    const { getByTestId } = render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <YouTubeDetails id="jQaeIJOA6J0" open={false} onSelect={jest.fn()} />
      </SWRConfig>
    )

    const container = getByTestId('YoutubeDetails')
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
  })
})
