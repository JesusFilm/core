import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { GET_VIDEO_IMAGES, ImageAspectRatio, VideoImage } from './page'

// Mock the VideoImageUpload component
jest.mock('./VideoImageUpload', () => ({
  VideoImageUpload: ({ aspectRatio, onUploadComplete }) => (
    <div data-testid={`MockedVideoImageUpload-${aspectRatio}`}>
      <button onClick={onUploadComplete}>Complete Upload</button>
    </div>
  ),
  ImageAspectRatio
}))

// Sample mock data for the GraphQL query
const mockVideoData = {
  id: 'test-video-id',
  images: [
    {
      id: 'banner-image-id',
      url: 'https://example.com/banner-image',
      mobileCinematicHigh: 'https://example.com/banner-image-mobile',
      videoStill: null,
      aspectRatio: 'banner',
      __typename: 'CloudflareImage'
    },
    {
      id: 'hd-image-id',
      url: 'https://example.com/hd-image',
      mobileCinematicHigh: null,
      videoStill: 'https://example.com/hd-image-still',
      aspectRatio: 'hd',
      __typename: 'CloudflareImage'
    }
  ],
  imageAlt: [
    {
      id: 'image-alt-id',
      value: 'Sample alt text',
      __typename: 'ImageAlt'
    }
  ],
  __typename: 'Video'
}

// Create mocked query response
const mockQueryResponse: MockedResponse = {
  request: {
    query: GET_VIDEO_IMAGES,
    variables: { id: 'test-video-id' }
  },
  result: {
    data: {
      video: mockVideoData
    }
  }
}

// Create mock for loading state
const mockLoadingResponse: MockedResponse = {
  request: {
    query: GET_VIDEO_IMAGES,
    variables: { id: 'test-video-id' }
  },
  result: {
    data: {
      video: mockVideoData
    }
  },
  delay: 100 // Simulate network delay
}

// Create mock for error state
const mockErrorResponse: MockedResponse = {
  request: {
    query: GET_VIDEO_IMAGES,
    variables: { id: 'test-video-id' }
  },
  error: new Error('Failed to load video images')
}

// Create mock for empty response
const mockEmptyResponse: MockedResponse = {
  request: {
    query: GET_VIDEO_IMAGES,
    variables: { id: 'empty-video-id' }
  },
  result: {
    data: {
      video: null
    }
  }
}

describe('VideoImage', () => {
  it('renders video images when data is available', async () => {
    render(
      <MockedProvider mocks={[mockQueryResponse]}>
        <VideoImage videoId="test-video-id" />
      </MockedProvider>
    )

    // Initially shows loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument()

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Banner Image')).toBeInTheDocument()
      expect(screen.getByText('HD Image')).toBeInTheDocument()
    })

    // Images should be rendered
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })

  it('shows loading state while fetching data', () => {
    render(
      <MockedProvider mocks={[mockLoadingResponse]}>
        <VideoImage videoId="test-video-id" />
      </MockedProvider>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('shows error message when query fails', async () => {
    render(
      <MockedProvider mocks={[mockErrorResponse]}>
        <VideoImage videoId="test-video-id" />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(
        screen.getByText(/Error loading video images:/i)
      ).toBeInTheDocument()
    })
  })

  it('shows message when no video data is available', async () => {
    render(
      <MockedProvider mocks={[mockEmptyResponse]}>
        <VideoImage videoId="empty-video-id" />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/No image data available/i)).toBeInTheDocument()
    })
  })

  it('opens banner image upload dialog when edit button is clicked', async () => {
    render(
      <MockedProvider mocks={[mockQueryResponse]}>
        <VideoImage videoId="test-video-id" />
      </MockedProvider>
    )

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Banner Image')).toBeInTheDocument()
    })

    // Find the edit buttons (there are two, one for banner and one for HD)
    const editButtons = screen.getAllByRole('button', { name: /change/i })

    // Click the banner image edit button (first one)
    fireEvent.click(editButtons[0])

    // Dialog should open
    expect(
      screen.getByTestId('VideoImageUploadDialog-Banner')
    ).toBeInTheDocument()
    expect(screen.getByText('Change Banner Image')).toBeInTheDocument()
    expect(
      screen.getByText(/Warning: this change will apply immediately/i)
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('MockedVideoImageUpload-banner')
    ).toBeInTheDocument()
  })

  it('opens HD image upload dialog when edit button is clicked', async () => {
    render(
      <MockedProvider mocks={[mockQueryResponse]}>
        <VideoImage videoId="test-video-id" />
      </MockedProvider>
    )

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('HD Image')).toBeInTheDocument()
    })

    // Find the edit buttons (there are two, one for banner and one for HD)
    const editButtons = screen.getAllByRole('button', { name: /change/i })

    // Click the HD image edit button (second one)
    fireEvent.click(editButtons[1])

    // Dialog should open
    expect(screen.getByTestId('VideoImageUploadDialog-HD')).toBeInTheDocument()
    expect(screen.getByText('Change HD Image')).toBeInTheDocument()
    expect(
      screen.getByText(/Warning: this change will apply immediately/i)
    ).toBeInTheDocument()
    expect(screen.getByTestId('MockedVideoImageUpload-hd')).toBeInTheDocument()
  })

  it('closes banner dialog when upload is complete', async () => {
    render(
      <MockedProvider mocks={[mockQueryResponse]}>
        <VideoImage videoId="test-video-id" />
      </MockedProvider>
    )

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Banner Image')).toBeInTheDocument()
    })

    // Open the banner dialog
    const editButtons = screen.getAllByRole('button', { name: /change/i })
    fireEvent.click(editButtons[0])

    // Verify dialog is open
    expect(
      screen.getByTestId('VideoImageUploadDialog-Banner')
    ).toBeInTheDocument()

    // Click the "Complete Upload" button in the mocked VideoImageUpload component
    fireEvent.click(screen.getByText('Complete Upload'))

    // Dialog should close
    await waitFor(() => {
      expect(
        screen.queryByTestId('VideoImageUploadDialog-Banner')
      ).not.toBeInTheDocument()
    })
  })

  it('closes HD dialog when upload is complete', async () => {
    render(
      <MockedProvider mocks={[mockQueryResponse]}>
        <VideoImage videoId="test-video-id" />
      </MockedProvider>
    )

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('HD Image')).toBeInTheDocument()
    })

    // Open the HD dialog
    const editButtons = screen.getAllByRole('button', { name: /change/i })
    fireEvent.click(editButtons[1])

    // Verify dialog is open
    expect(screen.getByTestId('VideoImageUploadDialog-HD')).toBeInTheDocument()

    // Click the "Complete Upload" button in the mocked VideoImageUpload component
    fireEvent.click(screen.getByText('Complete Upload'))

    // Dialog should close
    await waitFor(() => {
      expect(
        screen.queryByTestId('VideoImageUploadDialog-HD')
      ).not.toBeInTheDocument()
    })
  })
})
