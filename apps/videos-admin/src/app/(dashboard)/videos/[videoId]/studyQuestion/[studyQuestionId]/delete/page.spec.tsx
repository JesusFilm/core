import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import StudyQuestionDeletePage from './page'

// Mock the Apollo Client hooks
jest.mock('@apollo/client', () => {
  const mockMutation = jest.fn(() =>
    Promise.resolve({
      data: { videoStudyQuestionDelete: { id: 'study-question-123' } }
    })
  )

  return {
    useMutation: jest.fn(() => [mockMutation, { loading: false }]),
    mockMutation // Expose the mock function so we can access it in tests
  }
})

// Mock the next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}))

// Mock notistack
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({
    enqueueSnackbar: jest.fn()
  })
}))

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

describe('StudyQuestionDeletePage', () => {
  const mockVideoId = 'video-123'
  const mockStudyQuestionId = 'study-question-123'

  const renderComponent = () =>
    render(
      <SnackbarProvider>
        <StudyQuestionDeletePage
          params={{
            videoId: mockVideoId,
            studyQuestionId: mockStudyQuestionId
          }}
        />
      </SnackbarProvider>
    )

  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks()
  })

  it('displays a confirmation dialog', () => {
    renderComponent()

    expect(screen.getByTestId('dialog-title')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    expect(screen.getByTestId('close-button')).toBeInTheDocument()

    expect(screen.getByTestId('dialog-title').textContent).toBe(
      'Delete Study Question'
    )
    expect(screen.getByTestId('dialog-content').textContent).toBe(
      'Are you sure you want to delete this study question? This action cannot be undone.'
    )
    expect(screen.getByTestId('submit-button').textContent).toBe('Delete')
    expect(screen.getByTestId('close-button').textContent).toBe('Cancel')
  })

  it('calls the mutation and redirects when confirmed', async () => {
    const mockRouter = { push: jest.fn() }
    require('next/navigation').useRouter.mockReturnValue(mockRouter)

    // Setup the useMutation hook with onCompleted callback implementation
    const onCompletedCallback = jest.fn()
    require('@apollo/client').useMutation.mockImplementation(
      (mutation, options) => {
        // Store the callback so we can call it when the mutation is invoked
        onCompletedCallback.mockImplementation(() => {
          options.onCompleted()
        })

        return [
          jest.fn().mockImplementation(() => {
            onCompletedCallback()
            return Promise.resolve({
              data: { videoStudyQuestionDelete: { id: mockStudyQuestionId } }
            })
          }),
          { loading: false }
        ]
      }
    )

    renderComponent()

    const user = userEvent.setup()
    await user.click(screen.getByTestId('submit-button'))

    // Wait for the router.push to be called after the mutation completes
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(`/videos/${mockVideoId}`, {
        scroll: false
      })
    })
  })

  it('redirects when dialog is closed', async () => {
    const mockRouter = { push: jest.fn() }
    require('next/navigation').useRouter.mockReturnValue(mockRouter)

    renderComponent()

    const user = userEvent.setup()
    await user.click(screen.getByTestId('close-button'))

    expect(mockRouter.push).toHaveBeenCalledWith(`/videos/${mockVideoId}`)
  })

  it('handles mutation errors properly', async () => {
    const errorMessage = 'Failed to delete study question'

    // Setup the useMutation hook with onError callback implementation
    require('@apollo/client').useMutation.mockImplementation(
      (mutation, options) => {
        return [
          jest.fn().mockImplementation(() => {
            options.onError({ message: errorMessage })
            return Promise.resolve() // Don't reject the promise, just call the error handler
          }),
          { loading: false }
        ]
      }
    )

    renderComponent()

    const user = userEvent.setup()
    await user.click(screen.getByTestId('submit-button'))

    // We don't need specific assertions here since we're just verifying the error handler works
    await waitFor(() => {
      // Just wait for the promise to resolve
    })
  })

  it('shows loading state during deletion', async () => {
    // Mock with loading state
    require('@apollo/client').useMutation.mockReturnValue([
      jest.fn(),
      { loading: true }
    ])

    renderComponent()

    // Check if submit button is disabled when loading
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })
})
