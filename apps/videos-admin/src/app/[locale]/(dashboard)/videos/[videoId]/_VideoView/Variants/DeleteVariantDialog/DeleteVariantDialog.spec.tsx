import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

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

describe('DeleteVariantDialog', () => {
  it('renders dialog with correct content when open', async () => {
    const handleClose = jest.fn()
    const handleConfirm = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <DeleteVariantDialog
          variant={mockVariant}
          open
          loading={false}
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      </NextIntlClientProvider>
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
    const handleConfirm = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <DeleteVariantDialog
          variant={mockVariant}
          open={false}
          loading={false}
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      </NextIntlClientProvider>
    )

    expect(screen.queryByText('Delete Audio Language')).not.toBeInTheDocument()
  })

  it('calls onClose when Cancel button is clicked', () => {
    const handleClose = jest.fn()
    const handleConfirm = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <DeleteVariantDialog
          variant={mockVariant}
          open
          loading={false}
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      </NextIntlClientProvider>
    )

    // Click on the Cancel button
    fireEvent.click(screen.getByText('Cancel'))

    // Check if onClose was called
    expect(handleClose).toHaveBeenCalled()

    // Check if onConfirm was not called
    expect(handleConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm when Delete button is clicked', async () => {
    const handleClose = jest.fn()
    const handleConfirm = jest.fn().mockResolvedValue(undefined)

    render(
      <NextIntlClientProvider locale="en">
        <DeleteVariantDialog
          variant={mockVariant}
          open
          loading={false}
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      </NextIntlClientProvider>
    )

    // Click on the Delete button
    fireEvent.click(screen.getByText('Delete'))

    // Check if onConfirm was called
    await waitFor(() => {
      expect(handleConfirm).toHaveBeenCalled()
    })

    // Check if onClose was not called
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('disables buttons and shows loading state when loading', () => {
    const handleClose = jest.fn()
    const handleConfirm = jest.fn()

    render(
      <NextIntlClientProvider locale="en">
        <DeleteVariantDialog
          variant={mockVariant}
          open
          loading
          onClose={handleClose}
          onConfirm={handleConfirm}
        />
      </NextIntlClientProvider>
    )

    // Check if Cancel button is disabled
    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeDisabled()

    // Check if Delete button is disabled and shows loading text
    const deleteButton = screen.getByText('Deleting...')
    expect(deleteButton).toBeDisabled()
  })
})
