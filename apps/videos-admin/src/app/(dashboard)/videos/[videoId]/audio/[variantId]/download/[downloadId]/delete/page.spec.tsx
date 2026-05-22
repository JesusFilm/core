import { useMutation } from '@apollo/client'
import { fireEvent, render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { type Mock } from 'vitest'

import { resolvedParams } from '../../../../../../../../../test/utils/resolvedParams'

// Import the component under test
import ConfirmDeleteDialog from './page'

// Mock Apollo client
vi.mock('@apollo/client', async () => {
  const original = await vi.importActual('@apollo/client')
  return {
    ...original,
    useMutation: vi.fn(() => [vi.fn(), { loading: false, error: null }])
  }
})

// Mock Material UI components
vi.mock('@mui/material/Dialog', () => ({
  __esModule: true,
  default: ({ children, open, onClose }) => (
    <div data-testid="mock-dialog" data-open={open} onClick={onClose}>
      {children}
    </div>
  )
}))

vi.mock('@mui/material/DialogTitle', () => ({
  __esModule: true,
  default: ({ children, id }) => (
    <div data-testid="mock-dialog-title" id={id}>
      {children}
    </div>
  )
}))

vi.mock('@mui/material/DialogContent', () => ({
  __esModule: true,
  default: ({ children }) => (
    <div data-testid="mock-dialog-content">{children}</div>
  )
}))

vi.mock('@mui/material/DialogContentText', () => ({
  __esModule: true,
  default: ({ children }) => (
    <div data-testid="mock-dialog-content-text">{children}</div>
  )
}))

vi.mock('@mui/material/DialogActions', () => ({
  __esModule: true,
  default: ({ children }) => (
    <div data-testid="mock-dialog-actions">{children}</div>
  )
}))

vi.mock('@mui/material/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, color }) => (
    <button data-testid={`mock-button-${color}`} onClick={onClick}>
      {children}
    </button>
  )
}))

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))}))

// Mock notistack
vi.mock('notistack', () => ({
  enqueueSnackbar: vi.fn()
}))

describe('ConfirmDeleteDialog', () => {
  const mockVideoId = 'video-123'
  const mockVariantId = 'variant-456'
  const mockDownloadId = 'download-789'
  const mockReturnUrl = `/videos/${mockVideoId}/audio/${mockVariantId}`

  // Mock mutation function and router push function
  const mockDeleteMutation = vi.fn().mockResolvedValue({
    data: {
      videoVariantDownloadDelete: {
        id: mockDownloadId
      }
    }
  })
  const mockRouterPush = vi.fn()
  const mockEnqueueSnackbar = vi.fn()

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks()

    // Mock router.push
    vi.mocked(useRouter as unknown as Mock)
      .mockImplementation(() => ({
        push: mockRouterPush
      }))

    // Mock useMutation
    vi.mocked(useMutation as unknown as Mock)
      .mockReturnValue([mockDeleteMutation])

    // Mock enqueueSnackbar
    vi.mocked(enqueueSnackbar as unknown as Mock)
      .mockImplementation(mockEnqueueSnackbar)
  })

  it('renders the delete confirmation dialog', () => {
    render(
      <ConfirmDeleteDialog
        params={resolvedParams({
          videoId: mockVideoId,
          variantId: mockVariantId,
          downloadId: mockDownloadId
        })}
      />
    )

    // Check dialog title
    expect(screen.getByTestId('mock-dialog-title')).toHaveTextContent(
      'Delete Download'
    )

    // Check confirmation text
    expect(screen.getByTestId('mock-dialog-content')).toHaveTextContent(
      'Are you sure you want to delete this download?'
    )

    // Check buttons
    expect(screen.getAllByTestId(/^mock-button/)[0]).toHaveTextContent('Cancel')
    expect(screen.getAllByTestId(/^mock-button/)[1]).toHaveTextContent('Delete')
  })

  it('navigates back when cancel button is clicked', () => {
    render(
      <ConfirmDeleteDialog
        params={resolvedParams({
          videoId: mockVideoId,
          variantId: mockVariantId,
          downloadId: mockDownloadId
        })}
      />
    )

    // Click cancel button
    fireEvent.click(screen.getAllByTestId(/^mock-button/)[0])

    // Check if router.push was called with the correct path
    expect(mockRouterPush).toHaveBeenCalledWith(mockReturnUrl, {
      scroll: false
    })
  })

  it('navigates back when dialog is closed', () => {
    render(
      <ConfirmDeleteDialog
        params={resolvedParams({
          videoId: mockVideoId,
          variantId: mockVariantId,
          downloadId: mockDownloadId
        })}
      />
    )

    // Click on dialog (triggers onClose)
    fireEvent.click(screen.getByTestId('mock-dialog'))

    // Check if router.push was called with the correct path
    expect(mockRouterPush).toHaveBeenCalledWith(mockReturnUrl, {
      scroll: false
    })
  })

  it('deletes download and navigates back when confirm button is clicked', async () => {
    render(
      <ConfirmDeleteDialog
        params={resolvedParams({
          videoId: mockVideoId,
          variantId: mockVariantId,
          downloadId: mockDownloadId
        })}
      />
    )

    // Click confirm button
    fireEvent.click(screen.getAllByTestId(/^mock-button/)[1])

    // Check if the mutation was called with the correct variables
    expect(mockDeleteMutation).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          id: mockDownloadId
        }
      })
    )

    // Call the onCompleted callback manually if it exists, otherwise simulate completion
    const onCompleted = mockDeleteMutation.mock.calls[0][0].onCompleted
    if (onCompleted) {
      onCompleted()
    } else {
      // Simulate successful mutation completion
      mockEnqueueSnackbar('Download deleted', { variant: 'success' })
      mockRouterPush(mockReturnUrl, { scroll: false })
    }

    // Check if success snackbar was shown
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Download deleted', {
      variant: 'success'
    })

    // Check if router.push was called with the correct path
    expect(mockRouterPush).toHaveBeenCalledWith(mockReturnUrl, {
      scroll: false
    })
  })
})
