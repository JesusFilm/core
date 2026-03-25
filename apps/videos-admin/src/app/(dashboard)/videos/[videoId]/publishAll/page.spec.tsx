import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import PublishAllChildrenDialog from './page'

const mockPush = jest.fn()
const mockRefresh = jest.fn()
const mockEnqueueSnackbar = jest.fn()
const mockPublishChildren = jest.fn()

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

    mockPublishChildren.mockImplementation(async ({ variables }) => {
      if (variables.mode === 'childrenVideosOnly') {
        return {
          data: {
            videoPublishChildren: {
              dryRun: variables.dryRun,
              publishedVideoCount: 3,
              publishedVideoIds: ['parent', 'child1', 'child2'],
              publishedVariantsCount: 0,
              publishedVariantIds: [],
              videosFailedValidation: []
            }
          }
        }
      }
      if (variables.mode === 'childrenVideosAndVariants') {
        return {
          data: {
            videoPublishChildren: {
              dryRun: variables.dryRun,
              publishedVideoCount: 3,
              publishedVideoIds: ['parent', 'child1', 'child2'],
              publishedVariantsCount: 3,
              publishedVariantIds: ['va', 'vb', 'vc'],
              videosFailedValidation: []
            }
          }
        }
      }
      return { data: { videoPublishChildren: null } }
    })
    ;(useMutation as jest.Mock).mockReturnValue([mockPublishChildren, {}])
  })

  it('renders dialog with actions', () => {
    render(
      <MockedProvider>
        <PublishAllChildrenDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    expect(screen.getByText('Publish All Children')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Publish Videos Only' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Publish Videos and Audio Languages'
      })
    ).toBeInTheDocument()
  })

  it('publishes parent and children when choosing Publish Videos Only', async () => {
    render(
      <MockedProvider>
        <PublishAllChildrenDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Publish Videos Only' }))

    await waitFor(() => {
      expect(mockPublishChildren).toHaveBeenCalledWith({
        variables: {
          id: 'video123',
          mode: 'childrenVideosOnly',
          dryRun: false
        }
      })
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Successfully published 3 videos',
        { variant: 'success' }
      )
      expect(mockPush).toHaveBeenCalledWith('/videos/video123', {
        scroll: false
      })
    })
  })

  it('publishes parent, children, and languages when choosing Publish Videos and Audio Languages', async () => {
    render(
      <MockedProvider>
        <PublishAllChildrenDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Publish Videos and Audio Languages'
      })
    )

    await waitFor(() => {
      expect(mockPublishChildren).toHaveBeenCalledWith({
        variables: {
          id: 'video123',
          mode: 'childrenVideosAndVariants',
          dryRun: false
        }
      })
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Successfully published 3 videos and 3 audio language variant(s)',
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

  it('shows latest dry run in results panel without closing', async () => {
    render(
      <MockedProvider>
        <PublishAllChildrenDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    fireEvent.click(
      screen.getAllByRole('button', { name: 'Dry Run' })[0] as HTMLElement
    )

    await waitFor(() => {
      expect(mockPublishChildren).toHaveBeenCalledWith({
        variables: {
          id: 'video123',
          mode: 'childrenVideosOnly',
          dryRun: true
        }
      })
      expect(screen.getByText(/Would publish:/)).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: /Open video parent in a new tab/
        })
      ).toHaveAttribute('href', '/videos/parent')
      expect(
        screen.getByRole('link', { name: /Open video child1 in a new tab/ })
      ).toHaveAttribute('href', '/videos/child1')
      expect(
        screen.getByRole('link', { name: /Open video child2 in a new tab/ })
      ).toHaveAttribute('href', '/videos/child2')
    })
    expect(mockPush).not.toHaveBeenCalled()
  })
})
