import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NextIntlClientProvider } from 'next-intl'
import { SnackbarProvider } from 'notistack'

import { videoVariantDownloadCreateMock } from '../../../../../../../../../../libs/useVideoVariantDownloadCreateMutation/useVideoVariantDownloadCreateMutation.mock'

import { AddVideoVariantDownloadDialog } from './AddVideoVariantDownloadDialog'

describe('AddVideoVariantDownloadDialog', () => {
  const handleClose = jest.fn()
  const onSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the dialog', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <SnackbarProvider>
            <AddVideoVariantDownloadDialog
              open
              handleClose={handleClose}
              onSuccess={onSuccess}
              videoVariantId="variant-id"
              existingQualities={[]}
            />
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(
      screen.getByRole('heading', { name: 'Add Download' })
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Quality')).toBeInTheDocument()
    expect(screen.getByLabelText('Size (MB)')).toBeInTheDocument()
    expect(screen.getByLabelText('Height')).toBeInTheDocument()
    expect(screen.getByLabelText('Width')).toBeInTheDocument()
    expect(screen.getByLabelText('URL')).toBeInTheDocument()
    expect(screen.getByLabelText('Version')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
  })

  it('should close the dialog when cancel is clicked', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <SnackbarProvider>
            <AddVideoVariantDownloadDialog
              open
              handleClose={handleClose}
              onSuccess={onSuccess}
              videoVariantId="variant-id"
              existingQualities={[]}
            />
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(handleClose).toHaveBeenCalled()
  })

  it('should show validation errors when form is submitted with empty fields', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <SnackbarProvider>
            <AddVideoVariantDownloadDialog
              open
              handleClose={handleClose}
              onSuccess={onSuccess}
              videoVariantId="variant-id"
              existingQualities={[]}
            />
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.getByText('Quality is required')).toBeInTheDocument()
    expect(screen.getByText('Size is required')).toBeInTheDocument()
    expect(screen.getByText('Height is required')).toBeInTheDocument()
    expect(screen.getByText('Width is required')).toBeInTheDocument()
    expect(screen.getByText('URL is required')).toBeInTheDocument()
    expect(screen.getByText('Version is required')).toBeInTheDocument()
  })

  it('should show validation error when quality already exists', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <SnackbarProvider>
            <AddVideoVariantDownloadDialog
              open
              handleClose={handleClose}
              onSuccess={onSuccess}
              videoVariantId="variant-id"
              existingQualities={['high']}
            />
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    // Select high quality
    await userEvent.click(screen.getByLabelText('Quality'))
    await userEvent.click(screen.getByText('high'))

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(
      screen.getByText('A download with this quality already exists')
    ).toBeInTheDocument()
  })

  it('should submit the form successfully', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider mocks={[videoVariantDownloadCreateMock]}>
          <SnackbarProvider>
            <AddVideoVariantDownloadDialog
              open
              handleClose={handleClose}
              onSuccess={onSuccess}
              videoVariantId="variant-id"
              existingQualities={[]}
            />
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    // Fill out the form
    await userEvent.click(screen.getByLabelText('Quality'))
    await userEvent.click(screen.getByText('high'))

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
      expect(onSuccess).toHaveBeenCalled()
      expect(handleClose).toHaveBeenCalled()
    })
  })

  it('should handle file upload', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <SnackbarProvider>
            <AddVideoVariantDownloadDialog
              open
              handleClose={handleClose}
              onSuccess={onSuccess}
              videoVariantId="variant-id"
              existingQualities={[]}
            />
          </SnackbarProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    const file = new File(['dummy content'], 'video.mp4', {
      type: 'video/mp4'
    })

    const fileInput = screen.getByLabelText('Upload File')
    await userEvent.upload(fileInput, file)

    expect((fileInput as HTMLInputElement).files?.[0]).toBe(file)
  })
})
