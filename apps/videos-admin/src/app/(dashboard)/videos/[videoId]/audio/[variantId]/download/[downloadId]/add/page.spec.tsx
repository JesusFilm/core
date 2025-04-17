import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

// Import the component under test
import AddVideoVariantDownloadDialog from './page'

// Mock form requestSubmit method which is not implemented in JSDOM
HTMLFormElement.prototype.requestSubmit = jest.fn(function () {
  // Simple mock: just dispatch a submit event
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
  this.dispatchEvent(submitEvent)
})

// Mock React's useState before other imports to ensure it's available
const mockSetIsTranscoding = jest.fn()
const mockSetTranscodeJobId = jest.fn()

jest.mock('react', () => {
  const originalReact = jest.requireActual('react')
  const mockUseState = jest.fn().mockImplementation((initialValue) => {
    // Mock different state setters based on the initial value
    if (initialValue === false && typeof initialValue === 'boolean') {
      // This should match for isLoading and isTranscoding
      return [false, mockSetIsTranscoding]
    }
    if (initialValue === null) {
      // This will match for transcodeJobId, transcodeProgress, uploadedFile, videoDimensions
      return [null, mockSetTranscodeJobId]
    }
    // Default fallback for other useState calls
    return [initialValue, jest.fn()]
  })

  return {
    ...originalReact,
    useState: mockUseState
  }
})

// Mock Apollo client
jest.mock('@apollo/client', () => {
  const original = jest.requireActual('@apollo/client')
  return {
    ...original,
    useMutation: jest.fn((mutation: any) => {
      // Get the mock name based on the operation definition
      const operationName = mutation?.definitions?.[0]?.name?.value

      // Return different mock functions based on the mutation
      if (operationName === 'VideoVariantDownloadCreate') {
        return [jest.fn(), { loading: false, error: null }]
      }
      if (operationName === 'TranscodeAsset') {
        return [
          jest.fn().mockResolvedValue({
            data: { transcodeAsset: 'mock-transcode-job-id' }
          }),
          { loading: false, error: null }
        ]
      }
      // Default fallback
      return [jest.fn(), { loading: false, error: null }]
    }),
    useSuspenseQuery: jest.fn(() => ({
      data: {
        videoVariant: {
          id: 'variant-456',
          downloads: [{ id: 'existing-download', quality: 'low' }],
          asset: { id: 'asset-123' }
        }
      }
    })),
    useQuery: jest.fn(() => ({
      data: {
        getTranscodeAssetProgress: 50
      },
      refetch: jest.fn().mockResolvedValue({
        data: { getTranscodeAssetProgress: 100 }
      })
    }))
  }
})

// Special mock for Formik to properly handle state changes
const formikValues = {
  quality: 'high',
  file: null
}

jest.mock('formik', () => ({
  Formik: ({ children, initialValues, onSubmit }) => {
    // Update the initial formikValues
    Object.assign(formikValues, initialValues)

    return children({
      values: formikValues,
      errors: {},
      touched: {},
      handleSubmit: (e) => {
        if (e && e.preventDefault) {
          e.preventDefault()
        }
        return onSubmit(formikValues)
      },
      handleChange: (e) => {
        const { name, value } = e.target
        formikValues[name] = value
        return e
      },
      setFieldValue: (field, value) => {
        formikValues[field] = value
      }
    })
  },
  Form: ({ children, onSubmit }) => (
    <form
      data-testid="mock-form"
      onSubmit={(e) => {
        e.preventDefault()
        if (onSubmit) onSubmit(e)
      }}
    >
      {children}
    </form>
  )
}))

// Mock the FileUpload component to handle quality type
jest.mock('../../../../../../../../../components/FileUpload', () => ({
  FileUpload: ({ onDrop }) => {
    // Only render if not generate quality
    if (formikValues.quality?.startsWith('generate-')) {
      return null
    }

    return (
      <div
        data-testid="mock-file-upload"
        onClick={() => {
          const mockFile = new File(['dummy content'], 'test.mp4', {
            type: 'video/mp4'
          })
          onDrop(mockFile)
        }}
      >
        File Upload
      </div>
    )
  }
}))

// Mock Material UI components
jest.mock('@mui/material/Dialog', () => ({
  __esModule: true,
  default: ({ children, open, onClose }) => (
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
  default: ({ children, onChange, value, name }) => (
    <select
      data-testid="mock-select"
      onChange={onChange}
      value={value}
      name={name}
    >
      {children}
    </select>
  )
}))

jest.mock('@mui/material/MenuItem', () => ({
  __esModule: true,
  default: ({ children, value, disabled }) => (
    <option value={value} disabled={disabled} data-testid={`option-${value}`}>
      {children}
    </option>
  )
}))

jest.mock('@mui/material/LinearProgress', () => ({
  __esModule: true,
  default: ({ value }) => (
    <div data-testid="mock-progress-bar" data-value={value}>
      Progress: {value}%
    </div>
  )
}))

jest.mock('@mui/material/Typography', () => ({
  __esModule: true,
  default: ({ children, variant, color }) => (
    <div
      data-testid={`mock-typography-${variant || 'default'}`}
      data-color={color}
    >
      {children}
    </div>
  )
}))

jest.mock('@mui/material/Stack', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="mock-stack">{children}</div>
}))

jest.mock('@mui/material/Box', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="mock-box">{children}</div>
}))

jest.mock('@mui/material/FormHelperText', () => ({
  __esModule: true,
  default: ({ children }) => (
    <div data-testid="mock-helper-text">{children}</div>
  )
}))

// Mock LinkFile component
jest.mock('../../../../../../../../../components/LinkFile', () => ({
  LinkFile: ({ name, link }) => (
    <div data-testid="mock-link-file" data-name={name} data-link={link}>
      {name}
    </div>
  )
}))

// Mock custom Dialog component to provide access to the submit action
jest.mock('@core/shared/ui/Dialog', () => ({
  Dialog: ({ children, dialogTitle, onClose, dialogAction }) => (
    <div data-testid="mock-custom-dialog">
      <div data-testid="mock-custom-dialog-title">{dialogTitle.title}</div>
      <div data-testid="mock-custom-dialog-content">{children}</div>
      <div data-testid="mock-custom-dialog-actions">
        <button data-testid="cancel-button" onClick={onClose}>
          {dialogAction.closeLabel}
        </button>
        <button data-testid="submit-button" onClick={dialogAction.onSubmit}>
          {dialogAction.submitLabel}
        </button>
      </div>
    </div>
  )
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
  Formik: ({ children, initialValues, onSubmit }) =>
    children({
      values: initialValues,
      errors: {},
      touched: {},
      handleSubmit: onSubmit,
      handleChange: jest.fn().mockImplementation((e) => {
        initialValues[e.target.name] = e.target.value
        return e
      }),
      setFieldValue: jest.fn().mockImplementation((field, value) => {
        initialValues[field] = value
      })
    }),
  Form: ({ children, onSubmit }) => (
    <form data-testid="mock-form" onSubmit={onSubmit}>
      {children}
    </form>
  )
}))

// Mock the useCreateR2AssetMutation
jest.mock('../../../../../../../../../libs/useCreateR2Asset', () => ({
  uploadAssetFile: jest.fn(),
  useCreateR2AssetMutation: () => [
    jest.fn().mockResolvedValue({
      data: {
        cloudflareR2Create: {
          id: 'mock-asset-id',
          uploadUrl: 'https://mock-upload-url.com',
          publicUrl: 'https://mock-public-url.com'
        }
      }
    })
  ]
}))

// Mock the getExtension utility
jest.mock('../../../../add/_utils/getExtension', () => ({
  getExtension: jest.fn().mockReturnValue('.mp4')
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

    // Reset formikValues for each test
    formikValues.quality = 'high'
    formikValues.file = null

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
    expect(screen.getByTestId('mock-custom-dialog-title')).toHaveTextContent(
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

    // Click on cancel button
    fireEvent.click(screen.getByTestId('cancel-button'))

    // Check if router.push was called with the correct path
    expect(mockRouterPush).toHaveBeenCalledWith(mockReturnUrl, {
      scroll: false
    })
  })

  it('shows transcoding options when a video asset is available', () => {
    render(
      <AddVideoVariantDownloadDialog
        params={{
          videoId: mockVideoId,
          variantId: mockVariantId,
          downloadId: mockLanguageId
        }}
      />
    )

    // Ensure the generate options are available
    expect(screen.getByTestId('option-generate-high')).toBeInTheDocument()
    expect(screen.getByTestId('option-generate-low')).toBeInTheDocument()

    // Check that they are not disabled
    expect(screen.getByTestId('option-generate-high')).not.toHaveAttribute(
      'disabled'
    )
    expect(screen.getByTestId('option-generate-low')).not.toHaveAttribute(
      'disabled'
    )
  })
})
