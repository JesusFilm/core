import { NetworkStatus, useSuspenseQuery } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { VideoInformation } from './VideoInformation'

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
      refetch: jest.fn()
    })
  })

  it('should render video information form', async () => {
    render(
      <MockedProvider>
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
      refetch: jest.fn()
    })

    render(
      <MockedProvider>
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

    // Should show validation warnings
    await waitFor(() => {
      expect(screen.getByText('Missing Required Fields')).toBeInTheDocument()
      expect(screen.getByText('Short Description')).toBeInTheDocument()
      expect(screen.getByText('Description')).toBeInTheDocument()
      expect(screen.getByText('Image Alt Text')).toBeInTheDocument()
      expect(screen.getByText('Banner Image')).toBeInTheDocument()
      expect(screen.getByText('Published Video Content')).toBeInTheDocument()
    })

    // Save button should be disabled
    const saveButton = screen.getByRole('button', { name: /save/i })
    expect(saveButton).toBeDisabled()
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
      refetch: jest.fn()
    })

    render(
      <MockedProvider>
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

    // Should show some validation warnings but NOT video content
    await waitFor(() => {
      expect(screen.getByText('Missing Required Fields')).toBeInTheDocument()
      // Should not show "Published Video Content" requirement for collections
      expect(
        screen.queryByText('Published Video Content')
      ).not.toBeInTheDocument()
    })
  })
})
