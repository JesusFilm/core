import { fireEvent, render, screen } from '@testing-library/react'

// Import the component under test
import AddVideoVariantDownloadDialog from './page'

// Mock Apollo client
jest.mock('@apollo/client', () => {
  const original = jest.requireActual('@apollo/client')
  return {
    ...original,
    useMutation: jest.fn(() => [jest.fn(), { loading: false, error: null }]),
    useSuspenseQuery: jest.fn(() => ({
      data: {
        videoVariant: {
          id: 'variant-456',
          downloads: [{ id: 'existing-download', quality: 'low' }]
        }
      }
    }))
  }
})

// Mock Material UI components
jest.mock('@mui/material/Dialog', () => ({
  __esModule: true,
  default: ({ children, onClose }) => (
    <div data-testid="mock-dialog" onClick={onClose}>
      {children}
    </div>
  )
}))

jest.mock('@mui/material/DialogTitle', () => ({
  __esModule: true,
  default: ({ children }) => (
    <div data-testid="mock-dialog-title">{children}</div>
  )
}))

jest.mock('@mui/material/DialogContent', () => ({
  __esModule: true,
  default: ({ children }) => (
    <div data-testid="mock-dialog-content">{children}</div>
  )
}))

jest.mock('@mui/material/DialogActions', () => ({
  __esModule: true,
  default: ({ children }) => (
    <div data-testid="mock-dialog-actions">{children}</div>
  )
}))

jest.mock('@mui/material/Button', () => ({
  __esModule: true,
  default: ({ children, onClick }) => (
    <button data-testid="mock-button" onClick={onClick}>
      {children}
    </button>
  )
}))

// Mock required components that use DOM APIs
jest.mock('@mui/material/FormControl', () => ({
  __esModule: true,
  default: ({ children }) => (
    <div data-testid="mock-form-control">{children}</div>
  )
}))

jest.mock('@mui/material/InputLabel', () => ({
  __esModule: true,
  default: ({ children }) => (
    <label data-testid="mock-input-label">{children}</label>
  )
}))

jest.mock('@mui/material/Select', () => ({
  __esModule: true,
  default: ({ children }) => (
    <select data-testid="mock-select">{children}</select>
  )
}))

jest.mock('@mui/material/Stack', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="mock-stack">{children}</div>
}))

// Mock FileUpload component
jest.mock('../../../../../../../../../components/FileUpload', () => ({
  FileUpload: () => <div data-testid="mock-file-upload">File Upload</div>
}))

// Mock all other dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

jest.mock('notistack', () => ({
  enqueueSnackbar: jest.fn()
}))

jest.mock('formik', () => ({
  Formik: ({ children }) =>
    children({
      values: { quality: 'high' },
      errors: {},
      touched: {},
      handleSubmit: jest.fn(),
      handleChange: jest.fn(),
      setFieldValue: jest.fn()
    }),
  Form: ({ children }) => <form data-testid="mock-form">{children}</form>
}))

describe('AddVideoVariantDownloadDialog', () => {
  const mockVideoId = 'video-123'
  const mockVariantId = 'variant-456'
  const mockLanguageId = 'lang-789'
  const mockReturnUrl = `/videos/${mockVideoId}/audio/${mockVariantId}`

  // Mock router push function
  const mockRouterPush = jest.fn()

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock router.push
    jest
      .spyOn(require('next/navigation'), 'useRouter')
      .mockImplementation(() => ({
        push: mockRouterPush
      }))
  })

  it('renders the add download dialog with form elements', () => {
    render(
      <AddVideoVariantDownloadDialog
        params={{
          videoId: mockVideoId,
          variantId: mockVariantId,
          downloadId: mockLanguageId
        }}
      />
    )

    // Check dialog title
    expect(screen.getByTestId('mock-dialog-title')).toHaveTextContent(
      'Add Download'
    )

    // Check for form elements
    expect(screen.getByTestId('mock-form')).toBeInTheDocument()
    expect(screen.getByTestId('mock-form-control')).toBeInTheDocument()
    expect(screen.getByTestId('mock-input-label')).toHaveTextContent('Quality')
    expect(screen.getByTestId('mock-select')).toBeInTheDocument()
    expect(screen.getByTestId('mock-file-upload')).toBeInTheDocument()
  })

  it('navigates back when dialog is closed', () => {
    render(
      <AddVideoVariantDownloadDialog
        params={{
          videoId: mockVideoId,
          variantId: mockVariantId,
          downloadId: mockLanguageId
        }}
      />
    )

    // Click on dialog (triggers onClose)
    fireEvent.click(screen.getByTestId('mock-dialog'))

    // Check if router.push was called with the correct path
    expect(mockRouterPush).toHaveBeenCalledWith(mockReturnUrl, {
      scroll: false
    })
  })
})
