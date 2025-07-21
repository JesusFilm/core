import { NetworkStatus, useSuspenseQuery } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { VideoInformation } from './VideoInformation'
import { GET_KEYWORDS } from './VideoKeywords'

// Mock useSuspenseQuery hook
jest.mock('@apollo/client', () => {
  const original = jest.requireActual('@apollo/client')
  return {
    ...original,
    useSuspenseQuery: jest.fn()
  }
})

// Mock notistack
const mockEnqueueSnackbar = jest.fn()
jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar })
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

const mockVideoId = 'test-video-id'

const mockKeywordsData = {
  keywords: [
    { id: 'keyword-1', value: 'faith' },
    { id: 'keyword-2', value: 'hope' },
    { id: 'keyword-3', value: 'love' }
  ]
}

const keywordsMock: MockedResponse = {
  request: {
    query: GET_KEYWORDS
  },
  result: {
    data: mockKeywordsData
  }
}

const mockVideoData = {
  adminVideo: {
    id: mockVideoId,
    label: 'featureFilm',
    published: false,
    slug: 'test-video',
    primaryLanguageId: '529',
    keywords: [],
    title: [{ id: 'title-id', value: 'Test Video Title' }],
    snippet: [{ id: 'snippet-id', value: 'Test video snippet' }],
    description: [{ id: 'desc-id', value: 'Test video description' }],
    imageAlt: [{ id: 'alt-id', value: 'Test image alt text' }],
    images: [{ id: 'banner-image-id', aspectRatio: 'banner' }],
    variant: {
      id: 'variant-id',
      slug: 'test-video',
      hls: 'https://example.com/video.m3u8',
      dash: null,
      muxVideo: null,
      language: { id: '529', slug: 'en' }
    }
  }
}

describe('VideoInformation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementation for useSuspenseQuery
    const mockedUseSuspenseQuery = useSuspenseQuery as jest.MockedFunction<
      typeof useSuspenseQuery
    >
    mockedUseSuspenseQuery.mockReturnValue({
      data: mockVideoData,
      fetchMore: jest.fn(),
      subscribeToMore: jest.fn(),
      client: {} as any,
      error: undefined,
      networkStatus: NetworkStatus.ready,
      refetch: jest.fn().mockResolvedValue({ data: mockVideoData })
    })
  })

  it('should render video information form', async () => {
    render(
      <MockedProvider mocks={[keywordsMock]}>
        <VideoInformation videoId={mockVideoId} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toBeInTheDocument()
      expect(screen.getByLabelText('Video URL')).toBeInTheDocument()
      expect(screen.getByLabelText('Status')).toBeInTheDocument()
      expect(screen.getByLabelText('Label')).toBeInTheDocument()
    })

    // Check that form has the correct values
    expect(screen.getByDisplayValue('Test Video Title')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test-video')).toBeInTheDocument()
  })

  it('should show validation warnings for incomplete video when trying to publish', async () => {
    // Mock incomplete video data
    const incompleteVideoData = {
      adminVideo: {
        ...mockVideoData.adminVideo,
        snippet: [], // Missing snippet
        description: [], // Missing description
        imageAlt: [], // Missing image alt
        images: [], // Missing images
        variant: null // Missing variant
      }
    }

    const mockedUseSuspenseQuery = useSuspenseQuery as jest.MockedFunction<
      typeof useSuspenseQuery
    >
    mockedUseSuspenseQuery.mockReturnValue({
      data: incompleteVideoData,
      fetchMore: jest.fn(),
      subscribeToMore: jest.fn(),
      client: {} as any,
      error: undefined,
      networkStatus: NetworkStatus.ready,
      refetch: jest.fn().mockResolvedValue({ data: incompleteVideoData })
    })

    render(
      <MockedProvider mocks={[keywordsMock]}>
        <VideoInformation videoId={mockVideoId} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Status')).toBeInTheDocument()
    })

    // Change status to published to trigger validation
    const statusSelect = screen.getByLabelText('Status')
    fireEvent.mouseDown(statusSelect)

    await waitFor(() => {
      const publishedOption = screen.getByText('Published')
      fireEvent.click(publishedOption)
    })

    // Should show validation errors and revert status to draft
    await waitFor(() => {
      expect(
        screen.getByText('Cannot Publish - Missing Required Fields')
      ).toBeInTheDocument()
      expect(screen.getByText('Short Description')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Image Alt Text')).toBeInTheDocument()
      expect(screen.getByText('Banner Image')).toBeInTheDocument()
      expect(screen.getByText('Published Video Content')).toBeInTheDocument()

      // Status should have reverted to Draft
      expect(screen.getByDisplayValue('unpublished')).toBeInTheDocument()
    })

    // Should show Try Again button
    const tryAgainButton = screen.getByRole('button', { name: /try again/i })
    expect(tryAgainButton).toBeInTheDocument()
  })

  it('should not require video content for collection videos', async () => {
    // Mock collection video data
    const collectionVideoData = {
      adminVideo: {
        ...mockVideoData.adminVideo,
        label: 'collection',
        snippet: [], // Missing snippet
        description: [], // Missing description
        imageAlt: [], // Missing image alt
        images: [], // Missing images
        variant: null // Collections don't need variants
      }
    }

    const mockedUseSuspenseQuery = useSuspenseQuery as jest.MockedFunction<
      typeof useSuspenseQuery
    >
    mockedUseSuspenseQuery.mockReturnValue({
      data: collectionVideoData,
      fetchMore: jest.fn(),
      subscribeToMore: jest.fn(),
      client: {} as any,
      error: undefined,
      networkStatus: NetworkStatus.ready,
      refetch: jest.fn().mockResolvedValue({ data: collectionVideoData })
    })

    render(
      <MockedProvider mocks={[keywordsMock]}>
        <VideoInformation videoId={mockVideoId} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Status')).toBeInTheDocument()
    })

    // Change status to published
    const statusSelect = screen.getByLabelText('Status')
    fireEvent.mouseDown(statusSelect)

    await waitFor(() => {
      const publishedOption = screen.getByText('Published')
      fireEvent.click(publishedOption)
    })

    // Should show some validation errors but NOT video content, and revert status to draft
    await waitFor(() => {
      expect(
        screen.getByText('Cannot Publish - Missing Required Fields')
      ).toBeInTheDocument()
      // Should not show "Published Video Content" requirement for collections
      expect(
        screen.queryByText('Published Video Content')
      ).not.toBeInTheDocument()

      // Status should have reverted to Draft
      expect(screen.getByDisplayValue('unpublished')).toBeInTheDocument()
    })
  })

  it('should validate dynamically when title is entered and published state is selected', async () => {
    // Mock video data with missing title but other fields present
    const videoDataWithoutTitle = {
      adminVideo: {
        ...mockVideoData.adminVideo,
        title: [], // Missing title
        snippet: [{ value: 'Test snippet', primary: true }],
        description: [{ value: 'Test description', primary: true }],
        imageAlt: [{ value: 'Test alt text', primary: true }],
        images: [{ aspectRatio: 'banner' as const }],
        variant: {
          hls: 'test.m3u8',
          dash: null,
          muxVideo: null,
          language: { id: '529', slug: 'en' }
        }
      }
    }

    const mockedUseSuspenseQuery = useSuspenseQuery as jest.MockedFunction<
      typeof useSuspenseQuery
    >

    // Create a mock refetch function that will initially return data without title
    // but later can return updated data with title for the "Try Again" functionality
    const mockRefetch = jest
      .fn()
      .mockResolvedValue({ data: videoDataWithoutTitle })

    mockedUseSuspenseQuery.mockReturnValue({
      data: videoDataWithoutTitle,
      fetchMore: jest.fn(),
      subscribeToMore: jest.fn(),
      client: {} as any,
      error: undefined,
      networkStatus: NetworkStatus.ready,
      refetch: mockRefetch
    })

    render(
      <MockedProvider mocks={[keywordsMock]}>
        <VideoInformation videoId={mockVideoId} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Status')).toBeInTheDocument()
    })

    // Change status to published to trigger validation
    const statusSelect = screen.getByLabelText('Status')
    fireEvent.mouseDown(statusSelect)

    await waitFor(() => {
      const publishedOption = screen.getByText('Published')
      fireEvent.click(publishedOption)
    })

    // Should show validation error and revert status to draft
    await waitFor(() => {
      expect(
        screen.getByText('Cannot Publish - Missing Required Fields')
      ).toBeInTheDocument()
      // Check for the specific Title warning in the validation list
      const titleWarning = screen.getByText('Title', {
        selector: '.MuiListItemText-primary'
      })
      expect(titleWarning).toBeInTheDocument()

      // Status should have reverted to Draft
      expect(screen.getByDisplayValue('unpublished')).toBeInTheDocument()
    })

    // Should show Try Again button
    const tryAgainButton = screen.getByRole('button', { name: /try again/i })
    expect(tryAgainButton).toBeInTheDocument()

    // Enter a title in the form
    const titleInput = screen.getByLabelText('Title')
    fireEvent.change(titleInput, { target: { value: 'New Test Title' } })

    // Update the mock refetch to return complete data when called again
    const completeVideoData = {
      adminVideo: {
        ...videoDataWithoutTitle.adminVideo,
        title: [{ id: 'new-title-id', value: 'New Test Title' }],
        snippet: [{ id: 'snippet-id', value: 'Test snippet' }],
        description: [{ id: 'desc-id', value: 'Test description' }],
        imageAlt: [{ id: 'alt-id', value: 'Test alt text' }],
        images: [{ id: 'banner-id', aspectRatio: 'banner' as const }],
        variant: {
          id: 'variant-id',
          slug: 'test-video',
          hls: 'test.m3u8',
          dash: null,
          muxVideo: null,
          language: { id: '529', slug: 'en' }
        }
      }
    }
    mockRefetch.mockResolvedValueOnce({ data: completeVideoData })

    // Click Try Again button
    fireEvent.click(tryAgainButton)

    // Validation should now pass and status should be published
    await waitFor(() => {
      expect(
        screen.queryByText('Cannot Publish - Missing Required Fields')
      ).not.toBeInTheDocument()

      // Status should now be Published
      expect(screen.getByDisplayValue('published')).toBeInTheDocument()
    })

    // Save button should be enabled (not disabled due to validation)
    await waitFor(() => {
      const saveButton = screen.getByRole('button', { name: /save/i })
      expect(saveButton).not.toBeDisabled()
    })
  })
})
