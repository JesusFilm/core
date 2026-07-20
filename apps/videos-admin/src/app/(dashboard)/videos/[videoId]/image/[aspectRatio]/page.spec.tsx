import { useMutation } from '@apollo/client'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import nodeFetch from 'node-fetch'
import { SnackbarProvider } from 'notistack'
import { type Mock } from 'vitest'

import { resolvedParams } from '../../../../../../test/utils/resolvedParams'
import { ImageAspectRatio } from '../../../constants'

import VideoImage from './page'

// Mock the FileUpload component
vi.mock('../../../../../../components/FileUpload', () => ({
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
vi.mock('@apollo/client', () => ({
  useMutation: vi.fn(() => [vi.fn(), { loading: false }]),
  useSuspenseQuery: vi.fn(() => ({
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
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}))

// Mock the node-fetch module
vi.mock('node-fetch', () => ({
  __esModule: true,
  default: vi.fn(() =>
    Promise.resolve({
      json: () =>
        Promise.resolve({
          errors: [],
          result: { id: 'cloudflare-image-id' }
        })
    })
  )
}))

// Mock notistack (hoisted so the factory can reference the mock)
const { mockEnqueueSnackbar } = vi.hoisted(() => ({
  mockEnqueueSnackbar: vi.fn()
}))

vi.mock('notistack', async () => ({
  ...(await vi.importActual('notistack')),
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar
  })
}))

// Mock the Dialog component
vi.mock('@core/shared/ui/Dialog', () => ({
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
          params={resolvedParams({
            videoId: mockVideoId,
            aspectRatio: mockAspectRatio
          })}
        />
      </SnackbarProvider>
    )

  beforeEach(() => {
    vi.clearAllMocks()
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
    const mockRouter = { push: vi.fn() }
    vi.mocked(useRouter as unknown as Mock).mockReturnValue(mockRouter)

    renderComponent()

    const user = userEvent.setup()
    await user.click(screen.getByTestId('close-button'))

    expect(mockRouter.push).toHaveBeenCalledWith(`/videos/${mockVideoId}`, {
      scroll: false
    })
  })

  it('handles file upload successfully', async () => {
    // Setup mocks
    const mockCreateUpload = vi.fn().mockResolvedValue({
      data: {
        createCloudflareUploadByFile: {
          id: 'upload-123',
          uploadUrl: 'https://example.com/upload'
        }
      }
    })
    const mockUploadComplete = vi.fn().mockResolvedValue({
      data: { cloudflareUploadComplete: true }
    })
    const mockDeleteImage = vi.fn().mockResolvedValue({
      data: { deleteCloudflareImage: true }
    })

    vi.mocked(useMutation as unknown as Mock).mockImplementation((mutation) => {
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
      return [vi.fn(), { loading: false }]
    })

    const mockRouter = { push: vi.fn() }
    vi.mocked(useRouter as unknown as Mock).mockReturnValue(mockRouter)

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
      expect(vi.mocked(nodeFetch as unknown as Mock)).toHaveBeenCalledWith(
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
    const mockCreateUpload = vi.fn().mockResolvedValue({
      data: {
        createCloudflareUploadByFile: {
          id: 'upload-123',
          uploadUrl: 'https://example.com/upload'
        }
      }
    })

    vi.mocked(useMutation as unknown as Mock).mockReturnValue([
      mockCreateUpload,
      { loading: false }
    ])

    // Mock fetch to return error
    vi.mocked(nodeFetch as unknown as Mock).mockResolvedValue({
      json: () =>
        Promise.resolve({
          errors: ['Upload failed'],
          result: {}
        })
    })

    renderComponent()

    // Trigger file upload
    const user = userEvent.setup()
    await user.click(screen.getByTestId('drop-button'))

    // Verify error handling
    await waitFor(() => {
      expect(vi.mocked(nodeFetch as unknown as Mock)).toHaveBeenCalled()
    })
  })
})
