import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'

import { SnackbarProvider } from '../../../../../../../../../../libs/SnackbarProvider'
import { CREATE_CLOUDFLARE_R2_ASSET } from '../../../../../../../../../../libs/useCreateR2Asset/useCreateR2Asset'
import { getCreateR2AssetMock } from '../../../../../../../../../../libs/useCreateR2Asset/useCreateR2Asset.mock'
import { VIDEO_VARIANT_DOWNLOAD_CREATE } from '../../../../../../../../../../libs/useVideoVariantDownloadCreateMutation/useVideoVariantDownloadCreateMutation'
import { getVideoVariantDownloadCreateMock } from '../../../../../../../../../../libs/useVideoVariantDownloadCreateMutation/useVideoVariantDownloadCreateMutation.mock'

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
      <NextIntlClientProvider locale="en">
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
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Add Download')).toBeInTheDocument()
    expect(screen.getByLabelText('Quality')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('should not allow selecting a quality that already exists', async () => {
    render(
      <NextIntlClientProvider locale="en">
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
      </NextIntlClientProvider>
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
      <NextIntlClientProvider locale="en">
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
      </NextIntlClientProvider>
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
      <NextIntlClientProvider locale="en">
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
      </NextIntlClientProvider>
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

  it('should create a download with correct values', async () => {
    window.URL.createObjectURL = jest.fn()

    const createR2AssetMockFn = jest.fn().mockReturnValue({
      data: {
        createCloudflareR2Asset: {
          id: '1',
          fileName: 'fileName',
          originalFilename: 'someFile.mp4',
          uploadUrl: 'uploadUrl',
          publicUrl: 'publicUrl'
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
            fileName: expect.any(String),
            fileCategory: 'VIDEO',
            originalFilename: 'test-video.mp4',
            contentType: 'video/mp4',
            contentLength: expect.any(Number),
            videoId: 'video-123'
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
            cloudflareR2AssetId: '1',
            videoVariantId: '1',
            quality: 'low'
          }
        }
      },
      result: videoVariantDownloadCreateMockFn
    }

    const handleClose = jest.fn()

    render(
      <NextIntlClientProvider locale="en" messages={{}}>
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
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()

    const select = screen.getByLabelText('Quality')
    await user.click(select)
    await user.click(screen.getByRole('option', { name: 'SD' }))

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

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(createR2AssetMockFn).toHaveBeenCalledTimes(1)
      expect(videoVariantDownloadCreateMockFn).toHaveBeenCalledTimes(1)
    })

    expect(handleClose).toHaveBeenCalled()
  })

  it('should handle close button click', async () => {
    const handleClose = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
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
      </NextIntlClientProvider>
    )

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(handleClose).toHaveBeenCalled()
  })
})
