import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import SubtitlePage from './page'

// Mock the components used in the page
jest.mock('../_SubtitleFileUpload', () => ({
  SubtitleFileUpload: ({ subtitle }) => (
    <div data-testid="subtitle-file-upload">
      <div data-testid="subtitle-vtt-src">{subtitle?.vttSrc}</div>
      <div data-testid="subtitle-srt-src">{subtitle?.srtSrc}</div>
    </div>
  )
}))

jest.mock('../../../../../../../../components/FormLanguageSelect', () => ({
  FormLanguageSelect: ({ name, label, initialLanguage }) => (
    <div data-testid="form-language-select">
      <div data-testid="language-name">{name}</div>
      <div data-testid="language-label">{label}</div>
      <div data-testid="initial-language-id">{initialLanguage?.id}</div>
    </div>
  )
}))

// Mock the Apollo Client hooks
jest.mock('@apollo/client', () => ({
  useMutation: jest.fn(() => [jest.fn(), { loading: false }]),
  useSuspenseQuery: jest.fn(() => ({
    data: {
      videoEdition: {
        name: 'Test Edition',
        videoSubtitles: [
          {
            id: 'subtitle-123',
            vttSrc: 'https://example.com/subtitle.vtt',
            srtSrc: 'https://example.com/subtitle.srt',
            vttAsset: { id: 'vtt-asset-123' },
            srtAsset: { id: 'srt-asset-123' },
            vttVersion: 1,
            srtVersion: 1,
            language: {
              id: '529',
              name: [
                { value: 'English', primary: true },
                { value: 'English', primary: false }
              ],
              slug: 'en'
            }
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

// Mock the useCreateR2AssetMutation hook
jest.mock(
  '../../../../../../../../libs/useCreateR2Asset/useCreateR2Asset',
  () => ({
    useCreateR2AssetMutation: jest.fn(() => [jest.fn()])
  })
)

// Mock Dialog component
jest.mock('@core/shared/ui/Dialog', () => ({
  Dialog: ({ children, onClose, dialogTitle }) => (
    <div data-testid="dialog">
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
            <button
              data-testid="submit-button"
              onClick={() =>
                onSubmit(initialValues, { setSubmitting: jest.fn() })
              }
            >
              Submit
            </button>
            {typeof children === 'function' ? children(formikBag) : children}
          </originalModule.FormikProvider>
        </div>
      )
    }
  }
})

describe('SubtitlePage', () => {
  const renderComponent = () =>
    render(
      <SnackbarProvider>
        <SubtitlePage
          params={{
            videoId: 'video-123',
            editionId: 'edition-123',
            subtitleId: 'subtitle-123'
          }}
        />
      </SnackbarProvider>
    )

  it('renders the edit subtitle dialog', () => {
    renderComponent()

    expect(screen.getByTestId('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Edit Edition')
    expect(screen.getByTestId('close-button')).toBeInTheDocument()
    expect(screen.getByTestId('form-language-select')).toBeInTheDocument()
    expect(screen.getByTestId('subtitle-file-upload')).toBeInTheDocument()
  })

  it('initializes the form with subtitle data', () => {
    renderComponent()

    expect(screen.getByTestId('initial-values')).toHaveTextContent(
      /"language":"529"/
    )
    expect(screen.getByTestId('initial-language-id')).toHaveTextContent('529')
    expect(screen.getByTestId('subtitle-vtt-src')).toHaveTextContent(
      'https://example.com/subtitle.vtt'
    )
    expect(screen.getByTestId('subtitle-srt-src')).toHaveTextContent(
      'https://example.com/subtitle.srt'
    )
  })

  it('redirects on close button click', async () => {
    const mockRouter = { push: jest.fn() }
    require('next/navigation').useRouter.mockReturnValue(mockRouter)

    renderComponent()

    const user = userEvent.setup()
    await user.click(screen.getByTestId('close-button'))

    expect(mockRouter.push).toHaveBeenCalledWith(
      '/videos/video-123/editions/edition-123',
      { scroll: false }
    )
  })

  it('calls update mutation on form submission', async () => {
    const mockUpdateMutation = jest.fn()
    require('@apollo/client').useMutation.mockReturnValue([
      mockUpdateMutation,
      { loading: false }
    ])

    renderComponent()

    const user = userEvent.setup()
    await user.click(screen.getByTestId('submit-button'))

    await waitFor(() => {
      expect(mockUpdateMutation).toHaveBeenCalledWith(
        expect.objectContaining({
          variables: expect.objectContaining({
            input: expect.objectContaining({
              id: 'subtitle-123',
              languageId: '529'
            })
          })
        })
      )
    })
  })
})
