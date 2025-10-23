import { MockedProvider } from '@apollo/client/testing'
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
    off: jest.fn(),
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

jest.mock('notistack', () => ({
  useSnackbar: jest.fn(),
  closeSnackbar: jest.fn()
}))

const mockUseYouTubeClosedCaptions = jest.requireMock(
  '../../../../../../../../libs/useYouTubeClosedCaptions'
).useYouTubeClosedCaptions

const mockVideoJs = jest.requireMock('video.js')

const mockUseSnackbar = jest.requireMock('notistack').useSnackbar
const mockCloseSnackbar = jest.requireMock('notistack').closeSnackbar

describe('YouTubeDetails', () => {
  const mockEnqueueSnackbar = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseYouTubeClosedCaptions.mockReturnValue({
      languages: [],
      loading: false,
      error: undefined
    })
    mockUseSnackbar.mockReturnValue({
      enqueueSnackbar: mockEnqueueSnackbar,
      closeSnackbar: mockCloseSnackbar
    })
  })

  it('should render loading state', () => {
    mswServer.use(getVideosLoading)
    const { getByTestId } = render(
      <MockedProvider mocks={[]}>
        <SWRConfig value={{ provider: () => new Map() }}>
          <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
    )
    const container = getByTestId('YoutubeDetails')
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
  })

  it('should render details of a video', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    const { getByText, getByRole } = render(
      <MockedProvider mocks={[]}>
        <SWRConfig value={{ provider: () => new Map() }}>
          <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
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
      <MockedProvider mocks={[]}>
        <SWRConfig value={{ provider: () => new Map() }}>
          <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
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
      <MockedProvider mocks={[]}>
        <SWRConfig value={{ provider: () => new Map() }}>
          <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
    )

    await waitFor(() => expect(getByText('06:03')).toBeInTheDocument())
  })

  it('should call onSelect on select click', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    const onSelect = jest.fn()
    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <SWRConfig value={{ provider: () => new Map() }}>
          <YouTubeDetails id="jQaeIJOA6J0" open onSelect={onSelect} />
        </SWRConfig>
      </MockedProvider>
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
      <MockedProvider mocks={[]}>
        <SWRConfig value={{ provider: () => new Map() }}>
          <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
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
      <MockedProvider mocks={[]}>
        <SWRConfig value={{ provider: () => new Map() }}>
          <YouTubeDetails
            id="jQaeIJOA6J0"
            open
            onSelect={jest.fn()}
            activeVideoBlock={activeVideoBlock}
          />
        </SWRConfig>
      </MockedProvider>
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
      <MockedProvider mocks={[]}>
        <SWRConfig value={{ provider: () => new Map() }}>
          <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
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
      <MockedProvider mocks={[]}>
        <SWRConfig value={{ provider: () => new Map() }}>
          <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
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
      <MockedProvider mocks={[]}>
        <SWRConfig value={{ provider: () => new Map() }}>
          <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
    )

    const selectButton = getByRole('button', { name: 'Select' })
    expect(selectButton).toBeDisabled()
  })

  it('should not fetch data when not open', () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    const { getByTestId } = render(
      <MockedProvider mocks={[]}>
        <SWRConfig value={{ provider: () => new Map() }}>
          <YouTubeDetails id="jQaeIJOA6J0" open={false} onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
    )

    const container = getByTestId('YoutubeDetails')
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument()
  })

  it('should show snackbar when captions are available but none selected', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    mockUseYouTubeClosedCaptions.mockReturnValue({
      languages: [
        { id: 'lang1', bcp47: 'en', name: { value: 'English', primary: true } },
        { id: 'lang2', bcp47: 'es', name: { value: 'Spanish', primary: false } }
      ],
      loading: false,
      error: undefined
    })

    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <SWRConfig value={{ provider: () => new Map() }}>
          <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        getByRole('heading', { name: 'Blessing and Curse' })
      ).toBeInTheDocument()
    )

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      'Subtitles are available for this video',
      expect.objectContaining({
        variant: 'success',
        preventDuplicate: true,
        autoHideDuration: 4000
      })
    )
  })

  it('should not show snackbar when no captions are available', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    mockUseYouTubeClosedCaptions.mockReturnValue({
      languages: [],
      loading: false,
      error: undefined
    })

    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <SWRConfig value={{ provider: () => new Map() }}>
          <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        getByRole('heading', { name: 'Blessing and Curse' })
      ).toBeInTheDocument()
    )

    expect(mockEnqueueSnackbar).not.toHaveBeenCalled()
  })

  it('should not show snackbar when captions are available and one is selected', async () => {
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
      subtitleLanguageId: 'lang1',
      mediaVideo: null,
      action: null,
      children: []
    }

    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <SWRConfig value={{ provider: () => new Map() }}>
          <YouTubeDetails
            id="jQaeIJOA6J0"
            open
            onSelect={jest.fn()}
            activeVideoBlock={activeVideoBlock}
          />
        </SWRConfig>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        getByRole('heading', { name: 'Blessing and Curse' })
      ).toBeInTheDocument()
    )

    expect(mockEnqueueSnackbar).not.toHaveBeenCalled()
  })

  it('should call closeSnackbar when dismiss button is clicked', async () => {
    mswServer.use(getVideosWithOffsetAndUrl)
    mockUseYouTubeClosedCaptions.mockReturnValue({
      languages: [
        { id: 'lang1', bcp47: 'en', name: { value: 'English', primary: true } }
      ],
      loading: false,
      error: undefined
    })

    const { getByRole } = render(
      <MockedProvider mocks={[]}>
        <SWRConfig value={{ provider: () => new Map() }}>
          <YouTubeDetails id="jQaeIJOA6J0" open onSelect={jest.fn()} />
        </SWRConfig>
      </MockedProvider>
    )

    await waitFor(() =>
      expect(
        getByRole('heading', { name: 'Blessing and Curse' })
      ).toBeInTheDocument()
    )

    expect(mockEnqueueSnackbar).toHaveBeenCalled()

    const enqueueCall = mockEnqueueSnackbar.mock.calls[0]
    const snackbarOptions = enqueueCall[1]
    const actionComponent = snackbarOptions.action('test-snackbar-id')

    const { getByText } = render(actionComponent)
    const dismissButton = getByText('Dismiss')

    fireEvent.click(dismissButton)

    expect(mockCloseSnackbar).toHaveBeenCalledWith('test-snackbar-id')
  })
})
