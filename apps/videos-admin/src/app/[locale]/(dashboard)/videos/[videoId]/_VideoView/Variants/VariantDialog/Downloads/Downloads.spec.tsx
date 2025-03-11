import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { SnackbarProvider } from 'notistack'

import { GetAdminVideoVariant_Downloads as VariantDownloads } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { videoVariantDownloadCreateMock } from '../../../../../../../../../libs/useVideoVariantDownloadCreateMutation/useVideoVariantDownloadCreateMutation.mock'
import { videoVariantDownloadDeleteMock } from '../../../../../../../../../libs/useVideoVariantDownloadDeleteMutation/useVideoVariantDownloadDeleteMutation.mock'

import { Downloads } from './Downloads'

describe('Downloads', () => {
  const mockVariantDownloads: VariantDownloads =
    useAdminVideoMock['result']?.['data']?.['adminVideo']?.['variants']?.[0]?.[
      'downloads'
    ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show downloads', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[]}>
          <Downloads
            downloads={mockVariantDownloads}
            videoVariantId="variant-id"
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
          <Downloads downloads={[]} videoVariantId="variant-id" />
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
          mocks={[{ ...videoVariantDownloadCreateMock, result: mockResult }]}
        >
          <SnackbarProvider>
            <Downloads downloads={[]} videoVariantId="variant-id" />
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Add Download' }))

    await userEvent.click(screen.getByLabelText('Quality'))
    await userEvent.click(screen.getByRole('option', { name: 'high' }))

    await userEvent.type(screen.getByLabelText('Size (MB)'), '4.94')
    await userEvent.type(screen.getByLabelText('Height'), '720')
    await userEvent.type(screen.getByLabelText('Width'), '1280')
    await userEvent.type(
      screen.getByLabelText('URL'),
      'https://example.com/video.mp4'
    )
    await userEvent.type(screen.getByLabelText('Version'), '1')

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(mockResult).toHaveBeenCalled()
    })
  })
})
