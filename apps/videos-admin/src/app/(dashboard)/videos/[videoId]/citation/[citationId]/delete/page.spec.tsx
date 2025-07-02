import { fireEvent, render, screen } from '@testing-library/react'

import CitationDeletePage from './page'

const mockCitationId = 'citation-123'
const mockVideoId = 'video-123'

// Mock Apollo client
jest.mock('@apollo/client', () => {
  const original = jest.requireActual('@apollo/client')
  return {
    ...original,
    useMutation: jest.fn(() => [jest.fn(), { loading: false }])
  }
})

// Mock Dialog component
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

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

// Create a mock for enqueueSnackbar function
const mockEnqueueSnackbar = jest.fn()

// Mock notistack module
jest.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar
  })
}))

describe('CitationDeletePage', () => {
  // Mock functions
  const mockDeleteMutation = jest.fn()
  const mockRouterPush = jest.fn()
  const mockReturnUrl = `/videos/${mockVideoId}`

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
      .mockImplementation((mutation, options: any = {}) => {
        // Store the callbacks for later use in tests
        const onCompletedCallback = options.onCompleted

        mockDeleteMutation.mockImplementation(() => {
          // Return a Promise that simulates the mutation execution
          return Promise.resolve({ data: { bibleCitationDelete: true } }).then(
            (result) => {
              // Call the onCompleted callback if it exists
              if (onCompletedCallback) {
                onCompletedCallback(result.data)
              }
              return result
            }
          )
        })

        return [mockDeleteMutation, { loading: false }]
      })
  })

  it('renders the delete confirmation dialog', () => {
    render(
      <CitationDeletePage
        params={{ videoId: mockVideoId, citationId: mockCitationId }}
      />
    )

    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'Delete Bible Citation'
    )
    expect(screen.getByTestId('dialog-content')).toHaveTextContent(
      'Are you sure you want to delete this Bible citation? This action cannot be undone.'
    )
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Delete')
    expect(screen.getByTestId('close-button')).toHaveTextContent('Cancel')
  })

  it('navigates back when cancel button is clicked', () => {
    render(
      <CitationDeletePage
        params={{ videoId: mockVideoId, citationId: mockCitationId }}
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
      <CitationDeletePage
        params={{ videoId: mockVideoId, citationId: mockCitationId }}
      />
    )

    // Click delete button
    fireEvent.click(screen.getByTestId('submit-button'))

    // Check if the mutation was called with correct params
    expect(mockDeleteMutation).toHaveBeenCalledWith({
      variables: { id: mockCitationId }
    })
  })

  it('shows loading state while deleting', () => {
    // Mock loading state
    jest
      .spyOn(require('@apollo/client'), 'useMutation')
      .mockReturnValue([mockDeleteMutation, { loading: true }])

    render(
      <CitationDeletePage
        params={{ videoId: mockVideoId, citationId: mockCitationId }}
      />
    )

    // Check that the delete button is disabled
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('shows success message and navigates after successful deletion', async () => {
    // Mock useMutation with onCompleted support
    jest
      .spyOn(require('@apollo/client'), 'useMutation')
      .mockImplementation((mutation, options: any = {}) => {
        // Store the onCompleted callback
        const onCompletedCallback = options.onCompleted

        // Update mock mutation to call onCompleted synchronously and return a resolved promise
        mockDeleteMutation.mockImplementation(() => {
          if (onCompletedCallback) {
            onCompletedCallback({ bibleCitationDelete: true })
          }
          return Promise.resolve({ data: { bibleCitationDelete: true } })
        })

        return [mockDeleteMutation, { loading: false }]
      })

    render(
      <CitationDeletePage
        params={{ videoId: mockVideoId, citationId: mockCitationId }}
      />
    )

    // Click delete button
    fireEvent.click(screen.getByTestId('submit-button'))

    // Wait for async operations to complete
    await new Promise(process.nextTick)

    // Check if success message was shown
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      'Bible citation deleted successfully',
      { variant: 'success' }
    )

    // Check if navigation occurred
    expect(mockRouterPush).toHaveBeenCalledWith(mockReturnUrl, {
      scroll: false
    })
  })
})
