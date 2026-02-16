import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { useYouTubeClosedCaptions } from '@core/journeys/ui/useYouTubeClosedCaptions'

import type { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../__generated__/BlockFields'
import {
  VideoBlockObjectFit as ObjectFit,
  VideoBlockSource
} from '../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../ThemeProvider'

import { GET_MY_GENERATED_MUX_SUBTITLE_TRACK } from './MuxSubtitles/MuxSubtitleSwitch'

import { VideoBlockEditorSettings } from '.'

jest.mock('@core/journeys/ui/useYouTubeClosedCaptions', () => ({
  useYouTubeClosedCaptions: jest.fn()
}))

jest.mock('../../../../../../../libs/validateMuxLanguage', () => ({
  validateMuxLanguage: jest.fn()
}))

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

const mockUseYouTubeClosedCaptions =
  useYouTubeClosedCaptions as jest.MockedFunction<
    typeof useYouTubeClosedCaptions
  >

const { validateMuxLanguage } = jest.requireMock(
  '../../../../../../../libs/validateMuxLanguage'
)

const mockSubtitleTrackReady: MockedResponse = {
  request: {
    query: GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
    variables: {
      muxVideoId: 'mux-video-id',
      bcp47: 'en'
    }
  },
  result: {
    data: {
      getMyGeneratedMuxSubtitleTrack: {
        __typename: 'QueryGetMyGeneratedMuxSubtitleTrackSuccess',
        data: {
          id: 'subtitle-track-1',
          status: 'ready'
        }
      }
    }
  }
}

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
  eventLabel: null,
  endEventLabel: null,
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
    validateMuxLanguage.mockReturnValue(true)
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
      expect(onChange).toHaveBeenCalledWith(
        {
          autoplay: false,
          muted: true,
          endAt: 60,
          startAt: 0,
          objectFit: ObjectFit.fill,
          subtitleLanguageId: null
        },
        false
      )
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
      expect(onChange).toHaveBeenCalledWith(
        {
          autoplay: true,
          muted: false,
          endAt: 60,
          startAt: 0,
          objectFit: ObjectFit.fill,
          subtitleLanguageId: null
        },
        false
      )
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
      expect(onChange).toHaveBeenCalledWith(
        {
          autoplay: true,
          muted: true,
          endAt: 60,
          startAt: 11,
          objectFit: ObjectFit.fill,
          subtitleLanguageId: null
        },
        false
      )
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
      expect(onChange).toHaveBeenCalledWith(
        {
          autoplay: true,
          muted: true,
          endAt: 11,
          startAt: 0,
          objectFit: ObjectFit.fill,
          subtitleLanguageId: null
        },
        false
      )
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
      expect(onChange).toHaveBeenCalledWith(
        {
          autoplay: true,
          muted: true,
          endAt: 60,
          startAt: 0,
          objectFit: ObjectFit.fit,
          subtitleLanguageId: null
        },
        false
      )
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
      expect(onChange).toHaveBeenCalledWith(
        {
          autoplay: true,
          muted: true,
          endAt: 10,
          startAt: 0,
          objectFit: ObjectFit.fill,
          subtitleLanguageId: null
        },
        false
      )
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
    const { getByRole } = render(
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

    const select = getByRole('combobox')
    fireEvent.mouseDown(select)
    const listbox = screen.getByRole('listbox')
    const option = screen.getByText('English')
    fireEvent.click(option)

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        {
          autoplay: true,
          muted: true,
          endAt: 60,
          startAt: 0,
          objectFit: ObjectFit.fill,
          subtitleLanguageId: 'lang-en'
        },
        false
      )
    })
  })

  it('updates subtitle language when changed', async () => {
    mockUseYouTubeClosedCaptions.mockReturnValue({
      languages: mockYouTubeLanguages,
      loading: false,
      error: undefined
    })

    const onChange = jest.fn()
    const { getByRole } = render(
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

    const select = getByRole('combobox')
    fireEvent.mouseDown(select)
    const listbox = screen.getByRole('listbox')
    const option = screen.getByText('English')
    fireEvent.click(option)

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        {
          autoplay: true,
          muted: true,
          endAt: 60,
          startAt: 0,
          objectFit: ObjectFit.fill,
          subtitleLanguageId: 'lang-en'
        },
        false
      )
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
    it('should render MuxSubtitleSwitch for Mux videos', async () => {
      const { getByTestId } = render(
        <ThemeProvider>
          <MockedProvider mocks={[mockSubtitleTrackReady]}>
            <SnackbarProvider>
              <JourneyProvider
                value={{
                  journey: {
                    __typename: 'Journey',
                    language: { bcp47: 'en', id: '529' }
                  } as Journey
                }}
              >
                <EditorProvider
                  initialState={{
                    selectedBlock: {
                      ...video,
                      source: VideoBlockSource.mux,
                      mediaVideo: {
                        __typename: 'MuxVideo',
                        id: 'mux-video-id',
                        assetId: 'asset-id',
                        playbackId: 'playback-id'
                      }
                    }
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
                </EditorProvider>
              </JourneyProvider>
            </SnackbarProvider>
          </MockedProvider>
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(getByTestId('MuxSubtitleSwitch')).toBeInTheDocument()
      })
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

      expect(queryByTestId('MuxSubtitleSwitch')).not.toBeInTheDocument()
    })

    it('should call onChange with showGeneratedSubtitles and subtitleLanguageId when MuxSubtitleSwitch is toggled on', async () => {
      const onChange = jest.fn()
      const mockJourney: Journey = {
        __typename: 'Journey',
        language: { bcp47: 'en', id: '529' }
      } as Journey

      const muxVideoBlock = {
        ...video,
        source: VideoBlockSource.mux,
        mediaVideo: {
          __typename: 'MuxVideo' as const,
          id: 'mux-video-id',
          assetId: 'asset-id',
          playbackId: 'playback-id'
        }
      }

      const { getByTestId } = render(
        <ThemeProvider>
          <MockedProvider mocks={[mockSubtitleTrackReady]}>
            <SnackbarProvider>
              <JourneyProvider
                value={{
                  journey: mockJourney
                }}
              >
                <EditorProvider
                  initialState={{
                    selectedBlock: muxVideoBlock
                  }}
                >
                  <VideoBlockEditorSettings
                    selectedBlock={muxVideoBlock}
                    posterBlock={null}
                    onChange={onChange}
                  />
                </EditorProvider>
              </JourneyProvider>
            </SnackbarProvider>
          </MockedProvider>
        </ThemeProvider>
      )

      // Wait for the switch to be enabled (after GraphQL query completes)
      let switchElement: HTMLElement
      await waitFor(
        () => {
          switchElement = getByTestId('MuxSubtitleSwitch')
          expect(switchElement).toBeInTheDocument()
          // Check if the input inside is not disabled
          const input = switchElement.querySelector(
            'input[type="checkbox"]'
          ) as HTMLInputElement
          expect(input).toBeInTheDocument()
          expect(input).not.toBeDisabled()
        },
        { timeout: 3000 }
      )

      // Click on the actual input element inside the switch
      const input = switchElement!.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement
      await userEvent.click(input)

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          {
            autoplay: true,
            muted: true,
            endAt: 60,
            startAt: 0,
            objectFit: ObjectFit.fill,
            showGeneratedSubtitles: true,
            subtitleLanguageId: '529'
          },
          false
        )
      })
    })

    it('should call onChange with showGeneratedSubtitles false and subtitleLanguageId null when MuxSubtitleSwitch is toggled off', async () => {
      const onChange = jest.fn()
      const mockJourney: Journey = {
        __typename: 'Journey',
        language: { bcp47: 'en', id: '529' }
      } as Journey

      const muxVideoBlock = {
        ...video,
        source: VideoBlockSource.mux,
        showGeneratedSubtitles: true,
        mediaVideo: {
          __typename: 'MuxVideo' as const,
          id: 'mux-video-id',
          assetId: 'asset-id',
          playbackId: 'playback-id'
        }
      }

      const { getByTestId } = render(
        <ThemeProvider>
          <MockedProvider mocks={[mockSubtitleTrackReady]}>
            <SnackbarProvider>
              <JourneyProvider
                value={{
                  journey: mockJourney
                }}
              >
                <EditorProvider
                  initialState={{
                    selectedBlock: muxVideoBlock
                  }}
                >
                  <VideoBlockEditorSettings
                    selectedBlock={muxVideoBlock}
                    posterBlock={null}
                    onChange={onChange}
                  />
                </EditorProvider>
              </JourneyProvider>
            </SnackbarProvider>
          </MockedProvider>
        </ThemeProvider>
      )

      // Wait for the switch to be enabled (after GraphQL query completes)
      let switchElement: HTMLElement
      await waitFor(
        () => {
          switchElement = getByTestId('MuxSubtitleSwitch')
          expect(switchElement).toBeInTheDocument()
          // Check if the input inside is not disabled
          const input = switchElement.querySelector(
            'input[type="checkbox"]'
          ) as HTMLInputElement
          expect(input).toBeInTheDocument()
          expect(input).not.toBeDisabled()
        },
        { timeout: 3000 }
      )

      // Switch should be checked initially (because showGeneratedSubtitles: true)
      const input = switchElement!.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement
      await waitFor(() => {
        expect(input).toBeChecked()
      })

      // Click on the actual input element to toggle off
      await userEvent.click(input)

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          {
            autoplay: true,
            muted: true,
            endAt: 60,
            startAt: 0,
            objectFit: ObjectFit.fill,
            showGeneratedSubtitles: false,
            subtitleLanguageId: null
          },
          false
        )
      })
    })

    it('should handle missing journey when MuxSubtitleSwitch is toggled', async () => {
      const onChange = jest.fn()
      // When journey is missing, journeyLanguageCode is undefined
      // This causes the GraphQL query to be skipped (because journeyLanguageCode == null)
      // So subtitleStatus is null, which means the switch will be disabled
      // This is the expected behavior - the switch should be disabled when there's no journey

      const muxVideoBlock = {
        ...video,
        source: VideoBlockSource.mux,
        mediaVideo: {
          __typename: 'MuxVideo' as const,
          id: 'mux-video-id',
          assetId: 'asset-id',
          playbackId: 'playback-id'
        }
      }

      const { getByTestId } = render(
        <ThemeProvider>
          <MockedProvider>
            <SnackbarProvider>
              <JourneyProvider
                value={{
                  journey: undefined
                }}
              >
                <EditorProvider
                  initialState={{
                    selectedBlock: muxVideoBlock
                  }}
                >
                  <VideoBlockEditorSettings
                    selectedBlock={muxVideoBlock}
                    posterBlock={null}
                    onChange={onChange}
                  />
                </EditorProvider>
              </JourneyProvider>
            </SnackbarProvider>
          </MockedProvider>
        </ThemeProvider>
      )

      // Wait for the switch to render
      await waitFor(() => {
        const switchElement = getByTestId('MuxSubtitleSwitch')
        expect(switchElement).toBeInTheDocument()
      })

      const switchElement = getByTestId('MuxSubtitleSwitch')
      const input = switchElement.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement

      // When journey is missing, the switch should be disabled
      // because the GraphQL query is skipped (journeyLanguageCode == null)
      // and subtitleStatus is null
      expect(input).toBeDisabled()

      // Verify that onChange is never called when the switch is disabled
      expect(onChange).not.toHaveBeenCalled()
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
        expect(onChange).toHaveBeenCalledWith(
          {
            autoplay: true,
            muted: true,
            endAt: 60,
            startAt: 5,
            objectFit: ObjectFit.fill,
            subtitleLanguageId: null
          },
          false
        )
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

      expect(getByTestId('VideoBlockEditorSettingsPoster')).toBeInTheDocument()
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
        expect(onChange).toHaveBeenCalledWith(
          {
            autoplay: true,
            muted: true,
            endAt: 60,
            startAt: 0,
            objectFit: ObjectFit.zoomed,
            subtitleLanguageId: null
          },
          false
        )
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
