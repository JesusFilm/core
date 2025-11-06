import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'
import { useYouTubeClosedCaptions } from '@core/journeys/ui/useYouTubeClosedCaptions'

import {
  VideoBlockObjectFit as ObjectFit,
  VideoBlockSource
} from '../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../ThemeProvider'

import { VideoBlockEditorSettings } from '.'

jest.mock('@core/journeys/ui/useYouTubeClosedCaptions', () => ({
  useYouTubeClosedCaptions: jest.fn()
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

const video: TreeBlock = {
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
  subtitleLanguage: null
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

    const combobox = getByRole('combobox')
    fireEvent.mouseDown(combobox)
    fireEvent.click(getByRole('option', { name: 'English' }))

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

    const combobox = getByRole('combobox')
    fireEvent.mouseDown(combobox)
    fireEvent.click(getByRole('option', { name: 'Spanish' }))

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        autoplay: true,
        muted: true,
        endAt: 60,
        startAt: 0,
        objectFit: ObjectFit.fill,
        subtitleLanguageId: 'lang-es'
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
})
