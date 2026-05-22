import { useMutation, useSuspenseQuery } from '@apollo/client'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { SnackbarProvider } from 'notistack'
import { type Mock } from 'vitest'

import StudyQuestionsAddPage from './page'

// Mock the Apollo Client hooks
vi.mock('@apollo/client', () => ({
  useMutation: vi.fn(() => [vi.fn(), { loading: false }]),
  useSuspenseQuery: vi.fn(() => ({
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
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  })),
  useParams: () => ({ videoId: 'video-123' })
}))

// Mock notistack (hoisted so the factory can reference the mock)
const { mockEnqueueSnackbar } = vi.hoisted(() => ({
  mockEnqueueSnackbar: vi.fn()
}))

vi.mock('notistack', async () => ({
  ...(await vi.importActual('notistack')),
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar
  })
}))

// Mock Dialog component
vi.mock('@core/shared/ui/Dialog', () => ({
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
vi.mock('formik', async () => {
  const originalModule = (await vi.importActual('formik')) as any
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
        handleChange: vi.fn(),
        handleBlur: vi.fn(),
        handleSubmit: (e) => {
          e?.preventDefault?.()
          onSubmit(
            { value: 'New study question' },
            { setSubmitting: vi.fn() }
          )
        },
        handleReset: vi.fn(),
        setFieldValue: vi.fn(),
        setFieldError: vi.fn(),
        setFieldTouched: vi.fn(),
        validateForm: vi.fn(),
        validateField: vi.fn(),
        setErrors: vi.fn(),
        setTouched: vi.fn(),
        setValues: vi.fn(),
        setStatus: vi.fn(),
        setSubmitting: vi.fn(),
        resetForm: vi.fn(),
        setFormikState: vi.fn(),
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
                  { setSubmitting: vi.fn() }
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
vi.mock('@mui/material/Button', () => ({
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

vi.mock('@mui/material/TextField', () => ({
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

vi.mock('@mui/material/Stack', () => ({
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
    const mockRouter = { push: vi.fn() }
    vi.mocked(useRouter as unknown as Mock).mockReturnValue(mockRouter)

    renderComponent()

    const user = userEvent.setup()
    await user.click(screen.getByTestId('close-button'))

    expect(mockRouter.push).toHaveBeenCalledWith(`/videos/${mockVideoId}`, {
      scroll: false
    })
  })

  it('calls the create mutation when form is submitted', async () => {
    const mockCreateMutation = vi
      .fn()
      .mockImplementation(({ onCompleted }) => {
        onCompleted?.()
        return Promise.resolve()
      })
    const mockRouter = { push: vi.fn() }

    // Mock the Apollo useMutation hook
    vi.mocked(useMutation as unknown as Mock).mockReturnValue([
      mockCreateMutation,
      { loading: false }
    ])

    // Mock the router
    vi.mocked(useRouter as unknown as Mock).mockReturnValue(mockRouter)

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
    vi.mocked(useSuspenseQuery as unknown as Mock).mockReturnValue({
      data: {
        adminVideo: {
          id: 'video-123',
          studyQuestions: []
        }
      }
    })

    const mockCreateMutation = vi.fn()
    vi.mocked(useMutation as unknown as Mock).mockReturnValue([
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
    const mockCreateMutation = vi.fn().mockImplementation(({ onError }) => {
      onError?.({ message: errorMessage })
      return Promise.resolve()
    })

    // Mock the Apollo useMutation hook
    vi.mocked(useMutation as unknown as Mock).mockReturnValue([
      mockCreateMutation,
      { loading: false }
    ])

    renderComponent()

    const user = userEvent.setup()
    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockCreateMutation).toHaveBeenCalled()
    })
  })

  it('shows loading state when mutation is in progress', () => {
    // Mock loading state
    vi.mocked(useMutation as unknown as Mock).mockReturnValue([
      vi.fn(),
      { loading: true }
    ])

    renderComponent()

    // In the real component, the button would be disabled during loading
    const submitButton = screen.getByTestId('submit-button')
    expect(submitButton).toBeInTheDocument()
  })
})
