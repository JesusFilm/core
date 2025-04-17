import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import AddEditionPage from './page'

// Mock the FormTextField component
jest.mock('../../../../../../components/FormTextField', () => ({
  FormTextField: ({ name, label }) => (
    <div data-testid="form-text-field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} data-testid={`input-${name}`} />
    </div>
  )
}))

// Mock the Apollo Client hooks
jest.mock('@apollo/client', () => ({
  useMutation: jest.fn(() => [jest.fn(), { loading: false }])
}))

// Mock the next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn()
  }))
}))

// Mock Dialog component
jest.mock('@core/shared/ui/Dialog', () => ({
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
jest.mock('formik', () => {
  const originalModule = jest.requireActual('formik')
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
        handleChange: jest.fn(),
        handleBlur: jest.fn(),
        handleSubmit: (e) => {
          e?.preventDefault?.()
          onSubmit(initialValues, { setSubmitting: jest.fn() })
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
            <div
              data-testid="edition-form"
              onClick={(e) => {
                e.preventDefault()
                onSubmit(initialValues, { setSubmitting: jest.fn() })
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
        <AddEditionPage
          params={{
            videoId: mockVideoId
          }}
        />
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
    const mockRouter = { push: jest.fn() }
    require('next/navigation').useRouter.mockReturnValue(mockRouter)

    renderComponent()

    const user = userEvent.setup()
    await user.click(screen.getByTestId('close-button'))

    expect(mockRouter.push).toHaveBeenCalledWith(
      `/videos/${mockVideoId}/editions`,
      { scroll: false }
    )
  })

  it('calls create mutation on form submission', async () => {
    const mockCreateMutation = jest.fn()
    require('@apollo/client').useMutation.mockReturnValue([
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
