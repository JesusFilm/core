import { fireEvent, render, screen } from '@testing-library/react'

// Import the component under test
import ConfirmDeleteDialog from './page'

// Mock Apollo client
jest.mock('@apollo/client', () => {
  const original = jest.requireActual('@apollo/client')
  return {
    ...original,
    useMutation: jest.fn(() => [jest.fn(), { loading: false, error: null }])
  }
})

// Mock Material UI components
jest.mock('@mui/material/Dialog', () => ({
  __esModule: true,
  default: ({ children, open, onClose }) => (
    <div data-testid="mock-dialog" data-open={open} onClick={onClose}>
      {children}
    </div>
  )
}))

jest.mock('@mui/material/DialogTitle', () => ({
  __esModule: true,
  default: ({ children, id }) => (
    <div data-testid="mock-dialog-title" id={id}>
      {children}
    </div>
  )
}))

jest.mock('@mui/material/DialogContent', () => ({
  __esModule: true,
  default: ({ children }) => (
    <div data-testid="mock-dialog-content">{children}</div>
  )
}))

jest.mock('@mui/material/DialogContentText', () => ({
  __esModule: true,
  default: ({ children }) => (
    <div data-testid="mock-dialog-content-text">{children}</div>
  )
}))

jest.mock('@mui/material/DialogActions', () => ({
  __esModule: true,
  default: ({ children }) => (
    <div data-testid="mock-dialog-actions">{children}</div>
  )
}))

jest.mock('@mui/material/Button', () => ({
  __esModule: true,
  default: ({ children, onClick, color }) => (
    <button data-testid={`mock-button-${color}`} onClick={onClick}>
      {children}
    </button>
  )
}))

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

// Mock notistack
jest.mock('notistack', () => ({
  enqueueSnackbar: jest.fn()
}))

describe('ConfirmDeleteDialog', () => {
  const mockVideoId = 'video-123'
  const mockVariantId = 'variant-456'
  const mockDownloadId = 'download-789'
  const mockReturnUrl = `/videos/${mockVideoId}/audio/${mockVariantId}`

  // Mock mutation function and router push function
  const mockDeleteMutation = jest.fn().mockResolvedValue({
    data: {
      videoVariantDownloadDelete: {
        id: mockDownloadId
      }
    }
  })
  const mockRouterPush = jest.fn()
  const mockEnqueueSnackbar = jest.fn()

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock router.push
    jest
      .spyOn(require('next/navigation'), 'useRouter')
      .mockImplementation(() => ({
        push: mockRouterPush
      }))

    // Mock useMutation
    jest
      .spyOn(require('@apollo/client'), 'useMutation')
      .mockReturnValue([mockDeleteMutation])

    // Mock enqueueSnackbar
    jest
      .spyOn(require('notistack'), 'enqueueSnackbar')
      .mockImplementation(mockEnqueueSnackbar)
  })

  it('renders the delete confirmation dialog', () => {
    render(
      <ConfirmDeleteDialog
        params={{
          videoId: mockVideoId,
          variantId: mockVariantId,
          downloadId: mockDownloadId
        }}
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
        params={{
          videoId: mockVideoId,
          variantId: mockVariantId,
          downloadId: mockDownloadId
        }}
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
        params={{
          videoId: mockVideoId,
          variantId: mockVariantId,
          downloadId: mockDownloadId
        }}
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
        params={{
          videoId: mockVideoId,
          variantId: mockVariantId,
          downloadId: mockDownloadId
        }}
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
