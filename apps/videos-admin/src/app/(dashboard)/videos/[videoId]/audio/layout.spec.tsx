import {
  NetworkStatus,
  OperationVariables,
  QueryResult,
  useQuery
} from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import ClientLayout from './layout'

// Mock useQuery hook
jest.mock('@apollo/client', () => {
  const original = jest.requireActual('@apollo/client')
  return {
    ...original,
    useQuery: jest.fn()
  }
})

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => false
}))

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
  useParams: () => ({ videoId: 'video123' }),
  useRouter: () => ({
    push: mockPush
  }),
  usePathname: () => '/videos/video123/audio'
}))

describe('ClientLayout', () => {
  const mockVideoVariants = [
    {
      id: 'variant1',
      language: {
        id: 'lang1',
        name: [{ value: 'English' }]
      }
    },
    {
      id: 'variant2',
      language: {
        id: 'lang2',
        name: [{ value: 'Spanish' }]
      }
    },
    {
      id: 'variant3',
      language: {
        id: 'lang3',
        name: [{ value: 'French' }]
      }
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementation for useQuery
    const mockedUseQuery = useQuery as jest.MockedFunction<typeof useQuery>

    // Create a complete mock for the QueryResult
    const mockQueryResult: QueryResult<any, OperationVariables> = {
      data: {
        adminVideo: {
          variants: mockVideoVariants
        }
      },
      loading: false,
      error: undefined,
      fetchMore: jest.fn(),
      refetch: jest.fn(),
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
        <ClientLayout params={{ videoId: 'video123' }}>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('should open variant modal when variant is clicked', async () => {
    render(
      <MockedProvider>
        <ClientLayout params={{ videoId: 'video123' }}>
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
        <ClientLayout params={{ videoId: 'video123' }}>
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
          <ClientLayout params={{ videoId: 'video123' }}>
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
        <ClientLayout params={{ videoId: 'video123' }}>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Add Audio Language'))
    expect(mockPush).toHaveBeenCalledWith('/videos/video123/audio/add', {
      scroll: false
    })
  })

  it('should render children', async () => {
    render(
      <MockedProvider>
        <ClientLayout params={{ videoId: 'video123' }}>
          <div data-testid="child-content">Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })
})
