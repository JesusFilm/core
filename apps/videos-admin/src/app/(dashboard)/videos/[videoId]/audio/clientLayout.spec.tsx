import { NetworkStatus, useSuspenseQuery } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import ClientLayout from './clientLayout'

// Mock useSuspenseQuery hook
jest.mock('@apollo/client', () => {
  const original = jest.requireActual('@apollo/client')
  return {
    ...original,
    useSuspenseQuery: jest.fn()
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
  })
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
    // Default mock implementation for useSuspenseQuery
    const mockedUseSuspenseQuery = useSuspenseQuery as jest.MockedFunction<
      typeof useSuspenseQuery
    >
    mockedUseSuspenseQuery.mockReturnValue({
      data: {
        adminVideo: {
          variants: mockVideoVariants
        }
      },
      fetchMore: jest.fn(),
      subscribeToMore: jest.fn(),
      client: {} as any,
      error: undefined,
      networkStatus: NetworkStatus.ready,
      refetch: jest.fn()
    })
  })

  it('should render variants', () => {
    render(
      <MockedProvider>
        <ClientLayout videoId="video123">
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('should open variant modal when variant is clicked', async () => {
    render(
      <MockedProvider>
        <ClientLayout videoId="video123">
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
        <ClientLayout videoId="video123">
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    const section = document.getElementById('Audio Languages-section')
    expect(section).toBeInTheDocument()
  })

  it('should open delete confirmation dialog when delete button is clicked', async () => {
    render(
      <MockedProvider>
        <SnackbarProvider>
          <ClientLayout videoId="video123">
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
        <ClientLayout videoId="video123">
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
        <ClientLayout videoId="video123">
          <div data-testid="child-content">Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
  })
})
