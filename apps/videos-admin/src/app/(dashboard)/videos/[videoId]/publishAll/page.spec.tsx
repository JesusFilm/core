import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import PublishAllChildrenDialog from './page'

const mockPush = jest.fn()
const mockRefresh = jest.fn()
const mockEnqueueSnackbar = jest.fn()
const mockUpdateVideo = jest.fn()
const mockUpdateVariant = jest.fn()

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

    // Mutations (first call for updateVideo, second for updateVariant)
    ;(useMutation as jest.Mock).mockReturnValueOnce([mockUpdateVideo, {}])
    ;(useMutation as jest.Mock).mockReturnValue([mockUpdateVariant, {}])
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
      // Parent
      expect(mockUpdateVideo).toHaveBeenCalledWith({
        variables: { input: { id: 'video123', published: true } }
      })
      // Children
      expect(mockUpdateVideo).toHaveBeenCalledWith({
        variables: { input: { id: 'child1', published: true } }
      })
      expect(mockUpdateVideo).toHaveBeenCalledWith({
        variables: { input: { id: 'child2', published: true } }
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
      // Parent and children
      expect(mockUpdateVideo).toHaveBeenCalledWith({
        variables: { input: { id: 'video123', published: true } }
      })
      expect(mockUpdateVideo).toHaveBeenCalledWith({
        variables: { input: { id: 'child1', published: true } }
      })
      expect(mockUpdateVideo).toHaveBeenCalledWith({
        variables: { input: { id: 'child2', published: true } }
      })
      // Unpublished variants: v1, v3, v4
      expect(mockUpdateVariant).toHaveBeenCalledWith({
        variables: { input: { id: 'v1', published: true } }
      })
      expect(mockUpdateVariant).toHaveBeenCalledWith({
        variables: { input: { id: 'v3', published: true } }
      })
      expect(mockUpdateVariant).toHaveBeenCalledWith({
        variables: { input: { id: 'v4', published: true } }
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
