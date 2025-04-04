import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useParams } from 'next/navigation'

import { SnackbarProvider } from '../../../../../../../../../libs/SnackbarProvider'
import { uploadAssetFile } from '../../../../../../../../../libs/useCreateR2Asset/uploadAssetFile'
import { CREATE_CLOUDFLARE_R2_ASSET } from '../../../../../../../../../libs/useCreateR2Asset/useCreateR2Asset'
import { getCreateR2AssetMock } from '../../../../../../../../../libs/useCreateR2Asset/useCreateR2Asset.mock'
import { VIDEO_VARIANT_DOWNLOAD_CREATE } from '../../../../../../../../../libs/useVideoVariantDownloadCreateMutation/useVideoVariantDownloadCreateMutation'
import { getVideoVariantDownloadCreateMock } from '../../../../../../../../../libs/useVideoVariantDownloadCreateMutation/useVideoVariantDownloadCreateMutation.mock'

import { AddVideoVariantDownloadDialog } from './AddVideoVariantDownloadDialog'

// Mock the uploadAssetFile function
jest.mock(
  '../../../../../../../../../../libs/useCreateR2Asset/uploadAssetFile',
  () => ({
    uploadAssetFile: jest.fn().mockResolvedValue(undefined)
  })
)

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useParams: jest.fn()
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

  it('should render the dialog', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <AddVideoVariantDownloadDialog
            open={true}
            handleClose={jest.fn()}
            videoVariantId="1"
            existingQualities={[]}
            languageId="529"
          />
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(screen.getByText('Add Download')).toBeInTheDocument()
    expect(screen.getByLabelText('Quality')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should not allow selecting a quality that already exists', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <AddVideoVariantDownloadDialog
            open={true}
            handleClose={jest.fn()}
            videoVariantId="1"
            existingQualities={['high']}
            languageId="529"
          />
        </MockedProvider>
      </SnackbarProvider>
    )

    const select = screen.getByLabelText('Quality')
    await userEvent.click(select)

    // Verify that low is available as an option
    expect(screen.getByRole('option', { name: 'low' })).toBeInTheDocument()

    // Verify that high is not available as an option
    expect(
      screen.queryByRole('option', { name: 'high' })
    ).not.toBeInTheDocument()
  })

  it('should handle file upload and set video dimensions', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <AddVideoVariantDownloadDialog
            open={true}
            handleClose={jest.fn()}
            videoVariantId="1"
            existingQualities={[]}
            languageId="529"
          />
        </MockedProvider>
      </SnackbarProvider>
    )

    const user = userEvent.setup()

    const dropzone = screen.getByTestId('DropZone')
    await user.upload(
      dropzone,
      new File(['video content'], 'test-video.mp4', {
        type: 'video/mp4'
      })
    )

    if (mockVideoElement.onloadedmetadata) {
      mockVideoElement.onloadedmetadata()
    }

    expect(screen.getByText('test-video.mp4')).toBeInTheDocument()
  })

  it('should handle video loading error', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <AddVideoVariantDownloadDialog
            open={true}
            handleClose={jest.fn()}
            videoVariantId="1"
            existingQualities={[]}
            languageId="529"
          />
        </MockedProvider>
      </SnackbarProvider>
    )

    const user = userEvent.setup()

    const dropzone = screen.getByTestId('DropZone')
    await user.upload(
      dropzone,
      new File(['video content'], 'test-video.mp4', {
        type: 'video/mp4'
      })
    )

    if (mockVideoElement.onerror) {
      mockVideoElement.onerror(new Event('error'))
    }

    expect(screen.getByText('test-video.mp4')).toBeInTheDocument()
  })

  it('should create a download with correct values', async () => {
    window.URL.createObjectURL = jest.fn()

    // Mock useParams to return the videoId
    const mockedUseParams = useParams as jest.Mock
    mockedUseParams.mockReturnValue({ videoId: 'video-123', locale: 'en' })

    const createR2AssetMockFn = jest.fn().mockReturnValue({
      data: {
        cloudflareR2Create: {
          id: '1',
          fileName: 'video-123/variants/529/downloads/1_low.mp4',
          originalFilename: 'test-video.mp4',
          uploadUrl: 'https://upload.example.com/1',
          publicUrl: 'https://public.example.com/1'
        }
      }
    })

    const videoVariantDownloadCreateMockFn = jest.fn().mockReturnValue({
      data: {
        videoVariantDownloadCreate: {
          id: '1'
        }
      }
    })

    const createR2AssetMock = {
      request: {
        query: CREATE_CLOUDFLARE_R2_ASSET,
        variables: {
          input: {
            videoId: 'video-123',
            fileName: 'video-123/variants/529/downloads/1_low.mp4',
            originalFilename: 'test-video.mp4',
            contentType: 'video/mp4',
            contentLength: 13
          }
        }
      },
      result: createR2AssetMockFn
    }

    const videoVariantDownloadCreateMock = {
      request: {
        query: VIDEO_VARIANT_DOWNLOAD_CREATE,
        variables: {
          input: {
            videoVariantId: '1',
            quality: 'low',
            size: 13,
            height: 720,
            width: 1280,
            url: 'https://public.example.com/1',
            version: 0,
            assetId: '1'
          }
        }
      },
      result: videoVariantDownloadCreateMockFn
    }

    const handleClose = jest.fn()

    render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[createR2AssetMock, videoVariantDownloadCreateMock]}
        >
          <AddVideoVariantDownloadDialog
            open={true}
            handleClose={handleClose}
            videoVariantId="1"
            existingQualities={[]}
            languageId="529"
          />
        </MockedProvider>
      </SnackbarProvider>
    )

    const user = userEvent.setup()

    const select = screen.getByLabelText('Quality')
    await user.click(select)
    await user.click(screen.getByRole('option', { name: 'low' }))

    const dropzone = screen.getByTestId('DropZone')
    await user.upload(
      dropzone,
      new File(['video content'], 'test-video.mp4', {
        type: 'video/mp4'
      })
    )

    if (mockVideoElement.onloadedmetadata) {
      mockVideoElement.onloadedmetadata()
    }

    await user.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => {
      expect(createR2AssetMockFn).toHaveBeenCalledTimes(1)
      expect(videoVariantDownloadCreateMockFn).toHaveBeenCalledTimes(1)
    })

    expect(handleClose).toHaveBeenCalled()
  })

  it('should handle close button click', async () => {
    // Reset useParams mock for this test
    const mockedUseParams = useParams as jest.Mock
    mockedUseParams.mockReturnValue({ videoId: 'video-123', locale: 'en' })

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

  it('should show validation error for duplicate quality', async () => {
    // Reset useParams mock for this test
    const mockedUseParams = useParams as jest.Mock
    mockedUseParams.mockReturnValue({ videoId: 'video-123', locale: 'en' })

    render(
      <NextIntlClientProvider
        locale="en"
        messages={{
          Quality: 'Quality',
          high: 'high',
          low: 'low',
          Cancel: 'Cancel',
          Save: 'Save',
          'Drag & drop or choose a file to upload':
            'Drag & drop or choose a file to upload',
          'Upload file': 'Upload file',
          'Upload files': 'Upload files',
          'Add Download': 'Add Download',
          'Quality is required': 'Quality is required',
          'A download with this quality already exists':
            'A download with this quality already exists',
          'File is required': 'File is required'
        }}
      >
        <SnackbarProvider>
          <MockedProvider mocks={[]}>
            <AddVideoVariantDownloadDialog
              open={true}
              handleClose={jest.fn()}
              videoVariantId="1"
              existingQualities={['high']}
              languageId="529"
            />
          </MockedProvider>
        </SnackbarProvider>
      </NextIntlClientProvider>
    )

    const select = screen.getByLabelText('Quality')
    await userEvent.click(select)

    // Verify that low is available as an option
    expect(screen.getByRole('option', { name: 'low' })).toBeInTheDocument()

    // Verify that high is not available as an option
    expect(
      screen.queryByRole('option', { name: 'high' })
    ).not.toBeInTheDocument()
  })

  it('should handle video loading error', async () => {
    // Reset useParams mock for this test
    const mockedUseParams = useParams as jest.Mock
    mockedUseParams.mockReturnValue({ videoId: 'video-123', locale: 'en' })

    render(
      <NextIntlClientProvider
        locale="en"
        messages={{
          Quality: 'Quality',
          high: 'high',
          low: 'low',
          Cancel: 'Cancel',
          Save: 'Save',
          'Drag & drop or choose a file to upload':
            'Drag & drop or choose a file to upload',
          'Upload file': 'Upload file',
          'Upload files': 'Upload files',
          'Add Download': 'Add Download',
          'Quality is required': 'Quality is required',
          'A download with this quality already exists':
            'A download with this quality already exists',
          'File is required': 'File is required'
        }}
      >
        <SnackbarProvider>
          <MockedProvider mocks={[]}>
            <AddVideoVariantDownloadDialog
              open={true}
              handleClose={jest.fn()}
              videoVariantId="1"
              existingQualities={[]}
              languageId="529"
            />
          </MockedProvider>
        </SnackbarProvider>
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()

    const dropzone = screen.getByTestId('DropZone')
    await user.upload(
      dropzone,
      new File(['video content'], 'test-video.mp4', {
        type: 'video/mp4'
      })
    )

    if (mockVideoElement.onerror) {
      mockVideoElement.onerror(new Event('error'))
    }

    expect(screen.getByText('test-video.mp4')).toBeInTheDocument()
  })
})
