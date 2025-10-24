import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'

import {
  VideoBlockObjectFit as ObjectFit,
  VideoBlockSource
} from '../../../../../../../../__generated__/globalTypes'
import { ThemeProvider } from '../../../../../../ThemeProvider'

import { VideoBlockEditorSettings } from '.'

jest.mock('../../../../../../../libs/useYouTubeClosedCaptions', () => ({
  useYouTubeClosedCaptions: jest.fn()
}))

const mockUseYouTubeClosedCaptions =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('../../../../../../../libs/useYouTubeClosedCaptions')
    .useYouTubeClosedCaptions as jest.Mock

const mockYouTubeLanguages = [
  {
    id: 'lang-en',
    bcp47: 'en',
    name: [
      {
        value: 'English',
        primary: true,
        __typename: 'YouTubeLanguageName' as const
      }
    ],
    __typename: 'YouTubeLanguage' as const
  },
  {
    id: 'lang-es',
    bcp47: 'es',
    name: [
      {
        value: 'Spanish',
        primary: true,
        __typename: 'YouTubeLanguageName' as const
      }
    ],
    __typename: 'YouTubeLanguage' as const
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
        objectFit: ObjectFit.fill
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
        objectFit: ObjectFit.fill
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
        objectFit: ObjectFit.fill
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
        objectFit: ObjectFit.fill
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
        objectFit: ObjectFit.fit
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
        objectFit: ObjectFit.fill
      })
    })
    expect(
      getByText('Start time has to be at least 3 seconds less than end time')
    ).toBeInTheDocument()
  })

  it('shows SubtitleSelector for YouTube videos', () => {
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

  it('does not show SubtitleSelector for non-YouTube videos', () => {
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

  it('calls onChange with subtitleLanguageId when subtitle is selected', async () => {
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
        subtitleLanguageId: 'lang-en'
      })
    })
  })

  it('clears subtitleLanguageId when videoId changes', async () => {
    mockUseYouTubeClosedCaptions.mockReturnValue({
      languages: mockYouTubeLanguages,
      loading: false,
      error: undefined
    })

    const onChange = jest.fn()
    const { rerender } = render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={{
                ...video,
                source: VideoBlockSource.youTube,
                videoId: 'test-youtube-id-1',
                subtitleLanguage: { __typename: 'Language', id: 'lang-en' }
              }}
              posterBlock={null}
              onChange={onChange}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )

    // Change videoId
    rerender(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={{
                ...video,
                source: VideoBlockSource.youTube,
                videoId: 'test-youtube-id-2',
                subtitleLanguage: { __typename: 'Language', id: 'lang-en' }
              }}
              posterBlock={null}
              onChange={onChange}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        subtitleLanguageId: null
      })
    })
  })

  it('clears subtitleLanguageId when source changes', async () => {
    const onChange = jest.fn()
    const { rerender } = render(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={{
                ...video,
                source: VideoBlockSource.youTube,
                videoId: 'test-youtube-id',
                subtitleLanguage: { __typename: 'Language', id: 'lang-en' }
              }}
              posterBlock={null}
              onChange={onChange}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )

    // Change source (which requires changing videoId too)
    rerender(
      <ThemeProvider>
        <MockedProvider>
          <SnackbarProvider>
            <VideoBlockEditorSettings
              selectedBlock={{
                ...video,
                source: VideoBlockSource.internal,
                videoId: '2_0-FallingPlates',
                subtitleLanguage: { __typename: 'Language', id: 'lang-en' }
              }}
              posterBlock={null}
              onChange={onChange}
            />
          </SnackbarProvider>
        </MockedProvider>
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        subtitleLanguageId: null
      })
    })
  })
})
