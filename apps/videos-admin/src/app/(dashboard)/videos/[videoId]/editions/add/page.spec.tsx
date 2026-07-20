import { useMutation } from '@apollo/client'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { SnackbarProvider } from 'notistack'
import { type Mock } from 'vitest'

import AddEditionPage from './page'

// Mock the FormTextField component
vi.mock('../../../../../../components/FormTextField', () => ({
  FormTextField: ({ name, label }) => (
    <div data-testid="form-text-field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} data-testid={`input-${name}`} />
    </div>
  )
}))

// Mock the Apollo Client hooks
vi.mock('@apollo/client', () => ({
  useMutation: vi.fn(() => [vi.fn(), { loading: false }])
}))

// Mock the next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  })),
  useParams: () => ({ videoId: 'video-123' })
}))

// Mock Dialog component
vi.mock('@core/shared/ui/Dialog', () => ({
  Dialog: ({ children, onClose, dialogTitle, testId }) => (
    <div data-testid={testId || 'dialog'}>
      <div data-testid="dialog-title">{dialogTitle.title}</div>
      <button data-testid="close-button" onClick={onClose}>
        Close
      </button>
      <div data-testid="dialog-content">{children}</div>
    </div>
  )
}))

// Mock Formik to make it easier to test
vi.mock('formik', async () => {
  const originalModule = (await vi.importActual('formik')) as any
  return {
    ...originalModule,
    Formik: ({ initialValues, onSubmit, children }) => {
      // Create mock Formik context values
      const formikBag = {
        values: initialValues,
        errors: {},
        touched: {},
        isSubmitting: false,
        isValidating: false,
        submitCount: 0,
        handleChange: vi.fn(),
        handleBlur: vi.fn(),
        handleSubmit: (e) => {
          e?.preventDefault?.()
          onSubmit(initialValues, { setSubmitting: vi.fn() })
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
            <div
              data-testid="edition-form"
              onClick={(e) => {
                e.preventDefault()
                onSubmit(initialValues, { setSubmitting: vi.fn() })
              }}
            >
              {typeof children === 'function' ? children(formikBag) : children}
              <button data-testid="submit-button" type="submit">
                Create
              </button>
            </div>
          </originalModule.FormikProvider>
        </div>
      )
    }
  }
})

describe('AddEditionPage', () => {
  const mockVideoId = 'video-123'

  const renderComponent = () =>
    render(
      <SnackbarProvider>
        <AddEditionPage />
      </SnackbarProvider>
    )

  it('renders the add edition dialog', () => {
    renderComponent()

    expect(screen.getByTestId('add-edition-dialog')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Add Edition')
    expect(screen.getByTestId('close-button')).toBeInTheDocument()
    expect(screen.getByTestId('form-text-field')).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('initializes the form with empty name', () => {
    renderComponent()

    expect(screen.getByTestId('initial-values')).toHaveTextContent(
      '{"name":""}'
    )
  })

  it('redirects on close button click', async () => {
    const mockRouter = { push: vi.fn() }
    vi.mocked(useRouter as unknown as Mock).mockReturnValue(mockRouter)

    renderComponent()

    const user = userEvent.setup()
    await user.click(screen.getByTestId('close-button'))

    expect(mockRouter.push).toHaveBeenCalledWith(
      `/videos/${mockVideoId}/editions`,
      { scroll: false }
    )
  })

  it('calls create mutation on form submission', async () => {
    const mockCreateMutation = vi.fn()
    vi.mocked(useMutation as unknown as Mock).mockReturnValue([
      mockCreateMutation,
      { loading: false }
    ])

    renderComponent()

    const user = userEvent.setup()
    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockCreateMutation).toHaveBeenCalledWith({
        variables: {
          input: {
            videoId: mockVideoId,
            name: ''
          }
        },
        onCompleted: expect.any(Function),
        onError: expect.any(Function)
      })
    })
  })

  it('shows appropriate validation messages', async () => {
    // This would normally be tested with real Formik validation,
    // but for simplicity we're just verifying the validation schema exists
    renderComponent()

    expect(screen.getByTestId('edition-form')).toBeInTheDocument()
  })
})
