import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { SnackbarProvider } from 'notistack'

import { DELETE_VIDEO_VARIANT } from '../../../../../../../../libs/useDeleteVideoVariantMutation'

import { DeleteVariantDialog } from './DeleteVariantDialog'

const mockVariant = {
  id: 'variant-1',
  videoId: 'video-1',
  slug: 'variant-slug',
  videoEdition: {
    id: 'edition-1',
    name: 'base'
  },
  videoSubtitles: [
    {
      id: 'subtitle-1',
      language: {
        id: 'lang-1',
        name: [
          {
            value: 'English',
            primary: true
          }
        ],
        slug: 'en'
      },
      downloads: [
        {
          id: 'download-1',
          quality: 'low' as const,
          size: 1000,
          height: 720,
          width: 1280,
          url: 'https://example.com/video.mp4'
        }
      ]
    }
  ],
  language: {
    id: 'lang-1',
    name: [
      {
        value: 'English',
        primary: true
      }
    ],
    slug: 'en'
  },
  downloads: [
    {
      id: 'download-1',
      quality: 'low' as const,
      size: 1000,
      height: 720,
      width: 1280,
      url: 'https://example.com/video.mp4'
    }
  ]
}

const deleteMutationMock = {
  request: {
    query: DELETE_VIDEO_VARIANT,
    variables: {
      id: mockVariant.id
    }
  },
  result: {
    data: {
      videoVariantDelete: {
        id: mockVariant.id,
        videoId: mockVariant.videoId
      }
    }
  }
}

describe('DeleteVariantDialog', () => {
  it('renders dialog with correct content when open', async () => {
    const handleClose = jest.fn()
    const handleSuccess = jest.fn()

    render(
      <MockedProvider mocks={[deleteMutationMock]}>
        <NextIntlClientProvider locale="en">
          <SnackbarProvider>
            <DeleteVariantDialog
              variant={mockVariant}
              open
              onClose={handleClose}
              onSuccess={handleSuccess}
            />
          </SnackbarProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Delete Audio Language')).toBeInTheDocument()

    await waitFor(() =>
      expect(screen.getByText('deleteVariantDialog')).toBeInTheDocument()
    )

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('does not render dialog when not open', () => {
    const handleClose = jest.fn()
    const handleSuccess = jest.fn()

    render(
      <MockedProvider mocks={[deleteMutationMock]}>
        <NextIntlClientProvider locale="en">
          <SnackbarProvider>
            <DeleteVariantDialog
              variant={mockVariant}
              open={false}
              onClose={handleClose}
              onSuccess={handleSuccess}
            />
          </SnackbarProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    expect(screen.queryByText('Delete Audio Language')).not.toBeInTheDocument()
  })

  it('calls onClose when Cancel button is clicked', () => {
    const handleClose = jest.fn()
    const handleSuccess = jest.fn()

    render(
      <MockedProvider mocks={[deleteMutationMock]}>
        <NextIntlClientProvider locale="en">
          <SnackbarProvider>
            <DeleteVariantDialog
              variant={mockVariant}
              open
              onClose={handleClose}
              onSuccess={handleSuccess}
            />
          </SnackbarProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    // Click on the Cancel button
    fireEvent.click(screen.getByText('Cancel'))

    // Check if onClose was called
    expect(handleClose).toHaveBeenCalled()
    expect(handleSuccess).not.toHaveBeenCalled()
  })

  it('calls the mutation and onSuccess when Delete button is clicked', async () => {
    const handleClose = jest.fn()
    const handleSuccess = jest.fn()

    // Create a mock for the delete mutation that we can track
    const deleteMutationMockResult = jest
      .fn()
      .mockResolvedValue(deleteMutationMock.result)

    render(
      <MockedProvider
        mocks={[{ ...deleteMutationMock, result: deleteMutationMockResult }]}
      >
        <NextIntlClientProvider locale="en">
          <SnackbarProvider>
            <DeleteVariantDialog
              variant={mockVariant}
              open
              onClose={handleClose}
              onSuccess={handleSuccess}
            />
          </SnackbarProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    // Click on the Delete button
    fireEvent.click(screen.getByText('Delete'))

    // Check if mutation is called
    await waitFor(() => {
      expect(deleteMutationMockResult).toHaveBeenCalled()
    })

    // Check if success message appears
    await waitFor(() => {
      expect(
        screen.getByText('Audio language deleted successfully')
      ).toBeInTheDocument()
    })

    // Check if onSuccess was called
    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalled()
    })

    // Check if onClose was called
    expect(handleClose).toHaveBeenCalled()
  })

  it('shows error snackbar when mutation fails', async () => {
    const handleClose = jest.fn()
    const handleSuccess = jest.fn()

    // Create a mock that rejects
    const errorMock = {
      ...deleteMutationMock,
      error: new Error('Failed to delete')
    }

    render(
      <MockedProvider mocks={[errorMock]}>
        <NextIntlClientProvider locale="en">
          <SnackbarProvider>
            <DeleteVariantDialog
              variant={mockVariant}
              open
              onClose={handleClose}
              onSuccess={handleSuccess}
            />
          </SnackbarProvider>
        </NextIntlClientProvider>
      </MockedProvider>
    )

    // Click on the Delete button
    fireEvent.click(screen.getByText('Delete'))

    // Check if error message appears
    await waitFor(() => {
      expect(
        screen.getByText('Failed to delete audio language')
      ).toBeInTheDocument()
    })

    // Check if onSuccess was not called
    expect(handleSuccess).not.toHaveBeenCalled()

    // Check if onClose was not called
    expect(handleClose).not.toHaveBeenCalled()
  })
})
