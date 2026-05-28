import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'
import { type Mock, type MockedFunction } from 'vitest'

import '../../../../test/i18n'

import { copyToClipboard } from '../../../libs/copyToClipboard'

import { CollectionPublishSuccessDialog } from './CollectionPublishSuccessDialog'

vi.mock('../../../libs/copyToClipboard')

const mockCopyToClipboard = copyToClipboard as MockedFunction<
  typeof copyToClipboard
>

describe('CollectionPublishSuccessDialog', () => {
  let originalOpen: typeof window.open

  beforeEach(() => {
    mockCopyToClipboard.mockReset()
    originalOpen = window.open
    window.open = vi.fn()
  })

  afterEach(() => {
    window.open = originalOpen
  })

  function renderDialog(
    props: Partial<
      React.ComponentProps<typeof CollectionPublishSuccessDialog>
    > = {}
  ): {
    onClose: Mock
  } {
    const onClose = vi.fn()
    render(
      <SnackbarProvider>
        <CollectionPublishSuccessDialog
          open
          publicUrl="https://example.com/p/my-collection"
          slug="my-collection"
          onClose={onClose}
          {...props}
        />
      </SnackbarProvider>
    )
    return { onClose }
  }

  it('renders the public URL in a read-only input', () => {
    renderDialog()
    const input = screen.getByLabelText('Public URL')
    expect(input).toHaveValue('https://example.com/p/my-collection')
    expect(input).toHaveAttribute('readonly')
  })

  it('disables the copy button when publicUrl is null', () => {
    renderDialog({ publicUrl: null })
    const copyButton = screen.getByRole('button', { name: 'Copy link' })
    expect(copyButton).toBeDisabled()
  })

  it('shows a success snackbar when copyToClipboard resolves true', async () => {
    mockCopyToClipboard.mockResolvedValue(true)
    renderDialog()

    await userEvent.click(screen.getByRole('button', { name: 'Copy link' }))

    expect(mockCopyToClipboard).toHaveBeenCalledWith(
      'https://example.com/p/my-collection'
    )
    await waitFor(() => {
      expect(screen.getByText('Link copied to clipboard')).toBeInTheDocument()
    })
  })

  it('shows an error snackbar when copyToClipboard resolves false', async () => {
    mockCopyToClipboard.mockResolvedValue(false)
    renderDialog()

    await userEvent.click(screen.getByRole('button', { name: 'Copy link' }))

    await waitFor(() => {
      expect(screen.getByText("Couldn't copy link")).toBeInTheDocument()
    })
  })

  it('opens the proxy URL (with slug) in a new tab and closes the dialog when "View the page" is clicked', async () => {
    const { onClose } = renderDialog({ slug: 'my-collection' })
    await userEvent.click(screen.getByRole('button', { name: 'View the page' }))
    expect(window.open).toHaveBeenCalledWith(
      '/api/preview-template-gallery?slug=my-collection',
      '_blank',
      'noopener,noreferrer'
    )
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('disables "View the page" when slug is null', () => {
    renderDialog({ slug: null })
    expect(screen.getByRole('button', { name: 'View the page' })).toBeDisabled()
  })

  it('disables "View the page" when publicUrl is null', () => {
    renderDialog({ publicUrl: null })
    expect(screen.getByRole('button', { name: 'View the page' })).toBeDisabled()
  })

  it('disables "View the page" and surfaces the gate copy when canPublish is false', () => {
    renderDialog({
      slug: 'my-collection',
      canPublish: false,
      publishBlockedReason: 'gate copy'
    })
    expect(screen.getByText('gate copy')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View the page' })).toBeDisabled()
  })
})
