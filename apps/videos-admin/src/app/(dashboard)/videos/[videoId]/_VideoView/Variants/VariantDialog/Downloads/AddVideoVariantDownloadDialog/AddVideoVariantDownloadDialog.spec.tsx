import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SnackbarProvider } from '../../../../../../../../../libs/SnackbarProvider'
import { getCreateR2AssetMock } from '../../../../../../../../../libs/useCreateR2Asset/useCreateR2Asset.mock'
import { getVideoVariantDownloadCreateMock } from '../../../../../../../../../libs/useVideoVariantDownloadCreateMutation/useVideoVariantDownloadCreateMutation.mock'

import { AddVideoVariantDownloadDialog } from './AddVideoVariantDownloadDialog'

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ videoId: 'video-123', locale: 'en' }))
}))

jest.mock('../../../AddAudioLanguageDialog/utils/getExtension', () => ({
  getExtension: jest.fn().mockReturnValue('.mp4')
}))

const originalFetch = global.fetch

const originalCreateElement = document.createElement
const originalCreateObjectURL = URL.createObjectURL
const originalRevokeObjectURL = URL.revokeObjectURL

const mockVideoElement = {
  remove: jest.fn(),
  videoWidth: 1280,
  videoHeight: 720,
  src: '',
  onloadedmetadata: jest.fn(),
  onerror: jest.fn()
}

describe('AddVideoVariantDownloadDialog', () => {
  beforeAll(() => {
    document.createElement = jest.fn().mockImplementation((tagName) => {
      if (tagName === 'video') {
        return mockVideoElement
      }
      return originalCreateElement.call(document, tagName)
    })

    URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url')
    URL.revokeObjectURL = jest.fn()
    global.fetch = jest.fn().mockResolvedValue({ ok: true })
  })

  afterAll(() => {
    document.createElement = originalCreateElement
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    global.fetch = originalFetch
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the dialog', () => {
    render(
      
        <SnackbarProvider>
          <MockedProvider mocks={[]}>
            <AddVideoVariantDownloadDialog
              open={true}
              videoVariantId="variant-123"
              existingQualities={[]}
              languageId="529"
            />
          </MockedProvider>
        </SnackbarProvider>
      
    )

    expect(screen.getByText('Add Download')).toBeInTheDocument()
    expect(screen.getByLabelText('Quality')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should not allow selecting a quality that already exists', async () => {
    render(
      
        <SnackbarProvider>
          <MockedProvider mocks={[]}>
            <AddVideoVariantDownloadDialog
              open={true}
              videoVariantId="variant-123"
              existingQualities={['high']}
              languageId="529"
            />
          </MockedProvider>
        </SnackbarProvider>
      
    )

    const user = userEvent.setup()
    const select = screen.getByLabelText('Quality')

    // Select 'high' quality which already exists
    await user.click(select)
    await user.click(screen.getByRole('option', { name: 'high' }))

    // Try to submit the form
    await user.click(screen.getByRole('button', { name: 'Save' }))

    // Should show validation error
    await waitFor(() => {
      expect(
        screen.getByText('A download with this quality already exists')
      ).toBeInTheDocument()
    })
  })

  it('should handle file upload and set video dimensions', async () => {
    render(
      
        <SnackbarProvider>
          <MockedProvider mocks={[]}>
            <AddVideoVariantDownloadDialog
              open={true}
              videoVariantId="variant-123"
              existingQualities={[]}
              languageId="529"
            />
          </MockedProvider>
        </SnackbarProvider>
      
    )

    const user = userEvent.setup()
    const dropzone = screen.getByTestId('DropZone')

    // Upload a video file
    const file = new File(['video content'], 'test-video.mp4', {
      type: 'video/mp4'
    })
    await user.upload(dropzone, file)

    // Trigger onloadedmetadata event
    if (mockVideoElement.onloadedmetadata) {
      mockVideoElement.onloadedmetadata()
    }

    // File should be displayed
    await waitFor(() => {
      expect(screen.getByText('test-video.mp4')).toBeInTheDocument()
    })

    // URL methods should have been called
    expect(URL.createObjectURL).toHaveBeenCalledWith(file)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
  })

  it('should handle video loading error', async () => {
    render(
      
        <SnackbarProvider>
          <MockedProvider mocks={[]}>
            <AddVideoVariantDownloadDialog
              open={true}
              videoVariantId="variant-123"
              existingQualities={[]}
              languageId="529"
            />
          </MockedProvider>
        </SnackbarProvider>
      
    )

    const user = userEvent.setup()
    const dropzone = screen.getByTestId('DropZone')

    const file = new File(['video content'], 'test-video.mp4', {
      type: 'video/mp4'
    })
    await user.upload(dropzone, file)

    mockVideoElement.onerror()

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    expect(mockVideoElement.remove).toHaveBeenCalled()
  })

  it('should successfully create a download', async () => {
    const videoVariantId = 'variant-123'
    const videoId = 'video-123'
    const file = new File(['video content'], 'test-video.mp4', {
      type: 'video/mp4'
    })

    // Create mocks for the mutations
    const createR2AssetMock = getCreateR2AssetMock({
      videoId,
      fileName: `${videoId}/variants/529/downloads/${videoVariantId}_high.mp4`,
      contentType: 'video/mp4',
      contentLength: file.size
    })

    const createDownloadMock = getVideoVariantDownloadCreateMock({
      videoVariantId,
      quality: 'high',
      size: 13,
      height: 720,
      width: 1280,
      url:
        'https://mock.cloudflare-domain.com/' +
        `${videoId}/variants/529/downloads/${videoVariantId}_high.mp4`,
      version: 0,
      assetId: 'r2-asset.id'
    })

    const handleClose = jest.fn()
    const onSuccess = jest.fn()

    render(
      
        <SnackbarProvider>
          <MockedProvider mocks={[createR2AssetMock, createDownloadMock]}>
            <AddVideoVariantDownloadDialog
              open={true}
              videoVariantId={videoVariantId}
              existingQualities={[]}
              handleClose={handleClose}
              onSuccess={onSuccess}
              languageId="529"
            />
          </MockedProvider>
        </SnackbarProvider>
      
    )

    const user = userEvent.setup()

    const select = screen.getByLabelText('Quality')
    await user.click(select)
    await user.click(screen.getByRole('option', { name: 'high' }))

    const dropzone = screen.getByTestId('DropZone')
    await user.upload(dropzone, file)

    if (mockVideoElement.onloadedmetadata) {
      mockVideoElement.onloadedmetadata()
    }

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(createR2AssetMock.result).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(createDownloadMock.result).toHaveBeenCalled()
    })

    expect(onSuccess).toHaveBeenCalled()

    expect(handleClose).toHaveBeenCalled()
  })

  it('should handle close button click', async () => {
    const handleClose = jest.fn()

    render(
      
        <SnackbarProvider>
          <MockedProvider mocks={[]}>
            <AddVideoVariantDownloadDialog
              open={true}
              videoVariantId="variant-123"
              existingQualities={[]}
              handleClose={handleClose}
              languageId="529"
            />
          </MockedProvider>
        </SnackbarProvider>
      
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(handleClose).toHaveBeenCalled()
  })
})
