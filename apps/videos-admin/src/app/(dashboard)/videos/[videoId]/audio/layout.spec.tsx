import {
  NetworkStatus,
  OperationVariables,
  QueryResult,
  useMutation,
  useQuery
} from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import ClientLayout from './layout'

// Mock useQuery and useMutation hooks
jest.mock('@apollo/client', () => {
  const original = jest.requireActual('@apollo/client')
  return {
    ...original,
    useQuery: jest.fn(),
    useMutation: jest.fn()
  }
})

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => false
}))

const mockPush = jest.fn()
const mockRefetch = jest.fn()
const mockUpdateVariant = jest.fn()
const mockEnqueueSnackbar = jest.fn()

// Mock next/navigation with a function to change pathname
let mockPathname = '/videos/video123/audio'
const mockUsePathname = jest.fn(() => mockPathname)

jest.mock('next/navigation', () => ({
  useParams: () => ({ then: (cb: any) => cb({ videoId: 'video123' }) }),
  useRouter: () => ({
    push: mockPush
  }),
  usePathname: () => mockUsePathname()
}))

// Mock notistack
jest.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar
  }),
  SnackbarProvider: ({ children }: { children: React.ReactNode }) => children
}))

// Helper function to render component with different pathnames
const renderWithPathname = (pathname: string): void => {
  mockPathname = pathname
  mockUsePathname.mockReturnValue(pathname)

  render(
    <MockedProvider>
      <ClientLayout>
        <div>Child content</div>
      </ClientLayout>
    </MockedProvider>
  )
}

describe('ClientLayout', () => {
  const mockVideoVariants = [
    {
      id: 'variant1',
      published: true,
      language: {
        id: 'lang1',
        slug: 'english',
        name: [{ value: 'English' }]
      }
    },
    {
      id: 'variant2',
      published: false,
      language: {
        id: 'lang2',
        slug: 'spanish',
        name: [{ value: 'Spanish' }]
      }
    },
    {
      id: 'variant3',
      published: true,
      language: {
        id: 'lang3',
        slug: 'french',
        name: [{ value: 'French' }]
      }
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementation for useQuery
    const mockedUseQuery = useQuery as jest.MockedFunction<typeof useQuery>
    const mockedUseMutation = useMutation as jest.MockedFunction<
      typeof useMutation
    >

    // Create a complete mock for the QueryResult
    const mockQueryResult: QueryResult<any, OperationVariables> = {
      data: {
        adminVideo: {
          id: 'video123',
          slug: 'test-video',
          published: true,
          variants: mockVideoVariants
        }
      },
      loading: false,
      error: undefined,
      fetchMore: jest.fn(),
      refetch: mockRefetch,
      networkStatus: NetworkStatus.ready,
      client: {} as any,
      called: true,
      startPolling: jest.fn(),
      stopPolling: jest.fn(),
      subscribeToMore: jest.fn(),
      updateQuery: jest.fn(),
      observable: {} as any,
      variables: { id: 'video123' },
      reobserve: jest.fn(),
      previousData: undefined
    }

    mockedUseQuery.mockReturnValue(mockQueryResult)

    // Mock useMutation for video variant updates
    mockedUseMutation.mockReturnValue([
      mockUpdateVariant,
      {
        loading: false,
        error: undefined,
        data: undefined,
        called: false,
        client: {} as any,
        reset: jest.fn()
      }
    ])

    // Mock document.getElementById to return a fake element with getBoundingClientRect
    document.getElementById = jest.fn().mockImplementation(() => ({
      getBoundingClientRect: () => ({
        width: 800,
        height: 600
      })
    }))
  })

  it('should render variants', () => {
    render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('should render Audio Languages header', () => {
    render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    expect(screen.getByText('Audio Languages')).toBeInTheDocument()
  })

  it('should render Publish All button', () => {
    render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    expect(screen.getByText('Publish All')).toBeInTheDocument()
  })

  it('should render Add Audio Language button', () => {
    render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    expect(screen.getByText('Add Audio Language')).toBeInTheDocument()
  })

  it('should open variant modal when variant is clicked', async () => {
    render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    fireEvent.click(screen.getAllByRole('listitem')[0])
    expect(mockPush).toHaveBeenCalledWith('/videos/video123/audio/variant1', {
      scroll: false
    })
  })

  it('should have correct id for the Section element so correct virtualization dimensions can be calculated', async () => {
    render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    const section = document.getElementById('Audio Languages-section')
    expect(section).not.toBeNull()
  })

  it('should open delete confirmation dialog when delete button is clicked', async () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <ClientLayout>
            <div>Child content</div>
          </ClientLayout>
        </SnackbarProvider>
      </MockedProvider>
    )

    const deleteButtons = screen.getAllByLabelText('delete variant')
    fireEvent.click(deleteButtons[0])

    expect(mockPush).toHaveBeenCalledWith(
      '/videos/video123/audio/variant1/delete',
      { scroll: false }
    )
  })

  it('should navigate to add audio language page when clicking add audio language button', async () => {
    render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Add Audio Language'))
    expect(mockPush).toHaveBeenCalledWith('/videos/video123/audio/add', {
      scroll: false
    })
  })

  it('should navigate to publish all dialog route when Publish All button is clicked', async () => {
    render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Publish All'))

    expect(mockPush).toHaveBeenCalledWith('/videos/video123/audio/publishAll', {
      scroll: false
    })
  })

  it('should show info message when no draft variants exist (and not navigate)', async () => {
    // Mock data with all published variants
    const mockedUseQuery = useQuery as jest.MockedFunction<typeof useQuery>
    const allPublishedVariants = [
      {
        id: 'variant1',
        published: true,
        language: {
          id: 'lang1',
          slug: 'english',
          name: [{ value: 'English' }]
        }
      },
      {
        id: 'variant2',
        published: true,
        language: {
          id: 'lang2',
          slug: 'spanish',
          name: [{ value: 'Spanish' }]
        }
      }
    ]

    mockedUseQuery.mockReturnValue({
      data: {
        adminVideo: {
          id: 'video123',
          slug: 'test-video',
          published: true,
          variants: allPublishedVariants
        }
      },
      loading: false,
      error: undefined,
      fetchMore: jest.fn(),
      refetch: mockRefetch,
      networkStatus: NetworkStatus.ready,
      client: {} as any,
      called: true,
      startPolling: jest.fn(),
      stopPolling: jest.fn(),
      subscribeToMore: jest.fn(),
      updateQuery: jest.fn(),
      observable: {} as any,
      variables: { id: 'video123' },
      reobserve: jest.fn(),
      previousData: undefined
    })

    render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Publish All'))

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
      'No draft audio languages to publish',
      { variant: 'info' }
    )
    expect(mockPush).not.toHaveBeenCalledWith(
      '/videos/video123/audio/publishAll',
      expect.anything()
    )
  })

  it('should render children', async () => {
    render(
      <MockedProvider>
        <ClientLayout>
          <div data-testid="child-content">Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })

  it('should render preview buttons for published variants', async () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <ClientLayout>
            <div>Child content</div>
          </ClientLayout>
        </SnackbarProvider>
      </MockedProvider>
    )

    const previewButtons = screen.getAllByLabelText('preview variant')
    expect(previewButtons).toHaveLength(3) // All variants should have preview buttons

    // First and third variants are published and video is published, so they should be enabled
    expect(previewButtons[0]).not.toBeDisabled()
    expect(previewButtons[2]).not.toBeDisabled()

    // Second variant is unpublished, so it should be disabled
    expect(previewButtons[1]).toBeDisabled()
  })

  it('should open preview in new window when preview button is clicked for published variant', async () => {
    // Mock window.open
    const mockWindowOpen = jest.fn()
    Object.defineProperty(window, 'open', {
      value: mockWindowOpen,
      writable: true
    })

    // Mock environment variable
    process.env.NEXT_PUBLIC_WATCH_URL = 'https://watch.jesusfilm.org'

    render(
      <MockedProvider>
        <SnackbarProvider>
          <ClientLayout>
            <div>Child content</div>
          </ClientLayout>
        </SnackbarProvider>
      </MockedProvider>
    )

    const previewButtons = screen.getAllByLabelText('preview variant')
    fireEvent.click(previewButtons[0]) // Click first (published) variant

    expect(mockWindowOpen).toHaveBeenCalledWith(
      'https://watch.jesusfilm.org/watch/test-video.html/english.html',
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('should refetch when pathname includes "add"', async () => {
    // Start with a normal audio path
    mockPathname = '/videos/video123/audio'
    mockUsePathname.mockReturnValue('/videos/video123/audio')

    const { rerender } = render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    // Change to a path that should set reloadOnPathChange to true
    mockPathname = '/videos/video123/audio/add'
    mockUsePathname.mockReturnValue('/videos/video123/audio/add')

    rerender(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    // Clear any calls from the setup
    mockRefetch.mockClear()

    // Now change to another path - this should trigger refetch because reloadOnPathChange is true
    mockPathname = '/videos/video123/audio'
    mockUsePathname.mockReturnValue('/videos/video123/audio')

    rerender(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    expect(mockRefetch).toHaveBeenCalled()
  })

  it('should refetch when pathname includes "delete"', async () => {
    // Start with a normal audio path
    mockPathname = '/videos/video123/audio'
    mockUsePathname.mockReturnValue('/videos/video123/audio')

    const { rerender } = render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    // Change to a path that should set reloadOnPathChange to true
    mockPathname = '/videos/video123/audio/variant1/delete'
    mockUsePathname.mockReturnValue('/videos/video123/audio/variant1/delete')

    rerender(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    // Clear any calls from the setup
    mockRefetch.mockClear()

    // Now change to another path - this should trigger refetch because reloadOnPathChange is true
    mockPathname = '/videos/video123/audio'
    mockUsePathname.mockReturnValue('/videos/video123/audio')

    rerender(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    expect(mockRefetch).toHaveBeenCalled()
  })

  it('should refetch when pathname includes a variant pattern', async () => {
    // Start with a normal audio path
    mockPathname = '/videos/video123/audio'
    mockUsePathname.mockReturnValue('/videos/video123/audio')

    const { rerender } = render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    // Change to a path that should set reloadOnPathChange to true
    mockPathname = '/videos/video123/audio/variant1'
    mockUsePathname.mockReturnValue('/videos/video123/audio/variant1')

    rerender(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    // Clear any calls from the setup
    mockRefetch.mockClear()

    // Now change to another path - this should trigger refetch because reloadOnPathChange is true
    mockPathname = '/videos/video123/audio'
    mockUsePathname.mockReturnValue('/videos/video123/audio')

    rerender(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    expect(mockRefetch).toHaveBeenCalled()
  })

  it('should not refetch for other paths', async () => {
    // Start with a normal audio path
    mockPathname = '/videos/video123/audio'
    mockUsePathname.mockReturnValue('/videos/video123/audio')

    const { rerender } = render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    // Change to another normal path that should NOT set reloadOnPathChange to true
    // Using a path that doesn't match any of the patterns (add, delete, or variant)
    mockPathname = '/videos/video123/children'
    mockUsePathname.mockReturnValue('/videos/video123/children')

    rerender(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    // Clear any calls from the setup
    mockRefetch.mockClear()

    // Now change to another path - this should NOT trigger refetch because reloadOnPathChange is false
    mockPathname = '/videos/video123/audio'
    mockUsePathname.mockReturnValue('/videos/video123/audio')

    rerender(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    expect(mockRefetch).not.toHaveBeenCalled()
  })
})
