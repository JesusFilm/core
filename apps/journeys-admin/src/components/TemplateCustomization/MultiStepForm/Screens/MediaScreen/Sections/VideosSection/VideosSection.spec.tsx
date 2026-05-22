import { MockedProvider } from '@apollo/client/testing'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import type {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/GetJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../../../../../../__generated__/globalTypes'

import { VideosSection } from './VideosSection'

jest.mock('next-i18next/pages', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

jest.mock('./VideoPreviewPlayer', () => ({
  VideoPreviewPlayer: () => <div data-testid="VideoPreviewPlayer" />
}))

const mockStartUpload = jest.fn()
const mockStartYouTubeLink = jest.fn()
const mockGetUploadStatus = jest.fn()
jest.mock('../../../../TemplateVideoUploadProvider', () => ({
  ...jest.requireActual('../../../../TemplateVideoUploadProvider'),
  useTemplateVideoUpload: () => ({
    startUpload: mockStartUpload,
    startYouTubeLink: mockStartYouTubeLink,
    getUploadStatus: mockGetUploadStatus
  })
}))

const cardBlockId = 'card-block-1'

const journeyWithMatchingVideoBlock: Journey = {
  __typename: 'Journey',
  id: 'journey-1',
  slug: 'journey-1',
  title: 'Journey',
  description: null,
  status: JourneyStatus.draft,
  language: {
    __typename: 'Language',
    id: 'lang-1',
    bcp47: 'en',
    iso3: 'eng',
    name: [{ __typename: 'LanguageName', value: 'English', primary: true }]
  },
  createdAt: '',
  updatedAt: '',
  featuredAt: null,
  publishedAt: null,
  themeName: ThemeName.base,
  themeMode: ThemeMode.light,
  strategySlug: null,
  seoTitle: null,
  seoDescription: null,
  template: null,
  blocks: [
    {
      __typename: 'VideoBlock',
      id: 'video-block-1',
      parentBlockId: cardBlockId,
      parentOrder: 0,
      muted: null,
      autoplay: null,
      startAt: null,
      endAt: null,
      posterBlockId: null,
      fullsize: null,
      videoId: 'youtube-id',
      videoVariantLanguageId: null,
      source: VideoBlockSource.youTube,
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
      customizable: true,
      notes: null
    }
  ],
  primaryImageBlock: null,
  creatorDescription: null,
  creatorImageBlock: null,
  userJourneys: null,
  chatButtons: [],
  host: null,
  team: null,
  tags: [],
  website: null,
  showShareButton: null,
  showLikeButton: null,
  showDislikeButton: null,
  displayTitle: null,
  logoImageBlock: null,
  menuButtonIcon: null,
  menuStepBlock: null,
  journeyTheme: null,
  journeyCustomizationDescription: null,
  journeyCustomizationFields: [],
  fromTemplateId: null,
  socialNodeX: null,
  socialNodeY: null,
  customizable: null,
  showAssistant: null
}

const journeyWithNoMatchingVideoBlock: Journey = {
  ...journeyWithMatchingVideoBlock,
  blocks: []
}

const journeyWithVideoBlockWithAdapterNote: Journey = {
  ...journeyWithMatchingVideoBlock,
  blocks: [
    {
      ...(journeyWithMatchingVideoBlock.blocks![0] as VideoBlock),
      notes: 'trailer'
    }
  ]
}

function renderVideosSection({
  journey = journeyWithNoMatchingVideoBlock,
  cardBlockId: cardId = null,
  showLabel = false
}: {
  journey?: Journey
  cardBlockId?: string | null
  showLabel?: boolean
} = {}) {
  return render(
    <MockedProvider>
      <SnackbarProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <VideosSection cardBlockId={cardId} showLabel={showLabel} />
        </JourneyProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('VideosSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUploadStatus.mockReturnValue(null)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders with VideosSection data-testid visible', () => {
    renderVideosSection()
    expect(screen.getByTestId('VideosSection')).toBeInTheDocument()
  })

  it('shows Video heading when showLabel is true', () => {
    renderVideosSection({ showLabel: true })
    expect(screen.getByText('Video')).toBeInTheDocument()
  })

  it('hides Video heading when showLabel is false', () => {
    renderVideosSection()
    expect(screen.queryByText('Video')).not.toBeInTheDocument()
  })

  it('renders upload button with Upload file text', () => {
    renderVideosSection()
    expect(
      screen.getByRole('button', { name: 'Upload File' })
    ).toBeInTheDocument()
  })

  it('does not render VideoPreviewPlayer when cardBlockId is null', () => {
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId: null
    })
    expect(screen.queryByTestId('VideoPreviewPlayer')).not.toBeInTheDocument()
  })

  it('does not render VideoPreviewPlayer when journey has no matching customizable video block', () => {
    renderVideosSection({
      journey: journeyWithNoMatchingVideoBlock,
      cardBlockId
    })
    expect(screen.queryByTestId('VideoPreviewPlayer')).not.toBeInTheDocument()
  })

  it('renders VideoPreviewPlayer when journey has a customizable card video block for the given cardBlockId', () => {
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })
    expect(screen.getByTestId('VideoPreviewPlayer')).toBeInTheDocument()
  })

  it('shows loading spinner when upload or processing is in progress', () => {
    mockGetUploadStatus.mockReturnValue({
      status: 'uploading',
      progress: 0
    })
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('shows adapter note when video block has a non-empty notes field', () => {
    renderVideosSection({
      journey: journeyWithVideoBlockWithAdapterNote,
      cardBlockId
    })
    expect(screen.getByText('trailer')).toBeInTheDocument()
  })

  it('does not show adapter note when notes is null', () => {
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })
    expect(screen.queryByText('trailer')).not.toBeInTheDocument()
  })

  it('does not show adapter note when notes is empty or whitespace', () => {
    const journeyWithEmptyNotes: Journey = {
      ...journeyWithMatchingVideoBlock,
      blocks: [
        {
          ...(journeyWithMatchingVideoBlock.blocks![0] as VideoBlock),
          notes: '   '
        }
      ]
    }
    renderVideosSection({
      journey: journeyWithEmptyNotes,
      cardBlockId
    })
    expect(screen.queryByText('   ')).not.toBeInTheDocument()
  })

  it('disables upload button when loading', () => {
    mockGetUploadStatus.mockReturnValue({
      status: 'uploading',
      progress: 0
    })
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })
    expect(screen.getByRole('button', { name: 'Upload File' })).toBeDisabled()
  })

  it('shows loading spinner and disables button when status is processing', () => {
    mockGetUploadStatus.mockReturnValue({
      status: 'processing',
      progress: 100
    })
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload File' })).toBeDisabled()
  })

  it('calls getUploadStatus with video block id when card has video block', () => {
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })
    expect(mockGetUploadStatus).toHaveBeenCalledWith('video-block-1')
  })

  it('shows error text when upload status is error', () => {
    mockGetUploadStatus.mockReturnValue({
      status: 'error',
      progress: 0,
      error: 'Upload failed. Please try again'
    })
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })
    expect(
      screen.getByText('Upload failed. Please try again')
    ).toBeInTheDocument()
  })

  it('does not show max size helper text when upload status is uploading', () => {
    mockGetUploadStatus.mockReturnValue({
      status: 'uploading',
      progress: 50
    })
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })
    expect(screen.queryByText('Max size is 1 GB')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Upload failed. Please try again')
    ).not.toBeInTheDocument()
  })

  it('does not show max size helper text when no upload status', () => {
    mockGetUploadStatus.mockReturnValue(null)
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })
    expect(screen.queryByText('Max size is 1 GB')).not.toBeInTheDocument()
  })

  it('renders YouTube input with placeholder text', () => {
    renderVideosSection()
    expect(
      screen.getByPlaceholderText('Paste a YouTube link...')
    ).toBeInTheDocument()
  })

  it('renders helper caption for supported YouTube link formats', () => {
    renderVideosSection()
    expect(
      screen.getByText('youtube.com, youtu.be and shorts links supported')
    ).toBeInTheDocument()
  })

  it('auto-submits valid YouTube URL after 800ms debounce', async () => {
    mockStartYouTubeLink.mockResolvedValue(true)
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })

    const input = screen.getByPlaceholderText('Paste a YouTube link...')
    await user.clear(input)
    await user.type(input, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')

    act(() => {
      jest.advanceTimersByTime(800)
    })

    expect(mockStartYouTubeLink).toHaveBeenCalledWith(
      'video-block-1',
      'dQw4w9WgXcQ'
    )
  })

  it('shows error for invalid YouTube URL after debounce', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })

    const input = screen.getByPlaceholderText('Paste a YouTube link...')
    await user.clear(input)
    await user.type(input, 'not-a-valid-url')

    act(() => {
      jest.advanceTimersByTime(800)
    })

    expect(
      screen.getByText('Please enter a valid YouTube URL')
    ).toBeInTheDocument()
    expect(mockStartYouTubeLink).not.toHaveBeenCalled()
  })

  it('clears error immediately when user types after an invalid URL', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })

    const input = screen.getByPlaceholderText('Paste a YouTube link...')
    await user.clear(input)
    await user.type(input, 'not-a-valid-url')
    act(() => {
      jest.advanceTimersByTime(800)
    })
    expect(
      screen.getByText('Please enter a valid YouTube URL')
    ).toBeInTheDocument()

    // Type one more character — error should clear immediately without waiting for debounce
    await user.type(input, 'x')
    expect(
      screen.queryByText('Please enter a valid YouTube URL')
    ).not.toBeInTheDocument()
  })

  it('clears error and does not re-submit when re-pasting a previously-submitted valid URL after an error', async () => {
    mockStartYouTubeLink.mockResolvedValue(true)
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })

    const input = screen.getByPlaceholderText('Paste a YouTube link...')

    // First: submit a valid URL — resolves true so dedup map records it
    await user.clear(input)
    await user.type(input, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    act(() => {
      jest.advanceTimersByTime(800)
    })
    expect(mockStartYouTubeLink).toHaveBeenCalledTimes(1)
    // Flush the .then() callback that writes to the dedup map
    await act(async () => {
      await Promise.resolve()
    })

    // Then: type an invalid URL to trigger the error
    await user.clear(input)
    await user.type(input, 'not-valid')
    act(() => {
      jest.advanceTimersByTime(800)
    })
    expect(
      screen.getByText('Please enter a valid YouTube URL')
    ).toBeInTheDocument()

    // Finally: re-paste the same valid URL — error should clear, no duplicate submission
    await user.clear(input)
    await user.type(input, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    act(() => {
      jest.advanceTimersByTime(800)
    })
    expect(
      screen.queryByText('Please enter a valid YouTube URL')
    ).not.toBeInTheDocument()
    expect(mockStartYouTubeLink).toHaveBeenCalledTimes(1) // no duplicate call
  })

  it('allows retry of same URL after a failed submission', async () => {
    mockStartYouTubeLink.mockResolvedValue(false)
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })

    const input = screen.getByPlaceholderText('Paste a YouTube link...')

    // First attempt — fails (returns false), so dedup map is NOT written
    await user.clear(input)
    await user.type(input, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    act(() => {
      jest.advanceTimersByTime(800)
    })
    expect(mockStartYouTubeLink).toHaveBeenCalledTimes(1)
    await act(async () => {
      await Promise.resolve()
    })

    // Re-type same URL — should re-submit since the first attempt failed
    await user.clear(input)
    await user.type(input, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    act(() => {
      jest.advanceTimersByTime(800)
    })
    expect(mockStartYouTubeLink).toHaveBeenCalledTimes(2)
  })

  it('resets YouTube URL when cardBlockId changes', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    const cardBlockIdB = 'card-block-2'
    const journey: Journey = {
      ...journeyWithMatchingVideoBlock,
      blocks: [
        {
          ...(journeyWithMatchingVideoBlock.blocks![0] as VideoBlock),
          source: VideoBlockSource.internal,
          videoId: null
        },
        {
          ...(journeyWithMatchingVideoBlock.blocks![0] as VideoBlock),
          id: 'video-block-2',
          parentBlockId: cardBlockIdB,
          source: VideoBlockSource.internal,
          videoId: null
        }
      ]
    }

    const { rerender } = render(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <VideosSection cardBlockId={cardBlockId} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const input = screen.getByPlaceholderText('Paste a YouTube link...')
    await user.type(input, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')

    rerender(
      <MockedProvider>
        <SnackbarProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <VideosSection cardBlockId={cardBlockIdB} />
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByPlaceholderText('Paste a YouTube link...')).toHaveValue(
      ''
    )

    act(() => {
      jest.advanceTimersByTime(800)
    })

    expect(mockStartYouTubeLink).not.toHaveBeenCalled()
  })

  it('hydrates YouTube URL from existing video block', () => {
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })

    expect(screen.getByPlaceholderText('Paste a YouTube link...')).toHaveValue(
      'https://www.youtube.com/watch?v=youtube-id'
    )
  })

  it('does not re-submit hydrated YouTube URL', () => {
    jest.useFakeTimers()
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })

    act(() => {
      jest.advanceTimersByTime(800)
    })

    expect(mockStartYouTubeLink).not.toHaveBeenCalled()
  })
})
