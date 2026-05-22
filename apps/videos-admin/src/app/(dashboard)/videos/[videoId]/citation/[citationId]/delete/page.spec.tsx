import { useMutation } from '@apollo/client'
import { fireEvent, render, screen } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { type Mock } from 'vitest'

import { resolvedParams } from '../../../../../../../test/utils/resolvedParams'

import CitationDeletePage from './page'

const mockCitationId = 'citation-123'
const mockVideoId = 'video-123'

// Mock Apollo client
vi.mock('@apollo/client', async () => {
  const original = await vi.importActual('@apollo/client')
  return {
    ...original,
    useMutation: vi.fn(() => [vi.fn(), { loading: false }])
  }
})

// Mock Dialog component
vi.mock('@core/shared/ui/Dialog', () => ({
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

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))}))

// Create a mock for enqueueSnackbar function
const mockEnqueueSnackbar = vi.fn()

// Mock notistack module
vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar
  })
}))

describe('CitationDeletePage', () => {
  // Mock functions
  const mockDeleteMutation = vi.fn()
  const mockRouterPush = vi.fn()
  const mockReturnUrl = `/videos/${mockVideoId}`

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
        params={resolvedParams({
          videoId: mockVideoId,
          citationId: mockCitationId
        })}
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
        params={resolvedParams({
          videoId: mockVideoId,
          citationId: mockCitationId
        })}
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
        params={resolvedParams({
          videoId: mockVideoId,
          citationId: mockCitationId
        })}
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
    vi.mocked(useMutation as unknown as Mock)
      .mockReturnValue([mockDeleteMutation, { loading: true }])

    render(
      <CitationDeletePage
        params={resolvedParams({
          videoId: mockVideoId,
          citationId: mockCitationId
        })}
      />
    )

    // Check that the delete button is disabled
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('shows success message and navigates after successful deletion', async () => {
    // Mock useMutation with onCompleted support
    vi.mocked(useMutation as unknown as Mock)
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
        params={resolvedParams({
          videoId: mockVideoId,
          citationId: mockCitationId
        })}
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
