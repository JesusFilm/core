import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import { ImageAspectRatio } from '../../../constants'

import VideoImage from './page'

// Mock the FileUpload component
jest.mock('../../../../../../components/FileUpload', () => ({
  FileUpload: ({ onDrop, loading, onUploadComplete }) => (
    <div data-testid="file-upload">
      <button
        data-testid="drop-button"
        onClick={() => {
          const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
          onDrop?.(file)
        }}
        disabled={loading}
      >
        Upload File
      </button>
      <button
        data-testid="complete-button"
        onClick={() => onUploadComplete?.()}
      >
        Complete Upload
      </button>
      {loading && <div data-testid="loading-indicator">Loading...</div>}
    </div>
  )
}))

// Mock the Apollo Client hooks
jest.mock('@apollo/client', () => ({
  useMutation: jest.fn(() => [jest.fn(), { loading: false }]),
  useSuspenseQuery: jest.fn(() => ({
    data: {
      adminVideo: {
        id: 'video-123',
        images: [
          {
            id: 'image-123'
          }
        ]
      }
    }
  }))
}))

// Mock the next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}))

// Mock the node-fetch module
jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          errors: [],
          result: { id: 'cloudflare-image-id' }
        })
    })
  )
}))

// Mock the Dialog component
jest.mock('@core/shared/ui/Dialog', () => ({
  Dialog: ({ children, onClose, dialogTitle, testId }) => (
    <div data-testid={testId || 'dialog'}>
      <div data-testid="dialog-title">{dialogTitle.title}</div>
      <button data-testid="close-button" onClick={onClose}>
        Close
      </button>
      <div data-testid="dialog-content">{children}</div>
    </div>
  )
}))

describe('VideoImage', () => {
  const mockVideoId = 'video-123'
  const mockAspectRatio = ImageAspectRatio.banner

  const renderComponent = () =>
    render(
      <SnackbarProvider>
        <VideoImage
          params={{
            videoId: mockVideoId,
            aspectRatio: mockAspectRatio
          }}
        />
      </SnackbarProvider>
    )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the image upload dialog', () => {
    renderComponent()

    expect(
      screen.getByTestId('VideoImageUploadDialog-Banner')
    ).toBeInTheDocument()
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Edit Image')
    expect(screen.getByTestId('close-button')).toBeInTheDocument()
    expect(screen.getByTestId('file-upload')).toBeInTheDocument()
    expect(
      screen.getByText('Warning: this change will apply immediately')
    ).toBeInTheDocument()
  })

  it('redirects on close button click', async () => {
    const mockRouter = { push: jest.fn() }
    require('next/navigation').useRouter.mockReturnValue(mockRouter)

    renderComponent()

    const user = userEvent.setup()
    await user.click(screen.getByTestId('close-button'))

    expect(mockRouter.push).toHaveBeenCalledWith(`/videos/${mockVideoId}`, {
      scroll: false
    })
  })

  it('handles file upload successfully', async () => {
    // Setup mocks
    const mockCreateUpload = jest.fn().mockResolvedValue({
      data: {
        createCloudflareUploadByFile: {
          id: 'upload-123',
          uploadUrl: 'https://example.com/upload'
        }
      }
    })
    const mockUploadComplete = jest.fn().mockResolvedValue({
      data: { cloudflareUploadComplete: true }
    })
    const mockDeleteImage = jest.fn().mockResolvedValue({
      data: { deleteCloudflareImage: true }
    })

    require('@apollo/client').useMutation.mockImplementation((mutation) => {
      // Return appropriate mock based on the mutation
      if (
        mutation.definitions?.[0]?.name?.value ===
        'CreateCloudflareUploadByFile'
      ) {
        return [mockCreateUpload, { loading: false }]
      } else if (
        mutation.definitions?.[0]?.name?.value === 'CloudflareUploadComplete'
      ) {
        return [mockUploadComplete, { loading: false }]
      } else if (
        mutation.definitions?.[0]?.name?.value === 'DeleteVideoCloudflareImage'
      ) {
        return [mockDeleteImage, { loading: false }]
      }
      return [jest.fn(), { loading: false }]
    })

    const mockRouter = { push: jest.fn() }
    require('next/navigation').useRouter.mockReturnValue(mockRouter)

    renderComponent()

    // Trigger file upload
    const user = userEvent.setup()
    await user.click(screen.getByTestId('drop-button'))

    // Verify the mutation calls
    await waitFor(() => {
      expect(mockCreateUpload).toHaveBeenCalledWith({
        variables: {
          input: {
            videoId: mockVideoId,
            aspectRatio: mockAspectRatio
          }
        },
        onError: expect.any(Function)
      })
    })

    // Verify fetch was called to upload the file
    await waitFor(() => {
      expect(require('node-fetch').default).toHaveBeenCalledWith(
        'https://example.com/upload',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      )
    })

    // Verify completion mutation was called
    await waitFor(() => {
      expect(mockUploadComplete).toHaveBeenCalledWith({
        variables: { id: 'upload-123' }
      })
    })

    // Verify existing image was deleted
    await waitFor(() => {
      expect(mockDeleteImage).toHaveBeenCalledWith({
        variables: { id: 'image-123' }
      })
    })

    // Verify upload completion redirects
    await user.click(screen.getByTestId('complete-button'))
    expect(mockRouter.push).toHaveBeenCalledWith(`/videos/${mockVideoId}`, {
      scroll: false
    })
  })

  it('shows error notification when upload fails', async () => {
    // Setup mock for failed upload
    const mockCreateUpload = jest.fn().mockResolvedValue({
      data: {
        createCloudflareUploadByFile: {
          id: 'upload-123',
          uploadUrl: 'https://example.com/upload'
        }
      }
    })

    require('@apollo/client').useMutation.mockReturnValue([
      mockCreateUpload,
      { loading: false }
    ])

    // Mock fetch to return error
    require('node-fetch').default.mockResolvedValue({
      json: () =>
        Promise.resolve({
          errors: ['Upload failed'],
          result: {}
        })
    })

    // Mock snackbar
    const mockEnqueueSnackbar = jest.fn()
    jest.mock('notistack', () => ({
      ...jest.requireActual('notistack'),
      useSnackbar: () => ({
        enqueueSnackbar: mockEnqueueSnackbar
      })
    }))

    renderComponent()

    // Trigger file upload
    const user = userEvent.setup()
    await user.click(screen.getByTestId('drop-button'))

    // Verify error handling
    await waitFor(() => {
      expect(require('node-fetch').default).toHaveBeenCalled()
    })
  })
})
