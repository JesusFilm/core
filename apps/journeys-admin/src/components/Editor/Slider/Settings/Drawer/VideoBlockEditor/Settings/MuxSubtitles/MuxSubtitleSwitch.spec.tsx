import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_VideoBlock as VideoBlock } from '../../../../../../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'
import { MuxVideoUploadProvider } from '../../../../../../../MuxVideoUploadProvider'

import {
  GET_MY_GENERATED_MUX_SUBTITLE_TRACK,
  MuxSubtitleSwitch
} from './MuxSubtitleSwitch'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

jest.mock('../../../../../../../../libs/validateMuxLanguage', () => ({
  validateMuxLanguage: jest.fn()
}))

const { validateMuxLanguage } = jest.requireMock(
  '../../../../../../../../libs/validateMuxLanguage'
)

const mockVideoBlock: TreeBlock<VideoBlock> = {
  __typename: 'VideoBlock',
  id: 'video-1',
  parentBlockId: 'card-1',
  parentOrder: 0,
  muted: false,
  autoplay: true,
  startAt: 0,
  endAt: 100,
  posterBlockId: null,
  fullsize: true,
  action: null,
  videoId: 'mux-video-id',
  videoVariantLanguageId: '529',
  source: VideoBlockSource.mux,
  title: null,
  description: null,
  duration: null,
  image: null,
  objectFit: null,
  children: [],
  subtitleLanguage: null,
  showGeneratedSubtitles: false,
  eventLabel: null,
  endEventLabel: null,
  customizable: null,
  mediaVideo: null
}

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

const mockSubtitleTrackProcessing: MockedResponse = {
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
          status: 'processing'
        }
      }
    }
  }
}

const mockSubtitleTrackErrored: MockedResponse = {
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
          status: 'errored'
        }
      }
    }
  }
}

const mockSubtitleTrackError: MockedResponse = {
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
        __typename: 'Error',
        message: 'Failed to fetch subtitle track'
      }
    }
  }
}

describe('MuxSubtitleSwitch', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    validateMuxLanguage.mockReturnValue(true)
  })

  it('renders the subtitles switch with label', () => {
    render(
      <MockedProvider mocks={[mockSubtitleTrackReady]}>
        <EditorProvider initialState={{ selectedBlock: mockVideoBlock }}>
          <MuxSubtitleSwitch
            videoBlockId="video-1"
            muxVideoId="mux-video-id"
            journeyLanguageBcp47="en"
            onChange={mockOnChange}
          />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Subtitles')).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Subtitles' })
    ).toBeInTheDocument()
  })

  it('disables switch when language is invalid', async () => {
    validateMuxLanguage.mockReturnValue(false)

    render(
      <MockedProvider mocks={[mockSubtitleTrackReady]}>
        <EditorProvider initialState={{ selectedBlock: mockVideoBlock }}>
          <MuxSubtitleSwitch
            videoBlockId="video-1"
            muxVideoId="mux-video-id"
            journeyLanguageBcp47="ja"
            onChange={mockOnChange}
          />
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeDisabled()
    })
    expect(
      screen.getByText('Subtitles not available for this video language')
    ).toBeInTheDocument()
  })

  it('disables switch and shows message when subtitle is processing', async () => {
    const videoBlockWithNullSubtitles: TreeBlock<VideoBlock> = {
      ...mockVideoBlock,
      showGeneratedSubtitles: null
    }

    render(
      <MockedProvider mocks={[mockSubtitleTrackProcessing]}>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <EditorProvider
              initialState={{ selectedBlock: videoBlockWithNullSubtitles }}
            >
              <MuxSubtitleSwitch
                videoBlockId="video-1"
                muxVideoId="mux-video-id"
                journeyLanguageBcp47="en"
                onChange={mockOnChange}
              />
            </EditorProvider>
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeDisabled()
    })
    expect(
      screen.getByText(
        'Auto subtitle generation in progress, please try again later'
      )
    ).toBeInTheDocument()
  })

  it('disables switch when subtitle track is errored', async () => {
    const videoBlockWithNullSubtitles: TreeBlock<VideoBlock> = {
      ...mockVideoBlock,
      showGeneratedSubtitles: null
    }

    render(
      <MockedProvider mocks={[mockSubtitleTrackErrored]}>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <EditorProvider
              initialState={{ selectedBlock: videoBlockWithNullSubtitles }}
            >
              <MuxSubtitleSwitch
                videoBlockId="video-1"
                muxVideoId="mux-video-id"
                journeyLanguageBcp47="en"
                onChange={mockOnChange}
              />
            </EditorProvider>
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeDisabled()
    })
  })

  it('disables switch when subtitle track query errors', async () => {
    const videoBlockWithNullSubtitles: TreeBlock<VideoBlock> = {
      ...mockVideoBlock,
      showGeneratedSubtitles: null
    }

    render(
      <MockedProvider mocks={[mockSubtitleTrackError]}>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <EditorProvider
              initialState={{ selectedBlock: videoBlockWithNullSubtitles }}
            >
              <MuxSubtitleSwitch
                videoBlockId="video-1"
                muxVideoId="mux-video-id"
                journeyLanguageBcp47="en"
                onChange={mockOnChange}
              />
            </EditorProvider>
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeDisabled()
    })
  })

  it('sets switch checked when video block has showGeneratedSubtitles true', async () => {
    const videoBlockWithSubtitles: TreeBlock<VideoBlock> = {
      ...mockVideoBlock,
      showGeneratedSubtitles: true
    }

    render(
      <MockedProvider mocks={[mockSubtitleTrackReady]}>
        <EditorProvider
          initialState={{ selectedBlock: videoBlockWithSubtitles }}
        >
          <MuxSubtitleSwitch
            videoBlockId="video-1"
            muxVideoId="mux-video-id"
            journeyLanguageBcp47="en"
            onChange={mockOnChange}
          />
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeChecked()
    })
  })

  it('calls onChange with true when switch is toggled on', async () => {
    mockOnChange.mockResolvedValue(undefined)

    render(
      <MockedProvider mocks={[mockSubtitleTrackReady]}>
        <EditorProvider initialState={{ selectedBlock: mockVideoBlock }}>
          <MuxSubtitleSwitch
            videoBlockId="video-1"
            muxVideoId="mux-video-id"
            journeyLanguageBcp47="en"
            onChange={mockOnChange}
          />
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).not.toBeDisabled()
    })

    const switchElement = screen.getByRole('checkbox')
    fireEvent.click(switchElement)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(true)
    })
  })

  it('calls onChange with false when switch is toggled off', async () => {
    mockOnChange.mockResolvedValue(undefined)
    const videoBlockWithSubtitles: TreeBlock<VideoBlock> = {
      ...mockVideoBlock,
      showGeneratedSubtitles: true
    }

    render(
      <MockedProvider mocks={[mockSubtitleTrackReady]}>
        <EditorProvider
          initialState={{ selectedBlock: videoBlockWithSubtitles }}
        >
          <MuxSubtitleSwitch
            videoBlockId="video-1"
            muxVideoId="mux-video-id"
            journeyLanguageBcp47="en"
            onChange={mockOnChange}
          />
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    const switchElement = screen.getByRole('checkbox')
    fireEvent.click(switchElement)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(false)
    })
  })

  it('reverts switch state when onChange fails', async () => {
    mockOnChange.mockRejectedValue(new Error('Failed to update'))

    render(
      <MockedProvider mocks={[mockSubtitleTrackReady]}>
        <EditorProvider initialState={{ selectedBlock: mockVideoBlock }}>
          <MuxSubtitleSwitch
            videoBlockId="video-1"
            muxVideoId="mux-video-id"
            journeyLanguageBcp47="en"
            onChange={mockOnChange}
          />
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).not.toBeDisabled()
    })

    const switchElement = screen.getByRole('checkbox')
    fireEvent.click(switchElement)

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(true)
    })

    // Switch should revert back to unchecked
    await waitFor(() => {
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })
  })

  it('does not call onChange when videoBlockId is null', async () => {
    render(
      <MockedProvider mocks={[mockSubtitleTrackReady]}>
        <EditorProvider initialState={{ selectedBlock: mockVideoBlock }}>
          <MuxSubtitleSwitch
            videoBlockId={null}
            muxVideoId="mux-video-id"
            journeyLanguageBcp47="en"
            onChange={mockOnChange}
          />
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).not.toBeDisabled()
    })

    const switchElement = screen.getByRole('checkbox')
    fireEvent.click(switchElement)

    await waitFor(() => {
      expect(mockOnChange).not.toHaveBeenCalled()
    })
  })

  it('automatically turns off switch when language becomes invalid', async () => {
    mockOnChange.mockResolvedValue(undefined)
    const videoBlockWithSubtitles: TreeBlock<VideoBlock> = {
      ...mockVideoBlock,
      showGeneratedSubtitles: true
    }

    const { rerender } = render(
      <MockedProvider mocks={[mockSubtitleTrackReady]}>
        <EditorProvider
          initialState={{ selectedBlock: videoBlockWithSubtitles }}
        >
          <MuxSubtitleSwitch
            videoBlockId="video-1"
            muxVideoId="mux-video-id"
            journeyLanguageBcp47="en"
            onChange={mockOnChange}
          />
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    // Change to invalid language
    validateMuxLanguage.mockReturnValue(false)

    rerender(
      <MockedProvider mocks={[mockSubtitleTrackReady]}>
        <EditorProvider
          initialState={{ selectedBlock: videoBlockWithSubtitles }}
        >
          <MuxSubtitleSwitch
            videoBlockId="video-1"
            muxVideoId="mux-video-id"
            journeyLanguageBcp47="ja"
            onChange={mockOnChange}
          />
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(false)
    })
  })

  it('reverts switch when automatic turn off fails', async () => {
    mockOnChange.mockRejectedValue(new Error('Failed to update'))
    const videoBlockWithSubtitles: TreeBlock<VideoBlock> = {
      ...mockVideoBlock,
      showGeneratedSubtitles: true
    }

    const { rerender } = render(
      <MockedProvider mocks={[mockSubtitleTrackReady]}>
        <EditorProvider
          initialState={{ selectedBlock: videoBlockWithSubtitles }}
        >
          <MuxSubtitleSwitch
            videoBlockId="video-1"
            muxVideoId="mux-video-id"
            journeyLanguageBcp47="en"
            onChange={mockOnChange}
          />
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    // Change to invalid language
    validateMuxLanguage.mockReturnValue(false)

    rerender(
      <MockedProvider mocks={[mockSubtitleTrackReady]}>
        <EditorProvider
          initialState={{ selectedBlock: videoBlockWithSubtitles }}
        >
          <MuxSubtitleSwitch
            videoBlockId="video-1"
            muxVideoId="mux-video-id"
            journeyLanguageBcp47="ja"
            onChange={mockOnChange}
          />
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(false)
    })

    // Switch should revert back to checked
    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeChecked()
    })
  })

  it('skips query when muxVideoId is null', async () => {
    const videoBlockWithNullSubtitles: TreeBlock<VideoBlock> = {
      ...mockVideoBlock,
      showGeneratedSubtitles: null
    }

    render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <EditorProvider
              initialState={{ selectedBlock: videoBlockWithNullSubtitles }}
            >
              <MuxSubtitleSwitch
                videoBlockId="video-1"
                muxVideoId={null}
                journeyLanguageBcp47="en"
                onChange={mockOnChange}
              />
            </EditorProvider>
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Subtitles')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeDisabled()
    })
  })

  it('skips query when journeyLanguageCode is null', async () => {
    const videoBlockWithNullSubtitles: TreeBlock<VideoBlock> = {
      ...mockVideoBlock,
      showGeneratedSubtitles: null
    }

    render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <EditorProvider
              initialState={{ selectedBlock: videoBlockWithNullSubtitles }}
            >
              <MuxSubtitleSwitch
                videoBlockId="video-1"
                muxVideoId="mux-video-id"
                journeyLanguageBcp47={null}
                onChange={mockOnChange}
              />
            </EditorProvider>
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Subtitles')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeDisabled()
    })
  })

  it('skips query when language is invalid', () => {
    validateMuxLanguage.mockReturnValue(false)

    render(
      <MockedProvider mocks={[]}>
        <EditorProvider initialState={{ selectedBlock: mockVideoBlock }}>
          <MuxSubtitleSwitch
            videoBlockId="video-1"
            muxVideoId="mux-video-id"
            journeyLanguageBcp47="ja"
            onChange={mockOnChange}
          />
        </EditorProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Subtitles')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('skips query when showGeneratedSubtitles is already set', async () => {
    const videoBlockWithSubtitles: TreeBlock<VideoBlock> = {
      ...mockVideoBlock,
      showGeneratedSubtitles: true
    }

    render(
      <MockedProvider mocks={[]}>
        <EditorProvider
          initialState={{ selectedBlock: videoBlockWithSubtitles }}
        >
          <MuxSubtitleSwitch
            videoBlockId="video-1"
            muxVideoId="mux-video-id"
            journeyLanguageBcp47="en"
            onChange={mockOnChange}
          />
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toBeChecked()
    })

    // Toggle should be enabled since subtitles are ready
    expect(screen.getByRole('checkbox')).not.toBeDisabled()

    // No processing message should be shown
    expect(
      screen.queryByText(
        'Auto subtitle generation in progress, please try again later'
      )
    ).not.toBeInTheDocument()
  })

  it('enables toggle when showGeneratedSubtitles is false (subtitles ready but disabled)', async () => {
    const videoBlockWithSubtitlesDisabled: TreeBlock<VideoBlock> = {
      ...mockVideoBlock,
      showGeneratedSubtitles: false
    }

    render(
      <MockedProvider mocks={[]}>
        <EditorProvider
          initialState={{ selectedBlock: videoBlockWithSubtitlesDisabled }}
        >
          <MuxSubtitleSwitch
            videoBlockId="video-1"
            muxVideoId="mux-video-id"
            journeyLanguageBcp47="en"
            onChange={mockOnChange}
          />
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('checkbox')).not.toBeChecked()
    })

    // Toggle should be enabled since subtitles are ready (just disabled)
    expect(screen.getByRole('checkbox')).not.toBeDisabled()
  })

  it('calls onChange with false when subtitle track becomes ready', async () => {
    mockOnChange.mockResolvedValue(undefined)
    const videoBlockWithNullSubtitles: TreeBlock<VideoBlock> = {
      ...mockVideoBlock,
      showGeneratedSubtitles: null
    }

    render(
      <MockedProvider mocks={[mockSubtitleTrackReady]}>
        <SnackbarProvider>
          <MuxVideoUploadProvider>
            <EditorProvider
              initialState={{ selectedBlock: videoBlockWithNullSubtitles }}
            >
              <MuxSubtitleSwitch
                videoBlockId="video-1"
                muxVideoId="mux-video-id"
                journeyLanguageBcp47="en"
                onChange={mockOnChange}
              />
            </EditorProvider>
          </MuxVideoUploadProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(false)
    })
  })
})
