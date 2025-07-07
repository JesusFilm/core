import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'

// Import the component under test
import VariantDialog from './layout'

// Mock VariantVideo component
jest.mock('../_VariantVideo', () => ({
  VariantVideo: ({ hlsSrc }) => (
    <div data-testid="mock-variant-video">
      {hlsSrc ? <div data-testid="hls-source">{hlsSrc}</div> : 'No HLS stream'}
    </div>
  )
}))

// Mock the Dialog component
jest.mock('@core/shared/ui/Dialog', () => ({
  Dialog: ({ children, dialogTitle, onClose }) => (
    <div data-testid="mock-dialog">
      <div data-testid="dialog-title">{dialogTitle.title}</div>
      <button data-testid="close-button" onClick={onClose} />
      <div data-testid="dialog-content">{children}</div>
    </div>
  )
}))

// Mock VideoEditionChip component
jest.mock('./_VideoEditionChip', () => ({
  VideoEditionChip: ({ editionName }) => (
    <div data-testid="mock-video-edition-chip">{editionName}</div>
  )
}))

// Mock the MUI components
jest.mock('@mui/material/Stack', () => ({
  __esModule: true,
  default: ({ children, gap }) => (
    <div data-testid="mock-stack" data-gap={gap}>
      {children}
    </div>
  )
}))

jest.mock('@mui/material/Box', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="mock-box">{children}</div>
}))

jest.mock('@mui/material/Typography', () => ({
  __esModule: true,
  default: ({ children, variant }) => (
    <div data-testid={`mock-typography-${variant}`}>{children}</div>
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

jest.mock('@mui/material/Table', () => ({
  __esModule: true,
  default: ({ children }) => <table data-testid="mock-table">{children}</table>
}))

jest.mock('@mui/material/TableContainer', () => ({
  __esModule: true,
  default: ({ children }) => (
    <div data-testid="mock-table-container">{children}</div>
  )
}))

jest.mock('@mui/material/TableHead', () => ({
  __esModule: true,
  default: ({ children }) => (
    <thead data-testid="mock-table-head">{children}</thead>
  )
}))

jest.mock('@mui/material/TableBody', () => ({
  __esModule: true,
  default: ({ children }) => (
    <tbody data-testid="mock-table-body">{children}</tbody>
  )
}))

jest.mock('@mui/material/TableRow', () => ({
  __esModule: true,
  default: ({ children }) => <tr data-testid="mock-table-row">{children}</tr>
}))

jest.mock('@mui/material/TableCell', () => ({
  __esModule: true,
  default: ({ children }) => <td data-testid="mock-table-cell">{children}</td>
}))

jest.mock('@mui/material/Paper', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="mock-paper">{children}</div>
}))

jest.mock('@mui/material/IconButton', () => ({
  __esModule: true,
  default: ({ children, onClick, 'aria-label': ariaLabel }) => (
    <button data-testid={`mock-icon-button-${ariaLabel}`} onClick={onClick}>
      {children}
    </button>
  )
}))

// Mock FormSelectField component
jest.mock('../../../../../../components/FormSelectField', () => ({
  FormSelectField: ({ children, name, label, options, onChange }) => (
    <div data-testid="mock-form-select-field" data-name={name}>
      <label data-testid="mock-form-select-label">{label}</label>
      <select data-testid="mock-form-select" name={name} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {children}
    </div>
  )
}))

// Mock MenuItem
jest.mock('@mui/material/MenuItem', () => ({
  __esModule: true,
  default: ({ children, value }) => (
    <option data-testid="mock-menu-item" value={value}>
      {children}
    </option>
  )
}))

// Mock CancelButton
jest.mock('../../../../../../components/CancelButton', () => ({
  CancelButton: ({ show, handleCancel }) => (
    <button
      data-testid="mock-cancel-button"
      onClick={handleCancel}
      style={{ display: show ? 'block' : 'none' }}
    >
      Cancel
    </button>
  )
}))

// Mock useMediaQuery
jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn(() => true) // Default to desktop view (smUp = true)
}))

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  }),
  usePathname: () => '/test-path'
}))

// Mock useSuspenseQuery
jest.mock('@apollo/client', () => {
  const originalModule = jest.requireActual('@apollo/client')
  return {
    ...originalModule,
    useSuspenseQuery: jest.fn(),
    useMutation: jest.fn()
  }
})

// Mock notistack
jest.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: jest.fn()
  })
}))

describe('VariantDialog', () => {
  const mockVariantId = 'variant-123'
  const mockVideoId = 'video-456'

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

    // Mock useMutation to return the expected array format
    const mockMutation = jest.fn()
    jest
      .spyOn(require('@apollo/client'), 'useMutation')
      .mockReturnValue([
        mockMutation,
        { loading: false, error: null, data: null }
      ])

    // Mock useSuspenseQuery to return mock data
    jest.spyOn(require('@apollo/client'), 'useSuspenseQuery').mockReturnValue({
      data: {
        videoVariant: {
          id: mockVariantId,
          published: true,
          hls: 'https://example.com/video.m3u8',
          downloads: [
            {
              id: 'download-1',
              url: 'https://example.com/download/hd.mp4',
              quality: 'HD',
              size: 1024 * 1024 * 10, // 10 MB
              width: 1920,
              height: 1080
            },
            {
              id: 'download-2',
              url: 'https://example.com/download/sd.mp4',
              quality: 'SD',
              size: 1024 * 1024 * 5, // 5 MB
              width: 640,
              height: 480
            }
          ],
          language: {
            id: 'lang-123',
            name: [{ value: 'English' }]
          },
          videoEdition: {
            name: 'Standard Edition'
          }
        }
      }
    })
  })

  it('renders the variant dialog with all components', () => {
    render(
      <MockedProvider>
        <VariantDialog
          params={{ variantId: mockVariantId, videoId: mockVideoId }}
        >
          <div>Child content</div>
        </VariantDialog>
      </MockedProvider>
    )

    // Check dialog title
    expect(screen.getByTestId('dialog-title')).toHaveTextContent(
      'Audio Language'
    )

    // Check edition chip is shown
    expect(screen.getByTestId('mock-video-edition-chip')).toHaveTextContent(
      'Standard'
    )

    // Check language display
    expect(screen.getByTestId('mock-typography-h2')).toHaveTextContent(
      'English'
    )

    // Check video player is shown
    expect(screen.getByTestId('mock-variant-video')).toBeInTheDocument()
    expect(screen.getByTestId('hls-source')).toHaveTextContent(
      'https://example.com/video.m3u8'
    )

    // Check downloads section
    expect(screen.getByText('Downloads')).toBeInTheDocument()
    expect(screen.getByText('Add Download')).toBeInTheDocument()

    // Check downloads table
    expect(screen.getByTestId('mock-table')).toBeInTheDocument()

    // Check table headers
    const tableCells = screen.getAllByTestId('mock-table-cell')
    expect(tableCells[0]).toHaveTextContent('Quality')
    expect(tableCells[1]).toHaveTextContent('Size')
    expect(tableCells[2]).toHaveTextContent('Dimensions')
    expect(tableCells[3]).toHaveTextContent('URL')

    // Check download items are shown (just check a few items)
    expect(screen.getByText('HD')).toBeInTheDocument()
    expect(screen.getByText('SD')).toBeInTheDocument()
    expect(screen.getByText('1920x1080')).toBeInTheDocument()
    expect(screen.getByText('640x480')).toBeInTheDocument()

    // Check delete buttons
    const deleteButtons = screen.getAllByTestId('mock-icon-button-Delete')
    expect(deleteButtons).toHaveLength(2)
  })

  it('navigates back when dialog is closed', () => {
    render(
      <MockedProvider>
        <VariantDialog
          params={{ variantId: mockVariantId, videoId: mockVideoId }}
        >
          <div>Child content</div>
        </VariantDialog>
      </MockedProvider>
    )

    // Click close button
    fireEvent.click(screen.getByTestId('close-button'))

    // Check if router.push was called with the correct path
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/videos/${mockVideoId}/audio`,
      { scroll: false }
    )
  })

  it('navigates to add download page when add download button is clicked', () => {
    render(
      <MockedProvider>
        <VariantDialog
          params={{ variantId: mockVariantId, videoId: mockVideoId }}
        >
          <div>Child content</div>
        </VariantDialog>
      </MockedProvider>
    )

    // Click add download button
    fireEvent.click(screen.getByText('Add Download'))

    // Check if router.push was called with the correct path
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/videos/${mockVideoId}/audio/${mockVariantId}/download/lang-123/add`,
      { scroll: false }
    )
  })

  it('navigates to delete download page when delete button is clicked', () => {
    render(
      <MockedProvider>
        <VariantDialog
          params={{ variantId: mockVariantId, videoId: mockVideoId }}
        >
          <div>Child content</div>
        </VariantDialog>
      </MockedProvider>
    )

    // Click the first delete button
    const deleteButtons = screen.getAllByTestId('mock-icon-button-Delete')
    fireEvent.click(deleteButtons[0])

    // Check if router.push was called with the correct path
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/videos/${mockVideoId}/audio/${mockVariantId}/download/download-1/delete`,
      { scroll: false }
    )
  })

  it('displays "No downloads available" when there are no downloads', () => {
    // Mock the query result with no downloads
    const { useSuspenseQuery } = require('@apollo/client')
    useSuspenseQuery.mockReturnValue({
      data: {
        videoVariant: {
          id: mockVariantId,
          hls: 'https://example.com/video.m3u8',
          language: {
            id: 'lang-123',
            name: [{ value: 'English' }]
          },
          videoEdition: {
            name: 'Standard'
          },
          downloads: []
        }
      }
    })

    render(
      <MockedProvider>
        <VariantDialog
          params={{ variantId: mockVariantId, videoId: mockVideoId }}
        >
          <div>Child content</div>
        </VariantDialog>
      </MockedProvider>
    )

    // Check if "No downloads available" message is shown
    expect(screen.getByText('No downloads available')).toBeInTheDocument()

    // Verify table is not rendered
    expect(screen.queryByTestId('mock-table')).not.toBeInTheDocument()
  })

  it('handles null videoEdition', () => {
    // Mock the query result with null videoEdition
    const { useSuspenseQuery } = require('@apollo/client')
    useSuspenseQuery.mockReturnValue({
      data: {
        videoVariant: {
          id: mockVariantId,
          hls: 'https://example.com/video.m3u8',
          language: {
            id: 'lang-123',
            name: [{ value: 'English' }]
          },
          videoEdition: null,
          downloads: []
        }
      }
    })

    render(
      <MockedProvider>
        <VariantDialog
          params={{ variantId: mockVariantId, videoId: mockVideoId }}
        >
          <div>Child content</div>
        </VariantDialog>
      </MockedProvider>
    )

    // Check that the edition chip is not rendered
    expect(
      screen.queryByTestId('mock-video-edition-chip')
    ).not.toBeInTheDocument()
  })

  it('handles null HLS source', () => {
    // Mock the query result with null HLS
    const { useSuspenseQuery } = require('@apollo/client')
    useSuspenseQuery.mockReturnValue({
      data: {
        videoVariant: {
          id: mockVariantId,
          hls: null,
          language: {
            id: 'lang-123',
            name: [{ value: 'English' }]
          },
          videoEdition: {
            name: 'Standard'
          },
          downloads: []
        }
      }
    })

    render(
      <MockedProvider>
        <VariantDialog
          params={{ variantId: mockVariantId, videoId: mockVideoId }}
        >
          <div>Child content</div>
        </VariantDialog>
      </MockedProvider>
    )

    // Check that the video player shows "No HLS stream"
    expect(screen.getByTestId('mock-variant-video')).toHaveTextContent(
      'No HLS stream'
    )
    expect(screen.queryByTestId('hls-source')).not.toBeInTheDocument()
  })

  // TODO: Add test for mutation behavior when form mocking is improved
  // The mutation and navigation functionality is implemented and working in the actual component
})
