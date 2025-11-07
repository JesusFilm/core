import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { useYouTubeClosedCaptions } from '@core/journeys/ui/useYouTubeClosedCaptions'

import type { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../__generated__/BlockFields'
import {
  VideoBlockObjectFit as ObjectFit,
  VideoBlockSource
} from '../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../ThemeProvider'

import { VideoBlockEditorSettings } from '.'

jest.mock('@core/journeys/ui/useYouTubeClosedCaptions', () => ({
  useYouTubeClosedCaptions: jest.fn()
}))

jest.mock('./MuxSubtitles', () => ({
  MuxSubtitleSwitch: jest.fn(({ onChange }) => (
    <button
      data-testid="mux-subtitle-switch"
      onClick={() => onChange(true)}
    >
      Mux Subtitle Switch
    </button>
  ))
}))

jest.mock('./Poster/VideoBlockEditorSettingsPoster', () => ({
  VideoBlockEditorSettingsPoster: jest.fn(() => (
    <div data-testid="video-block-editor-settings-poster">Poster Component</div>
  ))
}))

jest.mock('./SubtitleSelector', () => ({
  YouTubeSubtitleSelector: jest.fn(({ onChange, availableLanguages }) => (
    <button
      data-testid="youtube-subtitle-selector"
      onClick={() => onChange('lang-en')}
    >
      YouTube Subtitle Selector
    </button>
  ))
}))

const mockUseYouTubeClosedCaptions =
  useYouTubeClosedCaptions as jest.MockedFunction<
    typeof useYouTubeClosedCaptions
  >

const mockYouTubeLanguages = [
  {
    id: 'lang-en',
    bcp47: 'en',
    name: [
      {
        value: 'English',
        primary: true,
        __typename: 'LanguageName' as const
      }
    ],
    __typename: 'Language' as const
  },
  {
    id: 'lang-es',
    bcp47: 'es',
    name: [
      {
        value: 'Spanish',
        primary: true,
        __typename: 'LanguageName' as const
      }
    ],
    __typename: 'Language' as const
  }
]

const video: TreeBlock<VideoBlock> = {
  id: 'video1.id',
  __typename: 'VideoBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  startAt: 0,
  endAt: 60,
  muted: true,
  autoplay: true,
  fullsize: true,
  action: null,
  videoId: '2_0-FallingPlates',
  videoVariantLanguageId: '529',
  source: VideoBlockSource.internal,
  title: null,
  description: null,
  duration: null,
  image: null,
  mediaVideo: {
    __typename: 'Video',
    id: '2_0-FallingPlates',
    title: [
      {
        __typename: 'VideoTitle',
        value: 'FallingPlates'
      }
    ],
    images: [
      {
        __typename: 'CloudflareImage',
        mobileCinematicHigh:
          'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/2_0-FallingPlates.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
      }
    ],
    variant: {
      __typename: 'VideoVariant',
      id: '2_0-FallingPlates-529',
      hls: 'https://arc.gt/hls/2_0-FallingPlates/529'
    },
    variantLanguages: []
  },
  posterBlockId: null,
  children: [],
  objectFit: null,
  subtitleLanguage: null,
  showGeneratedSubtitles: null
}

describe('VideoBlockEditorSettings', () => {
  beforeEach(() => {
    mockUseYouTubeClosedCaptions.mockReturnValue({
      languages: [],
      loading: false,
      error: undefined
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should disable fields when no selected block', () => {
    const { getByRole } = render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={null}
              posterBlock={null}
              onChange={jest.fn()}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )
    expect(getByRole('checkbox', { name: 'Autoplay' })).toBeDisabled()
    expect(getByRole('checkbox', { name: 'Muted' })).toBeDisabled()
    expect(getByRole('textbox', { name: 'Starts At' })).toBeDisabled()
    expect(getByRole('textbox', { name: 'Ends At' })).toBeDisabled()
  })

  it('should disable some fields when no parent order', () => {
    const { getByRole } = render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={{ ...video, parentOrder: null }}
              posterBlock={null}
              onChange={jest.fn()}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )
    expect(getByRole('checkbox', { name: 'Autoplay' })).toBeDisabled()
    expect(getByRole('checkbox', { name: 'Muted' })).toBeDisabled()
    expect(getByRole('textbox', { name: 'Starts At' })).not.toBeDisabled()
    expect(getByRole('textbox', { name: 'Ends At' })).not.toBeDisabled()
  })

  it('should update autoplay', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={video}
              posterBlock={null}
              onChange={onChange}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )
    fireEvent.click(getByRole('checkbox', { name: 'Autoplay' }))
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        autoplay: false,
        muted: true,
        endAt: 60,
        startAt: 0,
        objectFit: ObjectFit.fill,
        subtitleLanguageId: null
      })
    )
  })

  it('should update muted', async () => {
    const onChange = jest.fn()
    const { getByRole, getByText, queryByText } = render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={video}
              posterBlock={null}
              onChange={onChange}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )

    expect(
      queryByText(
        'Some mobile browsers may override this choice and default the video to play muted when autoplay is enabled'
      )
    ).not.toBeInTheDocument()

    fireEvent.click(getByRole('checkbox', { name: 'Muted' }))
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        autoplay: true,
        muted: false,
        endAt: 60,
        startAt: 0,
        objectFit: ObjectFit.fill,
        subtitleLanguageId: null
      })
    })

    expect(
      getByText(
        'Some mobile browsers may override this choice and default the video to play muted when autoplay is enabled'
      )
    ).toBeInTheDocument()
  })

  it('should update startAt', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={video}
              posterBlock={null}
              onChange={onChange}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )
    const textbox = getByRole('textbox', { name: 'Starts At' })
    fireEvent.change(textbox, { target: { value: '00:00:11' } })
    fireEvent.blur(textbox)
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        autoplay: true,
        muted: true,
        endAt: 60,
        startAt: 11,
        objectFit: ObjectFit.fill,
        subtitleLanguageId: null
      })
    )
  })

  it('should update endAt', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={video}
              posterBlock={null}
              onChange={onChange}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )
    const textbox = getByRole('textbox', { name: 'Ends At' })
    fireEvent.change(textbox, { target: { value: '00:00:11' } })
    fireEvent.blur(textbox)
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        autoplay: true,
        muted: true,
        endAt: 11,
        startAt: 0,
        objectFit: ObjectFit.fill,
        subtitleLanguageId: null
      })
    )
  })

  it('should update objectFit to fit', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={video}
              posterBlock={null}
              onChange={onChange}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )
    fireEvent.click(getByRole('button', { name: 'Fit' }))
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        autoplay: true,
        muted: true,
        endAt: 60,
        startAt: 0,
        objectFit: ObjectFit.fit,
        subtitleLanguageId: null
      })
    })
  })

  it('Aspect ratio buttons should be disabled for youtube video', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={{
                ...video,
                source: VideoBlockSource.youTube,
                objectFit: ObjectFit.fill
              }}
              posterBlock={null}
              onChange={onChange}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )
    expect(getByRole('button', { name: 'Fill' })).toBeDisabled()
    expect(getByRole('button', { name: 'Fit' })).toBeDisabled()
    expect(getByRole('button', { name: 'Fit' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(getByRole('button', { name: 'Crop' })).toBeDisabled()
  })

  it('should disable aspect ratio buttons for microwebsites', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <JourneyProvider
              value={{
                journey: { __typename: 'Journey', website: true } as Journey
              }}
            >
              <VideoBlockEditorSettings
                selectedBlock={{
                  ...video,
                  source: VideoBlockSource.internal,
                  objectFit: ObjectFit.fill
                }}
                posterBlock={null}
                onChange={onChange}
              />
            </JourneyProvider>
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )
    expect(getByRole('button', { name: 'Fill' })).toBeDisabled()
    expect(getByRole('button', { name: 'Fit' })).toBeDisabled()
    expect(getByRole('button', { name: 'Fit' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(getByRole('button', { name: 'Crop' })).toBeDisabled()
  })

  it('should not allow startAt to be greater than endAt', async () => {
    const onChange = jest.fn()
    const { getByRole, getByText } = render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={video}
              posterBlock={null}
              onChange={onChange}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )
    fireEvent.change(getByRole('textbox', { name: 'Ends At' }), {
      target: { value: '00:00:10' }
    })
    fireEvent.blur(getByRole('textbox', { name: 'Ends At' }))
    fireEvent.change(getByRole('textbox', { name: 'Starts At' }), {
      target: { value: '00:00:11' }
    })
    fireEvent.blur(getByRole('textbox', { name: 'Starts At' }))
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        autoplay: true,
        muted: true,
        endAt: 10,
        startAt: 0,
        objectFit: ObjectFit.fill,
        subtitleLanguageId: null
      })
    })
    expect(
      getByText('Start time has to be at least 3 seconds less than end time')
    ).toBeInTheDocument()
  })

  it('shows YouTubeSubtitleSelector for YouTube videos', () => {
    mockUseYouTubeClosedCaptions.mockReturnValue({
      languages: mockYouTubeLanguages,
      loading: false,
      error: undefined
    })

    const { getByText } = render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={{
                ...video,
                source: VideoBlockSource.youTube,
                videoId: 'test-youtube-id'
              }}
              posterBlock={null}
              onChange={jest.fn()}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )

    expect(getByText('Subtitles')).toBeInTheDocument()
  })

  it('does not show YouTubeSubtitleSelector for non-YouTube videos', () => {
    const { queryByText } = render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={{
                ...video,
                source: VideoBlockSource.internal
              }}
              posterBlock={null}
              onChange={jest.fn()}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )

    expect(queryByText('Subtitles')).not.toBeInTheDocument()
  })

  it('updates formik field when subtitle is selected', async () => {
    mockUseYouTubeClosedCaptions.mockReturnValue({
      languages: mockYouTubeLanguages,
      loading: false,
      error: undefined
    })

    const onChange = jest.fn()
    const { getByTestId } = render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={{
                ...video,
                source: VideoBlockSource.youTube,
                videoId: 'test-youtube-id'
              }}
              posterBlock={null}
              onChange={onChange}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )

    fireEvent.click(getByTestId('youtube-subtitle-selector'))

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        autoplay: true,
        muted: true,
        endAt: 60,
        startAt: 0,
        objectFit: ObjectFit.fill,
        subtitleLanguageId: 'lang-en'
      })
    })
  })

  it('updates subtitle language when changed', async () => {
    mockUseYouTubeClosedCaptions.mockReturnValue({
      languages: mockYouTubeLanguages,
      loading: false,
      error: undefined
    })

    const onChange = jest.fn()
    const { getByTestId } = render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={{
                ...video,
                source: VideoBlockSource.youTube,
                videoId: 'test-youtube-id',
                subtitleLanguage: {
                  __typename: 'Language',
                  id: '529',
                  bcp47: 'en'
                }
              }}
              posterBlock={null}
              onChange={onChange}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )

    fireEvent.click(getByTestId('youtube-subtitle-selector'))

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        autoplay: true,
        muted: true,
        endAt: 60,
        startAt: 0,
        objectFit: ObjectFit.fill,
        subtitleLanguageId: 'lang-en'
      })
    })
  })

  it('should call useYouTubeClosedCaptions with skip false for YouTube videos with videoId', () => {
    mockUseYouTubeClosedCaptions.mockReturnValue({
      languages: [],
      loading: false,
      error: undefined
    })

    render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={{
                ...video,
                source: VideoBlockSource.youTube,
                videoId: 'test-youtube-id'
              }}
              posterBlock={null}
              onChange={jest.fn()}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )

    expect(mockUseYouTubeClosedCaptions).toHaveBeenCalledWith({
      videoId: 'test-youtube-id',
      skip: false
    })
  })

  it('should call useYouTubeClosedCaptions with skip true for non-YouTube videos', () => {
    mockUseYouTubeClosedCaptions.mockReturnValue({
      languages: [],
      loading: false,
      error: undefined
    })

    render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={{
                ...video,
                source: VideoBlockSource.internal,
                videoId: 'test-internal-id'
              }}
              posterBlock={null}
              onChange={jest.fn()}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )

    expect(mockUseYouTubeClosedCaptions).toHaveBeenCalledWith({
      videoId: 'test-internal-id',
      skip: true
    })
  })

  it('should call useYouTubeClosedCaptions with skip true when videoId is null', () => {
    mockUseYouTubeClosedCaptions.mockReturnValue({
      languages: [],
      loading: false,
      error: undefined
    })

    render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={{
                ...video,
                source: VideoBlockSource.youTube,
                videoId: null
              }}
              posterBlock={null}
              onChange={jest.fn()}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )

    expect(mockUseYouTubeClosedCaptions).toHaveBeenCalledWith({
      videoId: null,
      skip: true
    })
  })

  describe('Mux Subtitles', () => {
    it('should render MuxSubtitleSwitch for Mux videos', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <MockedProvider>
            <SnackbarProvider>
              <JourneyProvider
                value={{
                  journey: {
                    __typename: 'Journey',
                    language: { bcp47: 'en' }
                  } as Journey
                }}
              >
                <VideoBlockEditorSettings
                  selectedBlock={{
                    ...video,
                    source: VideoBlockSource.mux,
                    mediaVideo: {
                      __typename: 'MuxVideo',
                      id: 'mux-video-id',
                      assetId: 'asset-id',
                      playbackId: 'playback-id'
                    }
                  }}
                  posterBlock={null}
                  onChange={jest.fn()}
                />
              </JourneyProvider>
            </SnackbarProvider>
          </MockedProvider>
        </ThemeProvider>
      )

      expect(getByTestId('mux-subtitle-switch')).toBeInTheDocument()
    })

    it('should not render MuxSubtitleSwitch for non-Mux videos', () => {
      const { queryByTestId } = render(
        <ThemeProvider>
          <MockedProvider>
            <SnackbarProvider>
              <VideoBlockEditorSettings
                selectedBlock={{
                  ...video,
                  source: VideoBlockSource.internal
                }}
                posterBlock={null}
                onChange={jest.fn()}
              />
            </SnackbarProvider>
          </MockedProvider>
        </ThemeProvider>
      )

      expect(queryByTestId('mux-subtitle-switch')).not.toBeInTheDocument()
    })

    it('should call onChange when MuxSubtitleSwitch is toggled', async () => {
      const onChange = jest.fn()
      const { getByTestId } = render(
        <ThemeProvider>
          <MockedProvider>
            <SnackbarProvider>
              <JourneyProvider
                value={{
                  journey: {
                    __typename: 'Journey',
                    language: { bcp47: 'en' }
                  } as Journey
                }}
              >
                <VideoBlockEditorSettings
                  selectedBlock={{
                    ...video,
                    source: VideoBlockSource.mux,
                    mediaVideo: {
                      __typename: 'MuxVideo',
                      id: 'mux-video-id',
                      assetId: 'asset-id',
                      playbackId: 'playback-id'
                    }
                  }}
                  posterBlock={null}
                  onChange={onChange}
                />
              </JourneyProvider>
            </SnackbarProvider>
          </MockedProvider>
        </ThemeProvider>
      )

      fireEvent.click(getByTestId('mux-subtitle-switch'))

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith({ showGeneratedSubtitles: true })
      })
    })
  })

  describe('Timing Validation', () => {
    it('should not allow startAt to exceed video duration - 3 seconds', async () => {
      const onChange = jest.fn()
      const { getByRole } = render(
        <ThemeProvider>
          <MockedProvider>
            <SnackbarProvider>
              <VideoBlockEditorSettings
                selectedBlock={{ ...video, duration: 60 }}
                posterBlock={null}
                onChange={onChange}
              />
            </SnackbarProvider>
          </MockedProvider>
        </ThemeProvider>
      )

      fireEvent.change(getByRole('textbox', { name: 'Starts At' }), {
        target: { value: '00:00:58' }
      })
      fireEvent.blur(getByRole('textbox', { name: 'Starts At' }))

      await waitFor(
        () => {
          expect(onChange).not.toHaveBeenCalled()
        },
        { timeout: 1000 }
      )
    })

    it('should not allow endAt to exceed video duration', async () => {
      const onChange = jest.fn()
      const { getByRole } = render(
        <ThemeProvider>
          <MockedProvider>
            <SnackbarProvider>
              <VideoBlockEditorSettings
                selectedBlock={{ ...video, duration: 60 }}
                posterBlock={null}
                onChange={onChange}
              />
            </SnackbarProvider>
          </MockedProvider>
        </ThemeProvider>
      )

      fireEvent.change(getByRole('textbox', { name: 'Ends At' }), {
        target: { value: '00:01:05' }
      })
      fireEvent.blur(getByRole('textbox', { name: 'Ends At' }))

      await waitFor(
        () => {
          expect(onChange).not.toHaveBeenCalled()
        },
        { timeout: 1000 }
      )
    })

    it('should allow valid timing changes', async () => {
      const onChange = jest.fn()
      const { getByRole } = render(
        <ThemeProvider>
          <MockedProvider>
            <SnackbarProvider>
              <VideoBlockEditorSettings
                selectedBlock={{ ...video, duration: 120 }}
                posterBlock={null}
                onChange={onChange}
              />
            </SnackbarProvider>
          </MockedProvider>
        </ThemeProvider>
      )

      fireEvent.change(getByRole('textbox', { name: 'Starts At' }), {
        target: { value: '00:00:05' }
      })
      fireEvent.blur(getByRole('textbox', { name: 'Starts At' }))

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith({
          autoplay: true,
          muted: true,
          endAt: 60,
          startAt: 5,
          objectFit: ObjectFit.fill,
          subtitleLanguageId: null
        })
      })
    })
  })

  describe('Poster Component', () => {
    it('should render VideoBlockEditorSettingsPoster component', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <MockedProvider>
            <SnackbarProvider>
              <VideoBlockEditorSettings
                selectedBlock={video}
                posterBlock={null}
                onChange={jest.fn()}
              />
            </SnackbarProvider>
          </MockedProvider>
        </ThemeProvider>
      )

      expect(
        getByTestId('video-block-editor-settings-poster')
      ).toBeInTheDocument()
    })
  })

  describe('Component Rendering', () => {
    it('should render with data-testid', () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <MockedProvider>
            <SnackbarProvider>
              <VideoBlockEditorSettings
                selectedBlock={video}
                posterBlock={null}
                onChange={jest.fn()}
              />
            </SnackbarProvider>
          </MockedProvider>
        </ThemeProvider>
      )

      expect(getByTestId('VideoBlockEditorSettings')).toBeInTheDocument()
    })

    it('should render all sections when video is selected', () => {
      const { getByText } = render(
        <ThemeProvider>
          <MockedProvider>
            <SnackbarProvider>
              <VideoBlockEditorSettings
                selectedBlock={video}
                posterBlock={null}
                onChange={jest.fn()}
              />
            </SnackbarProvider>
          </MockedProvider>
        </ThemeProvider>
      )

      expect(getByText('Timing')).toBeInTheDocument()
      expect(getByText('Aspect ratio')).toBeInTheDocument()
      expect(getByText('Autoplay')).toBeInTheDocument()
      expect(getByText('Muted')).toBeInTheDocument()
    })
  })

  describe('ObjectFit (Aspect Ratio)', () => {
    it('should update objectFit to zoomed', async () => {
      const onChange = jest.fn()
      const { getByRole } = render(
        <ThemeProvider>
          <MockedProvider>
            <SnackbarProvider>
              <VideoBlockEditorSettings
                selectedBlock={video}
                posterBlock={null}
                onChange={onChange}
              />
            </SnackbarProvider>
          </MockedProvider>
        </ThemeProvider>
      )

      fireEvent.click(getByRole('button', { name: 'Crop' }))

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith({
          autoplay: true,
          muted: true,
          endAt: 60,
          startAt: 0,
          objectFit: ObjectFit.zoomed,
          subtitleLanguageId: null
        })
      })
    })

    it('should display correct message for YouTube videos', () => {
      const { getByText } = render(
        <ThemeProvider>
          <MockedProvider>
            <SnackbarProvider>
              <VideoBlockEditorSettings
                selectedBlock={{
                  ...video,
                  source: VideoBlockSource.youTube
                }}
                posterBlock={null}
                onChange={jest.fn()}
              />
            </SnackbarProvider>
          </MockedProvider>
        </ThemeProvider>
      )

      expect(
        getByText('This option is not available for YouTube videos')
      ).toBeInTheDocument()
    })

    it('should display correct message for microwebsites', () => {
      const { getByText } = render(
        <ThemeProvider>
          <MockedProvider>
            <SnackbarProvider>
              <JourneyProvider
                value={{
                  journey: { __typename: 'Journey', website: true } as Journey
                }}
              >
                <VideoBlockEditorSettings
                  selectedBlock={video}
                  posterBlock={null}
                  onChange={jest.fn()}
                />
              </JourneyProvider>
            </SnackbarProvider>
          </MockedProvider>
        </ThemeProvider>
      )

      expect(
        getByText('This option is not available for microwebsites')
      ).toBeInTheDocument()
    })
  })
})
