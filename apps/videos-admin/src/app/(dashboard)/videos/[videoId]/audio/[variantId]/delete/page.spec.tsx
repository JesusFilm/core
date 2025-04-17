import { fireEvent, render, screen } from '@testing-library/react'

// Import the component under test
import DeleteAudio from './page'

// Mock Apollo client
jest.mock('@apollo/client', () => {
  const original = jest.requireActual('@apollo/client')
  return {
    ...original,
    useMutation: jest.fn(() => [jest.fn(), { loading: false }]),
    useSuspenseQuery: jest.fn(() => ({
      data: {
        videoVariant: {
          id: 'variant-456',
          language: {
            name: [{ value: 'English' }]
          }
        }
      }
    }))
  }
})

// Mock the Dialog component
jest.mock('@core/shared/ui/Dialog', () => ({
  Dialog: ({ children, onClose, dialogTitle, dialogAction, loading }) => (
    <div data-testid="mock-dialog">
      <div data-testid="dialog-title">{dialogTitle.title}</div>
      <button data-testid="close-button" onClick={onClose}>
        {dialogAction.closeLabel}
      </button>
      <div data-testid="dialog-content">{children}</div>
      <button
        data-testid="submit-button"
        onClick={dialogAction.onSubmit}
        disabled={loading}
      >
        {dialogAction.submitLabel}
      </button>
    </div>
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

describe('DeleteAudio', () => {
  const mockVideoId = 'video-123'
  const mockVariantId = 'variant-456'
  const mockReturnUrl = `/videos/${mockVideoId}/audio`

  // Mock functions
  const mockDeleteMutation = jest.fn()
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
      .mockReturnValue([mockDeleteMutation, { loading: false }])

    // Mock enqueueSnackbar
    jest
      .spyOn(require('notistack'), 'enqueueSnackbar')
      .mockImplementation(mockEnqueueSnackbar)
  })

  it('renders the delete audio dialog with confirmation message', () => {
    render(
      <DeleteAudio
        params={{
          videoId: mockVideoId,
          variantId: mockVariantId
        }}
      />
    )

    // Check dialog title
    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'Delete Audio Language'
    )

    // Check confirmation message
    expect(screen.getByTestId('dialog-content')).toHaveTextContent(
      'Are you sure you want to delete the English audio language? This action cannot be undone.'
    )

    // Check buttons
    expect(screen.getByTestId('close-button')).toHaveTextContent('Cancel')
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Delete')
  })

  it('navigates back when cancel button is clicked', () => {
    render(
      <DeleteAudio
        params={{
          videoId: mockVideoId,
          variantId: mockVariantId
        }}
      />
    )

    // Click cancel button
    fireEvent.click(screen.getByTestId('close-button'))

    // Check if router.push was called with the correct path
    expect(mockRouterPush).toHaveBeenCalledWith(mockReturnUrl, {
      scroll: false
    })
  })

  it('calls delete mutation when delete button is clicked', () => {
    render(
      <DeleteAudio
        params={{
          videoId: mockVideoId,
          variantId: mockVariantId
        }}
      />
    )

    // Click delete button
    fireEvent.click(screen.getByTestId('submit-button'))

    // Check if the mutation was called
    expect(mockDeleteMutation).toHaveBeenCalled()
  })

  it('shows loading state when mutation is in progress', () => {
    // Mock loading state
    jest
      .spyOn(require('@apollo/client'), 'useMutation')
      .mockReturnValue([mockDeleteMutation, { loading: true }])

    render(
      <DeleteAudio
        params={{
          videoId: mockVideoId,
          variantId: mockVariantId
        }}
      />
    )

    // Check that the delete button is disabled
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })
})
