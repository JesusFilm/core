import {
  useMutation as apolloClient_useMutation,
  useSuspenseQuery as apolloClient_useSuspenseQuery
} from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type Mock } from 'vitest'

import PublishAllChildrenDialog from './page'

const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockEnqueueSnackbar = vi.fn()
const mockPublishChildren = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh
  })
}))

vi.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: mockEnqueueSnackbar })
}))

vi.mock('@apollo/client', async () => {
  const original = await vi.importActual('@apollo/client')
  return {
    ...original,
    useSuspenseQuery: vi.fn(),
    useMutation: vi.fn()
  }
})

describe('PublishAllChildrenDialog (route)', () => {
  const useSuspenseQuery = vi.mocked(
    apolloClient_useSuspenseQuery as unknown as Mock
  )
  const useMutation = vi.mocked(apolloClient_useMutation as unknown as Mock)

  beforeEach(() => {
    vi.clearAllMocks()

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
    ;(useMutation as Mock).mockReturnValue([mockPublishChildren, {}])
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

  it('publishes languages when all child videos are already published', async () => {
    useSuspenseQuery.mockReturnValueOnce({
      data: {
        adminVideo: {
          id: 'video123',
          variants: [],
          children: [
            {
              id: 'child1',
              published: true,
              variants: [
                { id: 'v1', published: false },
                { id: 'v2', published: true }
              ]
            }
          ]
        }
      }
    })
    mockPublishChildren.mockResolvedValueOnce({
      data: {
        videoPublishChildren: {
          dryRun: true,
          publishedVideoCount: 0,
          publishedVideoIds: [],
          publishedVariantsCount: 1,
          publishedVariantIds: ['v1'],
          videosFailedValidation: []
        }
      }
    })
    mockPublishChildren.mockResolvedValueOnce({
      data: {
        videoPublishChildren: {
          dryRun: false,
          publishedVideoCount: 0,
          publishedVideoIds: [],
          publishedVariantsCount: 1,
          publishedVariantIds: ['v1'],
          videosFailedValidation: []
        }
      }
    })

    render(
      <MockedProvider>
        <PublishAllChildrenDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    expect(
      screen.getByRole('button', { name: 'Publish Videos Only' })
    ).toBeDisabled()
    expect(
      screen.getByRole('button', {
        name: 'Publish Videos and Audio Languages'
      })
    ).toBeEnabled()

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
        'Successfully published 0 videos and 1 audio language variant(s)',
        { variant: 'success' }
      )
      expect(mockPush).toHaveBeenCalledWith('/videos/video123', {
        scroll: false
      })
    })
  })

  it('asks before partially publishing valid videos when validation fails', async () => {
    mockPublishChildren.mockResolvedValueOnce({
      data: {
        videoPublishChildren: {
          dryRun: true,
          publishedVideoCount: 1,
          publishedVideoIds: ['child-valid'],
          publishedVariantsCount: 0,
          publishedVariantIds: [],
          videosFailedValidation: [
            {
              videoId: 'child-invalid',
              message: 'child-invalid not published, missing: Description',
              missingFields: ['Description']
            }
          ]
        }
      }
    })
    mockPublishChildren.mockResolvedValueOnce({
      data: {
        videoPublishChildren: {
          dryRun: false,
          publishedVideoCount: 1,
          publishedVideoIds: ['child-valid'],
          publishedVariantsCount: 0,
          publishedVariantIds: [],
          videosFailedValidation: [
            {
              videoId: 'child-invalid',
              message: 'child-invalid not published, missing: Description',
              missingFields: ['Description']
            }
          ]
        }
      }
    })

    render(
      <MockedProvider>
        <PublishAllChildrenDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Publish Videos Only' }))

    await waitFor(() => {
      expect(
        screen.getByText('Publish Valid Videos?')
      ).toBeInTheDocument()
      expect(screen.getByText(/Could not publish:/)).toBeInTheDocument()
    })
    expect(mockPublishChildren).toHaveBeenCalledTimes(1)
    expect(mockPublishChildren).toHaveBeenCalledWith({
      variables: {
        id: 'video123',
        mode: 'childrenVideosOnly',
        dryRun: true
      }
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Publish Valid Videos' })
    )

    await waitFor(() => {
      expect(mockPublishChildren).toHaveBeenCalledWith({
        variables: {
          id: 'video123',
          mode: 'childrenVideosOnly',
          dryRun: false
        }
      })
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Successfully published 1 videos',
        { variant: 'success' }
      )
    })
  })

  it('does not partially publish when validation confirmation is cancelled', async () => {
    mockPublishChildren.mockResolvedValueOnce({
      data: {
        videoPublishChildren: {
          dryRun: true,
          publishedVideoCount: 1,
          publishedVideoIds: ['child-valid'],
          publishedVariantsCount: 0,
          publishedVariantIds: [],
          videosFailedValidation: [
            {
              videoId: 'child-invalid',
              message: 'child-invalid not published, missing: Description',
              missingFields: ['Description']
            }
          ]
        }
      }
    })

    render(
      <MockedProvider>
        <PublishAllChildrenDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Publish Videos Only' }))

    await waitFor(() => {
      expect(
        screen.getByText('Publish Valid Videos?')
      ).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(
        screen.queryByText('Publish Valid Videos?')
      ).not.toBeInTheDocument()
    })
    expect(mockPublishChildren).toHaveBeenCalledTimes(1)
  })

  it('enables language publishing for draft variants on the parent video', async () => {
    useSuspenseQuery.mockReturnValueOnce({
      data: {
        adminVideo: {
          id: 'video123',
          variants: [
            { id: 'parent-v1', published: false },
            { id: 'parent-v2', published: true }
          ],
          children: [
            {
              id: 'child1',
              published: true,
              variants: [{ id: 'child-v1', published: true }]
            }
          ]
        }
      }
    })
    mockPublishChildren.mockResolvedValueOnce({
      data: {
        videoPublishChildren: {
          dryRun: true,
          publishedVideoCount: 0,
          publishedVideoIds: [],
          publishedVariantsCount: 1,
          publishedVariantIds: ['parent-v1'],
          videosFailedValidation: []
        }
      }
    })
    mockPublishChildren.mockResolvedValueOnce({
      data: {
        videoPublishChildren: {
          dryRun: false,
          publishedVideoCount: 0,
          publishedVideoIds: [],
          publishedVariantsCount: 1,
          publishedVariantIds: ['parent-v1'],
          videosFailedValidation: []
        }
      }
    })

    render(
      <MockedProvider>
        <PublishAllChildrenDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    expect(
      screen.getByText(/0 unpublished child video\(s\) and 1 unpublished variant\(s\)/)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Publish Videos Only' })
    ).toBeDisabled()
    expect(
      screen.getByRole('button', {
        name: 'Publish Videos and Audio Languages'
      })
    ).toBeEnabled()

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
        'Successfully published 0 videos and 1 audio language variant(s)',
        { variant: 'success' }
      )
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

  it('keeps the dialog open when no unpublished children or languages exist', () => {
    useSuspenseQuery.mockReturnValueOnce({
      data: { adminVideo: { id: 'video123', children: [] } }
    })

    render(
      <MockedProvider>
        <PublishAllChildrenDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    expect(screen.getByText('Publish All Children')).toBeInTheDocument()
    expect(
      screen.getByText(/0 unpublished child video\(s\)/)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Publish Videos Only' })
    ).toBeDisabled()
    expect(
      screen.getByRole('button', {
        name: 'Publish Videos and Audio Languages'
      })
    ).toBeDisabled()
    expect(mockEnqueueSnackbar).not.toHaveBeenCalled()
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('shows latest dry run in results panel without closing', async () => {
    render(
      <MockedProvider>
        <PublishAllChildrenDialog params={{ videoId: 'video123' }} />
      </MockedProvider>
    )

    fireEvent.click(screen.getAllByRole('button', { name: 'Dry Run' })[0])

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
