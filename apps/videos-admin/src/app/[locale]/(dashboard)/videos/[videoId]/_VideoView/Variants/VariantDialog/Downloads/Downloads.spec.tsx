import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { SnackbarProvider } from 'notistack'

import { GetAdminVideoVariant_Downloads as VariantDownloads } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { getCreateR2AssetMock } from '../../../../../../../../../libs/useCreateR2Asset/useCreateR2Asset.mock'
import { getVideoVariantDownloadCreateMock } from '../../../../../../../../../libs/useVideoVariantDownloadCreateMutation/useVideoVariantDownloadCreateMutation.mock'
import { videoVariantDownloadDeleteMock } from '../../../../../../../../../libs/useVideoVariantDownloadDeleteMutation/useVideoVariantDownloadDeleteMutation.mock'

import { Downloads } from './Downloads'

const mockVideoElement = {
  remove: jest.fn(),
  videoWidth: 1280,
  videoHeight: 720,
  src: '',
  onloadedmetadata: jest.fn(),
  onerror: jest.fn()
}

const videoVariantDownloadCreateMock = getVideoVariantDownloadCreateMock({
  videoVariantId: 'variant-id',
  quality: 'high',
  size: 13,
  height: 720,
  width: 1280,
  url: 'https://mock.cloudflare-domain.com/video-123/variants/529/downloads/variant-id_high.mp4',
  version: 0,
  assetId: 'r2-asset.id'
})

const createR2AssetMock = getCreateR2AssetMock({
  videoId: 'video-123',
  fileName: 'video-123/variants/529/downloads/variant-id_high.mp4',
  contentType: 'video/mp4',
  contentLength: 13
})

jest.mock('../../AddAudioLanguageDialog/utils/getExtension', () => ({
  getExtension: jest.fn().mockReturnValue('.mp4')
}))

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ videoId: 'video-123', locale: 'en' }))
}))

const originalFetch = global.fetch

const originalCreateElement = document.createElement
const originalCreateObjectURL = URL.createObjectURL
const originalRevokeObjectURL = URL.revokeObjectURL

describe('Downloads', () => {
  const mockVariantDownloads: VariantDownloads =
    useAdminVideoMock['result']?.['data']?.['adminVideo']?.['variants']?.[0]?.[
      'downloads'
    ]

  beforeEach(() => {
    jest.clearAllMocks()
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

  it('should show downloads', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[]}>
          <Downloads
            downloads={mockVariantDownloads}
            videoVariantId="variant-id"
            languageId="529"
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(
      screen.getByRole('heading', { level: 4, name: 'Downloads' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('cell', { name: 'https://arc.gt/4d9ez' })
    ).toBeInTheDocument()
  })

  it('should show message if no downloads available', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[]}>
          <Downloads
            downloads={[]}
            videoVariantId="variant-id"
            languageId="529"
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('No downloads available')).toBeInTheDocument()
  })

  it('should show add download button', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[]}>
          <Downloads
            downloads={mockVariantDownloads}
            videoVariantId="variant-id"
            languageId="529"
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(
      screen.getByRole('button', { name: 'Add Download' })
    ).toBeInTheDocument()
  })

  it('should open add download dialog when button is clicked', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <SnackbarProvider>
            <Downloads
              downloads={mockVariantDownloads}
              videoVariantId="variant-id"
              languageId="529"
            />
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add Download' }))

    expect(
      screen.getByRole('heading', { name: 'Add Download' })
    ).toBeInTheDocument()
  })

  it('should show delete button for each download', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[]}>
          <Downloads
            downloads={mockVariantDownloads}
            videoVariantId="variant-id"
            languageId="529"
          />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(
      mockVariantDownloads.length
    )
  })

  it('should open confirmation dialog when delete button is clicked', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <SnackbarProvider>
            <Downloads
              downloads={mockVariantDownloads}
              videoVariantId="variant-id"
              languageId="529"
            />
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0])

    expect(
      screen.getByText('Are you sure you want to delete this download?')
    ).toBeInTheDocument()
  })

  it('should delete download when confirmed', async () => {
    const mockResult = jest
      .fn()
      .mockReturnValue(videoVariantDownloadDeleteMock.result)

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider
          mocks={[{ ...videoVariantDownloadDeleteMock, result: mockResult }]}
        >
          <SnackbarProvider>
            <Downloads
              downloads={mockVariantDownloads}
              videoVariantId="variant-id"
              languageId="529"
            />
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0])
    await userEvent.click(screen.getByRole('button', { name: 'Confirm' }))

    await waitFor(() => {
      expect(mockResult).toHaveBeenCalled()
    })
  })

  it('should add download when form is submitted', async () => {
    const mockResult = jest
      .fn()
      .mockReturnValue(videoVariantDownloadCreateMock.result)

    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider
          mocks={[
            {
              ...videoVariantDownloadCreateMock,
              result: mockResult
            },
            createR2AssetMock
          ]}
        >
          <SnackbarProvider>
            <Downloads
              downloads={[]}
              videoVariantId="variant-id"
              languageId="529"
            />
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add Download' }))

    await userEvent.click(screen.getByLabelText('Quality'))
    await userEvent.click(screen.getByRole('option', { name: 'high' }))

    const file = new File(['video content'], 'test-video.mp4', {
      type: 'video/mp4'
    })
    await userEvent.upload(screen.getByTestId('DropZone'), file)
    mockVideoElement.onloadedmetadata()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(createR2AssetMock.result).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(mockResult).toHaveBeenCalled()
    })
  })
})
