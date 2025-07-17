import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import StudyQuestionDialog from './page'

// Mock the StudyQuestionForm component
jest.mock('../_StudyQuestionForm/StudyQuestionForm', () => ({
  StudyQuestionForm: ({ variant, initialValues, onSubmit, loading }) => (
    <div data-testid="study-question-form">
      <div data-testid="form-variant">{variant}</div>
      <div data-testid="form-initial-values">
        {JSON.stringify(initialValues)}
      </div>
      <div data-testid="form-loading">{loading.toString()}</div>
      <button
        data-testid="submit-form-button"
        onClick={() => onSubmit(initialValues)}
      >
        Submit
      </button>
    </div>
  )
}))

// Mock the Apollo Client hooks
jest.mock('@apollo/client', () => ({
  useMutation: jest.fn(() => [jest.fn(), { loading: false }]),
  useSuspenseQuery: jest.fn(() => ({
    data: {
      adminVideo: {
        id: 'video-123',
        studyQuestions: [
          {
            id: 'study-question-123',
            value: 'What is the meaning of this video?'
          },
          {
            id: 'study-question-456',
            value: 'How does this video make you feel?'
          }
        ]
      }
    }
  }))
}))

// Mock the next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}))

// Mock Dialog component
jest.mock('@core/shared/ui/Dialog', () => ({
  Dialog: ({ children, onClose, dialogTitle }) => (
    <div data-testid="mock-dialog">
      <div data-testid="dialog-title">{dialogTitle.title}</div>
      <button data-testid="close-button" onClick={onClose}>
        Close
      </button>
      <div data-testid="dialog-content">{children}</div>
    </div>
  )
}))

describe('StudyQuestionDialog', () => {
  const mockVideoId = 'video-123'
  const mockStudyQuestionId = 'study-question-123'

  const renderComponent = () =>
    render(
      <SnackbarProvider>
        <StudyQuestionDialog
          params={{
            videoId: mockVideoId,
            studyQuestionId: mockStudyQuestionId
          }}
        />
      </SnackbarProvider>
    )

  it('renders the edit study question dialog', () => {
    renderComponent()

    expect(screen.getByTestId('mock-dialog')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'Edit Study Question'
    )
    expect(screen.getByTestId('close-button')).toBeInTheDocument()
    expect(screen.getByTestId('study-question-form')).toBeInTheDocument()
  })

  it('passes correct props to the form', () => {
    renderComponent()

    expect(screen.getByTestId('form-variant')).toHaveTextContent('edit')
    expect(screen.getByTestId('form-initial-values')).toHaveTextContent(
      '{"value":"What is the meaning of this video?"}'
    )
    expect(screen.getByTestId('form-loading')).toHaveTextContent('false')
  })

  it('redirects when close button is clicked', async () => {
    const mockRouter = { push: jest.fn() }
    require('next/navigation').useRouter.mockReturnValue(mockRouter)

    renderComponent()

    const user = userEvent.setup()
    await user.click(screen.getByTestId('close-button'))

    expect(mockRouter.push).toHaveBeenCalledWith(`/videos/${mockVideoId}`)
  })

  it('calls the update mutation when form is submitted', async () => {
    const mockUpdateMutation = jest
      .fn()
      .mockImplementation(({ onCompleted }) => {
        onCompleted?.()
        return Promise.resolve()
      })
    const mockRouter = { push: jest.fn() }
    const mockEnqueueSnackbar = jest.fn()

    // Mock the Apollo useMutation hook
    require('@apollo/client').useMutation.mockReturnValue([
      mockUpdateMutation,
      { loading: false }
    ])

    // Mock the router
    require('next/navigation').useRouter.mockReturnValue(mockRouter)

    // Mock the snackbar
    jest.mock('notistack', () => ({
      ...jest.requireActual('notistack'),
      useSnackbar: () => ({
        enqueueSnackbar: mockEnqueueSnackbar
      })
    }))

    renderComponent()

    const user = userEvent.setup()
    await user.click(screen.getByTestId('submit-form-button'))

    await waitFor(() => {
      expect(mockUpdateMutation).toHaveBeenCalledWith({
        variables: {
          input: {
            id: mockStudyQuestionId,
            value: 'What is the meaning of this video?'
          }
        },
        onCompleted: expect.any(Function),
        onError: expect.any(Function)
      })
    })

    expect(mockRouter.push).toHaveBeenCalledWith(`/videos/${mockVideoId}`, {
      scroll: false
    })
  })

  it('redirects to video page when study question is not found', () => {
    const mockRouter = { push: jest.fn() }
    require('next/navigation').useRouter.mockReturnValue(mockRouter)

    // Mock the data to not include the requested study question
    require('@apollo/client').useSuspenseQuery.mockReturnValue({
      data: {
        adminVideo: {
          id: 'video-123',
          studyQuestions: [
            {
              id: 'study-question-456',
              value: 'How does this video make you feel?'
            }
          ]
        }
      }
    })

    renderComponent()

    expect(mockRouter.push).toHaveBeenCalledWith(`/videos/${mockVideoId}`, {
      scroll: false
    })
  })

  it('handles mutation errors properly', async () => {
    const errorMessage = 'Failed to update study question'

    // Reset the query mock to provide valid data
    require('@apollo/client').useSuspenseQuery.mockReturnValue({
      data: {
        adminVideo: {
          id: 'video-123',
          studyQuestions: [
            {
              id: 'study-question-123',
              value: 'What is the meaning of this video?'
            }
          ]
        }
      }
    })

    // Mock useMutation before rendering component
    const mockUpdateMutation = jest.fn().mockImplementation((options) => {
      if (options && options.onError) {
        options.onError({ message: errorMessage })
      }
      return Promise.resolve()
    })

    require('@apollo/client').useMutation.mockReturnValue([
      mockUpdateMutation,
      { loading: false }
    ])

    // Render the component with mocks in place
    renderComponent()

    // Ensure the component is rendered with the form
    expect(screen.getByTestId('mock-dialog')).toBeInTheDocument()
    expect(screen.getByTestId('study-question-form')).toBeInTheDocument()

    // Get and click the submit button
    const submitButton = screen.getByTestId('submit-form-button')
    expect(submitButton).toBeInTheDocument()

    const user = userEvent.setup()
    await user.click(submitButton)

    // Verify the mutation was called
    await waitFor(() => {
      expect(mockUpdateMutation).toHaveBeenCalled()
    })
  })
})
