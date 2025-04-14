import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { act } from 'react'

import { useLanguagesQuery } from '@core/journeys/ui/useLanguagesQuery'

import { useUploadVideoVariant } from '../../../../../_uploadVideoVariantProvider'

import AddAudioLanguageDialog from './page'

// Mock useSuspenseQuery
jest.mock('@apollo/client', () => {
  const originalModule = jest.requireActual('@apollo/client')
  return {
    ...originalModule,
    useSuspenseQuery: jest.fn((query) => {
      return {
        data: {
          adminVideo: {
            variants: [
              {
                id: 'variant-1',
                language: {
                  id: 'lang-1'
                }
              }
            ],
            videoEditions: [
              {
                id: 'edition-1',
                name: 'Standard'
              },
              {
                id: 'edition-2',
                name: "Director's Cut"
              }
            ]
          }
        }
      }
    })
  }
})

// Mock Dialog component to make testing easier
jest.mock('@core/shared/ui/Dialog', () => ({
  Dialog: ({ children, dialogTitle, slotProps, onClose }) => (
    <div data-testid="mock-dialog">
      <div data-testid="dialog-title">{dialogTitle.title}</div>
      <button
        aria-label="Close"
        data-testid="close-button"
        disabled={slotProps?.titleButton?.disabled}
        onClick={onClose}
      />
      {children}
    </div>
  )
}))

// Mock LanguageAutocomplete component
jest.mock('@core/shared/ui/LanguageAutocomplete', () => ({
  LanguageAutocomplete: ({ onChange, value, renderInput, disabled }) => (
    <div>
      <input
        aria-label="Language"
        data-testid="language-input"
        onChange={(e) =>
          onChange({
            id: 'lang-2',
            slug: 'spanish',
            name: { value: 'Spanish' }
          })
        }
        disabled={disabled}
      />
    </div>
  )
}))

// Mock the audio language file upload component
jest.mock('./_upload', () => ({
  AudioLanguageFileUpload: ({ disabled, onFileSelect, error }) => (
    <div data-testid="AudioLanguageFileUpload">
      <input
        type="file"
        data-testid="file-input"
        onChange={() =>
          onFileSelect(new File(['test'], 'test.mp4', { type: 'video/mp4' }))
        }
        disabled={disabled}
      />
      {error && <div data-testid="error-message">{error}</div>}
    </div>
  )
}))

// Mock Select component from MUI
jest.mock('@mui/material/Select', () => {
  return {
    __esModule: true,
    default: ({ children, onChange, disabled, value, label, ...props }) => (
      <div>
        <select
          aria-label={label}
          data-testid="mui-select"
          onChange={(e) => onChange({ target: { value: e.target.value } })}
          disabled={disabled}
          value={value}
        >
          {children}
        </select>
        <div data-testid="select-options">{children}</div>
      </div>
    )
  }
})

// Mock MenuItem component from MUI
jest.mock('@mui/material/MenuItem', () => {
  return {
    __esModule: true,
    default: ({ children, value }) => <option value={value}>{children}</option>
  }
})

// Mock Button component from MUI
jest.mock('@mui/material/Button', () => {
  return {
    __esModule: true,
    default: ({ children, disabled, onClick, type }) => (
      <button
        onClick={onClick}
        disabled={disabled}
        type={type}
        data-testid={type === 'submit' ? 'submit-button' : 'button'}
      >
        {children}
      </button>
    )
  }
})

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}))

// Mock providers and hooks
jest.mock('../../../../../_uploadVideoVariantProvider', () => ({
  useUploadVideoVariant: jest.fn()
}))

// Mock useLanguagesQuery since its imported from external module
jest.mock('@core/journeys/ui/useLanguagesQuery', () => ({
  useLanguagesQuery: jest.fn()
}))

const mockVideoId = 'video-123'

const mockLanguages = [
  {
    id: 'lang-1',
    name: {
      value: 'English',
      primary: true
    },
    slug: 'english',
    bcp47: 'en'
  },
  {
    id: 'lang-2',
    name: {
      value: 'Spanish',
      primary: true
    },
    slug: 'spanish',
    bcp47: 'es'
  }
]

describe('AddAudioLanguageDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock useLanguagesQuery
    ;(useLanguagesQuery as jest.Mock).mockReturnValue({
      data: {
        languages: mockLanguages
      },
      loading: false
    })

    // Mock useUploadVideoVariant
    ;(useUploadVideoVariant as jest.Mock).mockReturnValue({
      uploadState: {
        isUploading: false,
        isProcessing: false,
        uploadProgress: 0,
        error: null
      },
      startUpload: jest.fn(),
      clearUploadState: jest.fn()
    })
  })

  it('renders the dialog with form elements', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <AddAudioLanguageDialog params={{ videoId: mockVideoId }} />
        </MockedProvider>
      </SnackbarProvider>
    )

    // Dialog title should be visible
    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'Add Audio Language'
    )

    // Form elements should be visible
    expect(screen.getByTestId('mui-select')).toBeInTheDocument()
    expect(screen.getByTestId('language-input')).toBeInTheDocument()
    expect(screen.getByTestId('AudioLanguageFileUpload')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('displays available editions from the query', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <AddAudioLanguageDialog params={{ videoId: mockVideoId }} />
        </MockedProvider>
      </SnackbarProvider>
    )

    // Edition options should be displayed in the select
    expect(screen.getByTestId('select-options')).toHaveTextContent('Standard')
    expect(screen.getByTestId('select-options')).toHaveTextContent(
      "Director's Cut"
    )
  })

  it('handles form interaction', async () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <AddAudioLanguageDialog params={{ videoId: mockVideoId }} />
        </MockedProvider>
      </SnackbarProvider>
    )

    // Fill out the form
    // First set the edition
    await act(async () => {
      fireEvent.change(screen.getByTestId('mui-select'), {
        target: { value: 'Standard' }
      })
    })

    // Then set the language
    await act(async () => {
      fireEvent.change(screen.getByTestId('language-input'))
    })

    // Finally upload a file
    await act(async () => {
      fireEvent.change(screen.getByTestId('file-input'))
    })
  })

  it('disables form controls during upload', async () => {
    ;(useUploadVideoVariant as jest.Mock).mockReturnValue({
      uploadState: {
        isUploading: true,
        isProcessing: false,
        uploadProgress: 50,
        error: null
      },
      startUpload: jest.fn(),
      clearUploadState: jest.fn()
    })

    render(
      <SnackbarProvider>
        <MockedProvider>
          <AddAudioLanguageDialog params={{ videoId: mockVideoId }} />
        </MockedProvider>
      </SnackbarProvider>
    )

    // Form elements should be disabled
    expect(screen.getByTestId('mui-select')).toBeDisabled()
    expect(screen.getByTestId('language-input')).toBeDisabled()
    expect(screen.getByTestId('submit-button')).toBeDisabled()
    // Close button should be disabled
    expect(screen.getByTestId('close-button')).toBeDisabled()
  })

  it('handles upload errors', async () => {
    ;(useUploadVideoVariant as jest.Mock).mockReturnValue({
      uploadState: {
        isUploading: false,
        isProcessing: false,
        uploadProgress: 0,
        error: 'Upload failed'
      },
      startUpload: jest.fn(),
      clearUploadState: jest.fn()
    })

    render(
      <SnackbarProvider>
        <MockedProvider>
          <AddAudioLanguageDialog params={{ videoId: mockVideoId }} />
        </MockedProvider>
      </SnackbarProvider>
    )

    // Error message should be visible in the file upload component
    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'Upload failed'
    )
  })

  it('navigates back on dialog close', async () => {
    const mockRouterPush = jest.fn()
    jest
      .spyOn(require('next/navigation'), 'useRouter')
      .mockImplementation(() => ({
        push: mockRouterPush
      }))

    render(
      <SnackbarProvider>
        <MockedProvider>
          <AddAudioLanguageDialog params={{ videoId: mockVideoId }} />
        </MockedProvider>
      </SnackbarProvider>
    )

    // Click close button
    fireEvent.click(screen.getByTestId('close-button'))

    // Should redirect to audio page
    expect(mockRouterPush).toHaveBeenCalledWith(`/videos/${mockVideoId}/audio`)
  })

  it('prevents dialog close during upload', async () => {
    const mockRouterPush = jest.fn()
    jest
      .spyOn(require('next/navigation'), 'useRouter')
      .mockImplementation(() => ({
        push: mockRouterPush
      }))
    ;(useUploadVideoVariant as jest.Mock).mockReturnValue({
      uploadState: {
        isUploading: true,
        isProcessing: false,
        uploadProgress: 50,
        error: null
      },
      startUpload: jest.fn(),
      clearUploadState: jest.fn()
    })

    render(
      <SnackbarProvider>
        <MockedProvider>
          <AddAudioLanguageDialog params={{ videoId: mockVideoId }} />
        </MockedProvider>
      </SnackbarProvider>
    )

    // Try to close the dialog
    fireEvent.click(screen.getByTestId('close-button'))

    // Should not redirect
    expect(mockRouterPush).not.toHaveBeenCalled()
  })
})
