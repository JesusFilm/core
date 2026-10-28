import { NetworkStatus } from '@apollo/client'
import { useSuspenseQuery } from '@apollo/client/react'
import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type MockedFunction } from 'vitest'

import { UPDATE_VIDEO_INFORMATION, VideoInformation } from './VideoInformation'
import { GET_KEYWORDS } from './VideoKeywords'

// Mock useSuspenseQuery hook
vi.mock('@apollo/client/react', async () => {
  const original = await vi.importActual('@apollo/client/react')
  return {
    ...original,
    useSuspenseQuery: vi.fn()
  }
})

// Mock notistack
const mockEnqueueSnackbar = vi.fn()
vi.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar })
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
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

const keywordsMock: MockLink.MockedResponse = {
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
    publishedAt: null,
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
    vi.clearAllMocks()
    // Default mock implementation for useSuspenseQuery
    const mockedUseSuspenseQuery = useSuspenseQuery as MockedFunction<
      typeof useSuspenseQuery
    >
    mockedUseSuspenseQuery.mockReturnValue({
      data: mockVideoData,
      fetchMore: vi.fn(),
      subscribeToMore: vi.fn(),
      client: {} as any,
      error: undefined,
      dataState: 'complete' as const,
      networkStatus: NetworkStatus.ready,
      refetch: vi.fn().mockResolvedValue({ data: mockVideoData })
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
      const videoUrlInput = screen.getByLabelText('Video URL')
      expect(videoUrlInput).toBeInTheDocument()
      expect(videoUrlInput).toBeEnabled()
      expect(screen.getByLabelText('Status')).toBeInTheDocument()
      expect(screen.getByLabelText('Label')).toBeInTheDocument()
    })

    // Check that form has the correct values
    expect(screen.getByDisplayValue('Test Video Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Video URL')).toHaveValue('test-video')
    expect(screen.getByText('jesusfilm.org/watch/')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Changing the URL keeps the old one working as a redirect.'
      )
    ).toBeInTheDocument()
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

    const mockedUseSuspenseQuery = useSuspenseQuery as MockedFunction<
      typeof useSuspenseQuery
    >
    mockedUseSuspenseQuery.mockReturnValue({
      data: incompleteVideoData,
      fetchMore: vi.fn(),
      subscribeToMore: vi.fn(),
      client: {} as any,
      error: undefined,
      dataState: 'complete' as const,
      networkStatus: NetworkStatus.ready,
      refetch: vi.fn().mockResolvedValue({ data: incompleteVideoData })
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

    const mockedUseSuspenseQuery = useSuspenseQuery as MockedFunction<
      typeof useSuspenseQuery
    >
    mockedUseSuspenseQuery.mockReturnValue({
      data: collectionVideoData,
      fetchMore: vi.fn(),
      subscribeToMore: vi.fn(),
      client: {} as any,
      error: undefined,
      dataState: 'complete' as const,
      networkStatus: NetworkStatus.ready,
      refetch: vi.fn().mockResolvedValue({ data: collectionVideoData })
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

    const mockedUseSuspenseQuery = useSuspenseQuery as MockedFunction<
      typeof useSuspenseQuery
    >

    // Create a mock refetch function that will initially return data without title
    // but later can return updated data with title for the "Try Again" functionality
    const mockRefetch = vi
      .fn()
      .mockResolvedValue({ data: videoDataWithoutTitle })

    mockedUseSuspenseQuery.mockReturnValue({
      data: videoDataWithoutTitle,
      fetchMore: vi.fn(),
      subscribeToMore: vi.fn(),
      client: {} as any,
      error: undefined,
      dataState: 'complete' as const,
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

  it('should display character count for title field', async () => {
    render(
      <MockedProvider mocks={[keywordsMock]}>
        <VideoInformation videoId={mockVideoId} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toBeInTheDocument()
    })

    // Initial title is 'Test Video Title' (16 chars)
    expect(screen.getByText('16/60')).toBeInTheDocument()

    // Type a new title and verify counter updates
    const titleInput = screen.getByLabelText('Title')
    fireEvent.change(titleInput, { target: { value: 'Short' } })

    await waitFor(() => {
      expect(screen.getByText('5/60')).toBeInTheDocument()
    })
  })

  it('should show validation error when title exceeds 60 characters', async () => {
    render(
      <MockedProvider mocks={[keywordsMock]}>
        <VideoInformation videoId={mockVideoId} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText('Title')).toBeInTheDocument()
    })

    const titleInput = screen.getByLabelText('Title')
    const longTitle = 'A'.repeat(61)
    fireEvent.change(titleInput, { target: { value: longTitle } })
    fireEvent.blur(titleInput)

    await waitFor(() => {
      expect(
        screen.getByText('Title must be 60 characters or less')
      ).toBeInTheDocument()
      // Counter should NOT be shown when there is an error
      expect(screen.queryByText('61/60')).not.toBeInTheDocument()
    })
  })

  describe('Video URL', () => {
    const publishedVideoData = {
      adminVideo: {
        ...mockVideoData.adminVideo,
        published: true,
        publishedAt: '2024-01-01T00:00:00.000Z'
      }
    }

    function mockVideo(data: typeof mockVideoData): void {
      const mockedUseSuspenseQuery = useSuspenseQuery as MockedFunction<
        typeof useSuspenseQuery
      >
      mockedUseSuspenseQuery.mockReturnValue({
        data,
        fetchMore: vi.fn(),
        subscribeToMore: vi.fn(),
        client: {} as any,
        error: undefined,
        dataState: 'complete' as const,
        networkStatus: NetworkStatus.ready,
        refetch: vi.fn().mockResolvedValue({ data })
      })
    }

    function updateVideoInformationMock({
      slug,
      published,
      title = 'Test Video Title'
    }: {
      slug: string
      published: boolean
      title?: string
    }): MockLink.MockedResponse {
      return {
        request: {
          query: UPDATE_VIDEO_INFORMATION,
          variables: {
            infoInput: {
              id: mockVideoId,
              slug,
              published,
              label: 'featureFilm',
              keywordIds: []
            },
            titleInput: { id: 'title-id', value: title }
          }
        },
        result: vi.fn(() => ({
          data: {
            videoTitleUpdate: {
              __typename: 'VideoTitle',
              id: 'title-id',
              value: title
            },
            videoUpdate: {
              __typename: 'Video',
              id: mockVideoId,
              label: 'featureFilm',
              slug,
              published
            }
          }
        }))
      }
    }

    it('sends the edited slug without the URL prefix', async () => {
      const updateMock = updateVideoInformationMock({
        slug: 'new-slug',
        published: false
      })

      render(
        <MockedProvider mocks={[keywordsMock, updateMock]}>
          <VideoInformation videoId={mockVideoId} />
        </MockedProvider>
      )

      fireEvent.change(screen.getByLabelText('Video URL'), {
        target: { value: 'new-slug' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => expect(updateMock.result).toHaveBeenCalled())
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Successfully updated video information',
        { variant: 'success' }
      )
    })

    it('strips a pasted URL prefix from the submitted slug', async () => {
      const updateMock = updateVideoInformationMock({
        slug: 'new-slug',
        published: false
      })

      render(
        <MockedProvider mocks={[keywordsMock, updateMock]}>
          <VideoInformation videoId={mockVideoId} />
        </MockedProvider>
      )

      fireEvent.change(screen.getByLabelText('Video URL'), {
        target: { value: 'https://www.jesusfilm.org/watch/new-slug' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => expect(updateMock.result).toHaveBeenCalled())
    })

    it('asks for confirmation before changing a published video URL', async () => {
      mockVideo(publishedVideoData)
      const updateMock = updateVideoInformationMock({
        slug: 'new-slug',
        published: true
      })

      render(
        <MockedProvider mocks={[keywordsMock, updateMock]}>
          <VideoInformation videoId={mockVideoId} />
        </MockedProvider>
      )

      fireEvent.change(screen.getByLabelText('Video URL'), {
        target: { value: 'new-slug' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))

      const dialog = await screen.findByRole('dialog')
      expect(dialog).toHaveTextContent('Change Video URL?')
      expect(dialog).toHaveTextContent(
        'from jesusfilm.org/watch/test-video to jesusfilm.org/watch/new-slug'
      )
      expect(updateMock.result).not.toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: 'Change URL' }))

      await waitFor(() => expect(updateMock.result).toHaveBeenCalled())
    })

    it('does not change a published video URL when confirmation is cancelled', async () => {
      mockVideo(publishedVideoData)
      const updateMock = updateVideoInformationMock({
        slug: 'new-slug',
        published: true
      })

      render(
        <MockedProvider mocks={[keywordsMock, updateMock]}>
          <VideoInformation videoId={mockVideoId} />
        </MockedProvider>
      )

      fireEvent.change(screen.getByLabelText('Video URL'), {
        target: { value: 'new-slug' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))

      await screen.findByRole('dialog')
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      )
      expect(updateMock.result).not.toHaveBeenCalled()
      expect(screen.getByLabelText('Video URL')).toHaveValue('new-slug')
    })

    it('saves a published video without confirmation when the URL is unchanged', async () => {
      mockVideo(publishedVideoData)
      const updateMock = updateVideoInformationMock({
        slug: 'test-video',
        published: true,
        title: 'New Title'
      })

      render(
        <MockedProvider mocks={[keywordsMock, updateMock]}>
          <VideoInformation videoId={mockVideoId} />
        </MockedProvider>
      )

      fireEvent.change(screen.getByLabelText('Title'), {
        target: { value: 'New Title' }
      })
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => expect(updateMock.result).toHaveBeenCalled())
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('shows a slug collision error on the URL field', async () => {
      const slugTakenMock: MockLink.MockedResponse = {
        request: {
          query: UPDATE_VIDEO_INFORMATION,
          variables: {
            infoInput: {
              id: mockVideoId,
              slug: 'taken-slug',
              published: false,
              label: 'featureFilm',
              keywordIds: []
            },
            titleInput: { id: 'title-id', value: 'Test Video Title' }
          }
        },
        result: {
          errors: [
            {
              message: 'Video slug already exists',
              extensions: {
                code: 'NOT_UNIQUE_ERROR',
                location: [{ path: ['input', 'slug'], value: 'taken-slug' }]
              }
            }
          ]
        }
      }

      render(
        <MockedProvider mocks={[keywordsMock, slugTakenMock]}>
          <VideoInformation videoId={mockVideoId} />
        </MockedProvider>
      )

      const urlInput = screen.getByLabelText('Video URL')
      fireEvent.change(urlInput, { target: { value: 'taken-slug' } })
      fireEvent.click(screen.getByRole('button', { name: 'Save' }))

      expect(
        await screen.findByText('Video slug already exists')
      ).toBeInTheDocument()
      expect(urlInput).toHaveAttribute('aria-invalid', 'true')
      expect(urlInput).toHaveAccessibleDescription('Video slug already exists')
      expect(mockEnqueueSnackbar).not.toHaveBeenCalledWith(
        'Failed to update video information',
        { variant: 'error' }
      )
    })
  })
})
