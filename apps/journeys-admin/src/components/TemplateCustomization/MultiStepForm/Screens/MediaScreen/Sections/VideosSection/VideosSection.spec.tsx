import { MockedProvider } from '@apollo/client/testing'
import { act, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { GET_JOURNEY } from '@core/journeys/ui/useJourneyQuery'

import type {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/GetJourney'
import {
  IdType,
  JourneyStatus,
  ThemeMode,
  ThemeName,
  VideoBlockSource
} from '../../../../../../../../__generated__/globalTypes'

import { VideosSection } from './VideosSection'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}))

const mockUseVideoUpload = jest.fn()
jest.mock('../../../../../utils/useVideoUpload/useVideoUpload', () => ({
  useVideoUpload: (...args: unknown[]) => mockUseVideoUpload(...args)
}))

const mockShowSnackbar = jest.fn()
jest.mock(
  '../../../../../../MuxVideoUploadProvider/utils/showSnackbar/showSnackbar',
  () => ({
    createShowSnackbar: () => mockShowSnackbar
  })
)

const mockVideoBlockUpdate = jest.fn()
jest.mock('@apollo/client', () => {
  const actual = jest.requireActual('@apollo/client')
  return {
    ...actual,
    useMutation: () => [mockVideoBlockUpdate, { loading: false }]
  }
})

jest.mock('./VideoPreviewPlayer', () => ({
  VideoPreviewPlayer: () => <div data-testid="VideoPreviewPlayer" />
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
      customizable: true
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
  socialNodeY: null
}

const journeyWithNoMatchingVideoBlock: Journey = {
  ...journeyWithMatchingVideoBlock,
  blocks: []
}

const journeyWithVideoBlockWithDisplayTitle: Journey = {
  ...journeyWithMatchingVideoBlock,
  blocks: [
    {
      ...(journeyWithMatchingVideoBlock.blocks![0] as VideoBlock),
      title: 'My Video Display Title'
    }
  ]
}

function renderVideosSection({
  journey = journeyWithNoMatchingVideoBlock,
  cardBlockId: cardId = null,
  onLoading
}: {
  journey?: Journey
  cardBlockId?: string | null
  onLoading?: (loading: boolean) => void
} = {}) {
  return render(
    <MockedProvider>
      <SnackbarProvider>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <VideosSection cardBlockId={cardId} onLoading={onLoading} />
        </JourneyProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
}

function defaultUseVideoUploadReturn() {
  return {
    open: jest.fn(),
    getInputProps: () => ({}),
    status: 'idle' as const
  }
}

describe('VideosSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockVideoBlockUpdate.mockResolvedValue({})
    mockUseVideoUpload.mockImplementation(() => defaultUseVideoUploadReturn())
  })

  it('renders with VideosSection data-testid visible', () => {
    renderVideosSection()
    expect(screen.getByTestId('VideosSection')).toBeInTheDocument()
  })

  it('renders Video heading', () => {
    renderVideosSection()
    expect(screen.getByText('Video')).toBeInTheDocument()
  })

  it('renders upload button with Upload file text', () => {
    renderVideosSection()
    expect(
      screen.getByRole('button', { name: 'Upload file' })
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
    mockUseVideoUpload.mockReturnValueOnce({
      ...defaultUseVideoUploadReturn(),
      status: 'uploading'
    })
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('shows video display title when video block has a non-empty display title', () => {
    renderVideosSection({
      journey: journeyWithVideoBlockWithDisplayTitle,
      cardBlockId
    })
    expect(screen.getByText('My Video Display Title')).toBeInTheDocument()
  })

  it('does not show video title when display title is empty', () => {
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })
    expect(screen.queryByText('My Video Display Title')).not.toBeInTheDocument()
  })

  it('disables upload button when loading', () => {
    mockUseVideoUpload.mockReturnValueOnce({
      ...defaultUseVideoUploadReturn(),
      status: 'uploading'
    })
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })
    expect(screen.getByRole('button', { name: 'Upload file' })).toBeDisabled()
  })

  it('calls onLoading with true when loading', () => {
    const onLoading = jest.fn()
    mockUseVideoUpload.mockReturnValueOnce({
      ...defaultUseVideoUploadReturn(),
      status: 'uploading'
    })
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId,
      onLoading
    })
    expect(onLoading).toHaveBeenCalledWith(true)
  })

  it('calls onLoading with false when not loading', () => {
    const onLoading = jest.fn()
    renderVideosSection({
      journey: journeyWithNoMatchingVideoBlock,
      cardBlockId,
      onLoading
    })
    expect(onLoading).toHaveBeenCalledWith(false)
  })

  it('does not throw when onLoading is undefined', () => {
    expect(() => {
      renderVideosSection({
        journey: journeyWithMatchingVideoBlock,
        cardBlockId
      })
    }).not.toThrow()
  })

  it('shows loading spinner and disables button when status is processing', () => {
    mockUseVideoUpload.mockReturnValueOnce({
      ...defaultUseVideoUploadReturn(),
      status: 'processing'
    })
    renderVideosSection({
      journey: journeyWithMatchingVideoBlock,
      cardBlockId
    })
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Upload file' })).toBeDisabled()
  })

  describe('upload flow integration', () => {
    it('calls videoBlockUpdate with expected variables and shows success snackbar when onUploadComplete succeeds', async () => {
      let capturedOnUploadComplete: ((videoId: string) => void) | undefined
      mockUseVideoUpload.mockImplementation((options: { onUploadComplete?: (videoId: string) => void }) => {
        capturedOnUploadComplete = options?.onUploadComplete
        return defaultUseVideoUploadReturn()
      })

      renderVideosSection({
        journey: journeyWithMatchingVideoBlock,
        cardBlockId
      })

      expect(capturedOnUploadComplete).toBeDefined()
      act(() => {
        capturedOnUploadComplete!('new-video-id')
      })

      await waitFor(() => {
        expect(mockVideoBlockUpdate).toHaveBeenCalledTimes(1)
      })

      expect(mockVideoBlockUpdate).toHaveBeenCalledWith({
        variables: {
          id: 'video-block-1',
          input: {
            videoId: 'new-video-id',
            source: VideoBlockSource.mux
          }
        },
        refetchQueries: [
          {
            query: GET_JOURNEY,
            variables: {
              id: 'journey-1',
              idType: IdType.databaseId,
              options: { skipRoutingFilter: true }
            }
          }
        ]
      })

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          'File uploaded successfully',
          'success'
        )
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Upload file' })).toBeEnabled()
      })
    })

    it('shows error snackbar and clears loading when videoBlockUpdate rejects', async () => {
      mockVideoBlockUpdate.mockRejectedValueOnce(new Error('Mutation failed'))

      let capturedOnUploadComplete: ((videoId: string) => void) | undefined
      mockUseVideoUpload.mockImplementation((options: { onUploadComplete?: (videoId: string) => void }) => {
        capturedOnUploadComplete = options?.onUploadComplete
        return defaultUseVideoUploadReturn()
      })

      renderVideosSection({
        journey: journeyWithMatchingVideoBlock,
        cardBlockId
      })

      act(() => {
        capturedOnUploadComplete!('new-video-id')
      })

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          'Upload failed. Please try again',
          'error'
        )
      })

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Upload file' })).toBeEnabled()
      })
    })

    it('shows error snackbar when onUploadError is called by useVideoUpload', () => {
      let capturedOnUploadError: (() => void) | undefined
      mockUseVideoUpload.mockImplementation((options: { onUploadError?: () => void }) => {
        capturedOnUploadError = options?.onUploadError
        return defaultUseVideoUploadReturn()
      })

      renderVideosSection({
        journey: journeyWithMatchingVideoBlock,
        cardBlockId
      })

      expect(capturedOnUploadError).toBeDefined()
      capturedOnUploadError!()

      expect(mockShowSnackbar).toHaveBeenCalledWith(
        'Upload failed. Please try again',
        'error'
      )
    })
  })
})
