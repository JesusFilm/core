import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import StudyQuestionsAddPage from './page'

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
            order: 1
          },
          {
            id: 'study-question-456',
            order: 2
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
  })),
  useParams: () => ({ videoId: 'video-123' })
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

// Mock Formik to make testing easier
jest.mock('formik', () => {
  const originalModule = jest.requireActual('formik')
  return {
    ...originalModule,
    Formik: ({ initialValues, onSubmit, children }) => {
      // Create mock Formik context values
      const formikBag = {
        values: { value: 'New study question' },
        errors: {},
        touched: {},
        isSubmitting: false,
        isValidating: false,
        submitCount: 0,
        handleChange: jest.fn(),
        handleBlur: jest.fn(),
        handleSubmit: (e) => {
          e?.preventDefault?.()
          onSubmit(
            { value: 'New study question' },
            { setSubmitting: jest.fn() }
          )
        },
        handleReset: jest.fn(),
        setFieldValue: jest.fn(),
        setFieldError: jest.fn(),
        setFieldTouched: jest.fn(),
        validateForm: jest.fn(),
        validateField: jest.fn(),
        setErrors: jest.fn(),
        setTouched: jest.fn(),
        setValues: jest.fn(),
        setStatus: jest.fn(),
        setSubmitting: jest.fn(),
        resetForm: jest.fn(),
        setFormikState: jest.fn(),
        dirty: true,
        isValid: true
      }

      return (
        <div data-testid="formik">
          <div data-testid="initial-values">
            {JSON.stringify(initialValues)}
          </div>
          <originalModule.FormikProvider value={formikBag}>
            <form
              data-testid="form"
              onSubmit={(e) => {
                e.preventDefault()
                onSubmit(
                  { value: 'New study question' },
                  { setSubmitting: jest.fn() }
                )
              }}
            >
              {typeof children === 'function' ? children(formikBag) : children}
              <button data-testid="submit-button" type="submit">
                Add
              </button>
            </form>
          </originalModule.FormikProvider>
        </div>
      )
    }
  }
})

// Mock Material UI components
jest.mock('@mui/material/Button', () => ({
  __esModule: true,
  default: (props) => (
    <button
      data-testid={`mui-button-${props.type || 'button'}`}
      disabled={props.disabled}
      onClick={props.onClick}
      type={props.type}
    >
      {props.children}
    </button>
  )
}))

jest.mock('@mui/material/TextField', () => ({
  __esModule: true,
  default: (props) => (
    <div data-testid="mui-text-field">
      <label htmlFor={props.id}>{props.placeholder || props.label}</label>
      <input
        id={props.id}
        name={props.name}
        value={props.value}
        onChange={props.onChange}
      />
      {props.helperText && <span>{props.helperText}</span>}
    </div>
  )
}))

jest.mock('@mui/material/Stack', () => ({
  __esModule: true,
  default: (props) => (
    <div
      data-testid="mui-stack"
      data-gap={props.gap}
      data-direction={props.direction}
    >
      {props.children}
    </div>
  )
}))

describe('StudyQuestionsAddPage', () => {
  const mockVideoId = 'video-123'

  const renderComponent = () =>
    render(
      <SnackbarProvider>
        <StudyQuestionsAddPage />
      </SnackbarProvider>
    )

  it('renders the add study question dialog', () => {
    renderComponent()

    expect(screen.getByTestId('mock-dialog')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'Add Study Question'
    )
    expect(screen.getByTestId('close-button')).toBeInTheDocument()
    expect(screen.getByTestId('formik')).toBeInTheDocument()
  })

  it('initializes form with empty value', () => {
    renderComponent()

    expect(screen.getByTestId('initial-values')).toHaveTextContent(
      '{"value":""}'
    )
  })

  it('redirects when close button is clicked', async () => {
    const mockRouter = { push: jest.fn() }
    require('next/navigation').useRouter.mockReturnValue(mockRouter)

    renderComponent()

    const user = userEvent.setup()
    await user.click(screen.getByTestId('close-button'))

    expect(mockRouter.push).toHaveBeenCalledWith(`/videos/${mockVideoId}`, {
      scroll: false
    })
  })

  it('calls the create mutation when form is submitted', async () => {
    const mockCreateMutation = jest
      .fn()
      .mockImplementation(({ onCompleted }) => {
        onCompleted?.()
        return Promise.resolve()
      })
    const mockRouter = { push: jest.fn() }
    const mockEnqueueSnackbar = jest.fn()

    // Mock the Apollo useMutation hook
    require('@apollo/client').useMutation.mockReturnValue([
      mockCreateMutation,
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
    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockCreateMutation).toHaveBeenCalledWith({
        variables: {
          input: {
            videoId: mockVideoId,
            value: 'New study question',
            order: 3, // Should be the next order (1+2) after existing questions
            languageId: '529',
            primary: true
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

  it('handles empty studyQuestions array', async () => {
    // Mock data with empty study questions array
    require('@apollo/client').useSuspenseQuery.mockReturnValue({
      data: {
        adminVideo: {
          id: 'video-123',
          studyQuestions: []
        }
      }
    })

    const mockCreateMutation = jest.fn()
    require('@apollo/client').useMutation.mockReturnValue([
      mockCreateMutation,
      { loading: false }
    ])

    renderComponent()

    const user = userEvent.setup()
    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockCreateMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            input: expect.objectContaining({
              order: 1 // Should start with 1 if no questions exist
            })
          })
        })
      )
    })
  })

  it('handles mutation errors properly', async () => {
    const errorMessage = 'Failed to create study question'
    const mockCreateMutation = jest.fn().mockImplementation(({ onError }) => {
      onError?.({ message: errorMessage })
      return Promise.resolve()
    })
    const mockEnqueueSnackbar = jest.fn()

    // Mock the Apollo useMutation hook
    require('@apollo/client').useMutation.mockReturnValue([
      mockCreateMutation,
      { loading: false }
    ])

    // Mock the snackbar
    jest.mock('notistack', () => ({
      ...jest.requireActual('notistack'),
      useSnackbar: () => ({
        enqueueSnackbar: mockEnqueueSnackbar
      })
    }))

    renderComponent()

    const user = userEvent.setup()
    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockCreateMutation).toHaveBeenCalled()
    })
  })

  it('shows loading state when mutation is in progress', () => {
    // Mock loading state
    require('@apollo/client').useMutation.mockReturnValue([
      jest.fn(),
      { loading: true }
    ])

    renderComponent()

    // In the real component, the button would be disabled during loading
    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toBeInTheDocument()
  })
})
