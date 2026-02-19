import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import PublishAllChildrenDialog from './page'

const mockPush = jest.fn()
const mockRefresh = jest.fn()
const mockEnqueueSnackbar = jest.fn()
const mockPublishChildren = jest.fn()
const mockPublishChildrenAndLanguages = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh
  })
}))

jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar })
}))

jest.mock('@apollo/client', () => {
  const original = jest.requireActual('@apollo/client')
  return {
    ...original,
    useSuspenseQuery: jest.fn(),
    useMutation: jest.fn()
  }
})

describe('PublishAllChildrenDialog (route)', () => {
  const { useSuspenseQuery, useMutation } = jest.requireMock('@apollo/client')

  beforeEach(() => {
    jest.clearAllMocks()

    // Default query data: 2 unpublished children, each with variants
    useSuspenseQuery.mockReturnValue({
      data: {
        adminVideo: {
          id: 'video123',
          children: [
            {
              id: 'child1',
              published: false,
              variants: [
                { id: 'v1', published: false },
                { id: 'v2', published: true }
              ]
            },
            {
              id: 'child2',
              published: false,
              variants: [
                { id: 'v3', published: false },
                { id: 'v4', published: false }
              ]
            }
          ]
        }
      }
    })

    // Mutations: first for publishChildren, second for publishChildrenAndLanguages
    mockPublishChildren.mockResolvedValue({
      data: { videoPublishChildren: { publishedChildrenCount: 2 } }
    })
    mockPublishChildrenAndLanguages.mockResolvedValue({
      data: {
        videoPublishChildrenAndLanguages: {
          publishedChildrenCount: 2,
          publishedVariantsCount: 3
        }
      }
    })
    ;(useMutation as jest.Mock).mockReturnValueOnce([mockPublishChildren, {}])
    ;(useMutation as jest.Mock).mockReturnValue([
      mockPublishChildrenAndLanguages,
      {}
    ])
  })

  it('renders dialog with actions', () => {
    render(
      <MockedProvider>
        <PublishAllChildrenDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    expect(screen.getByText('Publish All Children')).toBeInTheDocument()
    expect(screen.getByText('Publish Children Only')).toBeInTheDocument()
    expect(screen.getByText('Publish Children + Languages')).toBeInTheDocument()
  })

  it('publishes parent and children when choosing Publish Children Only', async () => {
    render(
      <MockedProvider>
        <PublishAllChildrenDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Publish Children Only'))

    await waitFor(() => {
      expect(mockPublishChildren).toHaveBeenCalledWith({
        variables: { id: 'video123' }
      })
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Successfully published 2 children',
        { variant: 'success' }
      )
      expect(mockPush).toHaveBeenCalledWith('/videos/video123', {
        scroll: false
      })
    })
  })

  it('publishes parent, children, and languages when choosing Publish Children + Languages', async () => {
    render(
      <MockedProvider>
        <PublishAllChildrenDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Publish Children + Languages'))

    await waitFor(() => {
      expect(mockPublishChildrenAndLanguages).toHaveBeenCalledWith({
        variables: { id: 'video123' }
      })
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Successfully published 2 children and 3 languages',
        { variant: 'success' }
      )
      expect(mockPush).toHaveBeenCalledWith('/videos/video123', {
        scroll: false
      })
    })
  })

  it('closes on Cancel', async () => {
    render(
      <MockedProvider>
        <PublishAllChildrenDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(mockPush).toHaveBeenCalledWith('/videos/video123', { scroll: false })
  })

  it('shows info and redirects if no unpublished children', async () => {
    // All children published
    useSuspenseQuery.mockReturnValueOnce({
      data: { adminVideo: { id: 'video123', children: [] } }
    })

    render(
      <MockedProvider>
        <PublishAllChildrenDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'No unpublished children to publish',
        { variant: 'info' }
      )
      expect(mockPush).toHaveBeenCalledWith('/videos/video123', {
        scroll: false
      })
    })
  })
})
