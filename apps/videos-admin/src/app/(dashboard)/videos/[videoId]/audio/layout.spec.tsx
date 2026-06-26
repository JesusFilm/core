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
import { type MockedFunction } from 'vitest'

import ClientLayout from './layout'

// Mock useQuery and useMutation hooks
vi.mock('@apollo/client', async () => {
  const original = await vi.importActual('@apollo/client')
  return {
    ...original,
    useQuery: vi.fn(),
    useMutation: vi.fn()
  }
})

vi.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => false
}))

const mockPush = vi.fn()
const mockRefetch = vi.fn()
const mockUpdateVariant = vi.fn()
const mockEnqueueSnackbar = vi.fn()

// Mock next/navigation with a function to change pathname
let mockPathname = '/videos/video123/audio'
const mockUsePathname = vi.fn(() => mockPathname)

vi.mock('next/navigation', () => ({
  useParams: () => ({ videoId: 'video123' }),
  useRouter: () => ({
    push: mockPush
  }),
  usePathname: () => mockUsePathname()
}))

// Mock notistack
vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar
  }),
  SnackbarProvider: ({ children }: { children: React.ReactNode }) => children
}))

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
    vi.useRealTimers()
    vi.clearAllMocks()

    // Default mock implementation for useQuery
    const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>
    const mockedUseMutation = useMutation as MockedFunction<typeof useMutation>

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
      fetchMore: vi.fn(),
      refetch: mockRefetch,
      networkStatus: NetworkStatus.ready,
      client: {} as any,
      called: true,
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
      subscribeToMore: vi.fn(),
      updateQuery: vi.fn(),
      observable: {} as any,
      variables: { id: 'video123' },
      reobserve: vi.fn(),
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
        reset: vi.fn()
      }
    ])

    // Mock document.getElementById to return a fake element with getBoundingClientRect
    document.getElementById = vi.fn().mockImplementation(() => ({
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

  it('queries and renders server-filtered incomplete uploads for the current video', () => {
    const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>
    const uploadStartPolling = vi.fn()
    const uploadStopPolling = vi.fn()

    mockedUseQuery
      .mockReturnValueOnce({
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
        fetchMore: vi.fn(),
        refetch: mockRefetch,
        networkStatus: NetworkStatus.ready,
        client: {} as any,
        called: true,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
        subscribeToMore: vi.fn(),
        updateQuery: vi.fn(),
        observable: {} as any,
        variables: { id: 'video123' },
        reobserve: vi.fn(),
        previousData: undefined
      })
      .mockReturnValueOnce({
        data: {
          videoVariantUploads: [
            {
              id: 'upload-old-failed',
              source: 'videos-admin',
              status: 'failed',
              videoId: 'video123',
              languageId: '184631',
              language: {
                id: '184631',
                name: [{ value: 'Upload English' }]
              },
              edition: 'base',
              originalFilename: 'test-video.mp4',
              errorMessage: 'Mux video processing errored',
              muxVideoId: 'mux-id',
              videoVariantId: null,
              updatedAt: '2026-06-18T00:00:00.000Z',
              createdAt: '2026-06-18T00:00:00.000Z'
            }
          ]
        },
        loading: false,
        error: undefined,
        fetchMore: vi.fn(),
        refetch: mockRefetch,
        networkStatus: NetworkStatus.ready,
        client: {} as any,
        called: true,
        startPolling: uploadStartPolling,
        stopPolling: uploadStopPolling,
        subscribeToMore: vi.fn(),
        updateQuery: vi.fn(),
        observable: {} as any,
        variables: {
          input: {
            videoId: 'video123',
            statuses: [
              'created',
              'r2Prepared',
              'r2Uploaded',
              'muxCreated',
              'muxReady',
              'failed'
            ]
          },
          limit: 100,
          languageId: '529'
        },
        reobserve: vi.fn(),
        previousData: undefined
      })

    render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    expect(mockedUseQuery).toHaveBeenNthCalledWith(
      2,
      expect.anything(),
      expect.objectContaining({
        variables: {
          input: {
            videoId: 'video123',
            statuses: [
              'created',
              'r2Prepared',
              'r2Uploaded',
              'muxCreated',
              'muxReady',
              'failed'
            ]
          },
          limit: 100,
          languageId: '529'
        }
      })
    )
    expect(screen.getByText('Upload English')).toBeTruthy()
    expect(screen.getByText(/184631/)).toBeTruthy()
    expect(screen.getByText('Mux video processing errored')).toBeTruthy()
  })

  it('shows lifecycle-specific labels, messages, and actions for incomplete uploads', () => {
    const dateNowSpy = vi
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2026-06-18T01:00:00.000Z').getTime())
    const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>

    mockedUseQuery
      .mockReturnValueOnce({
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
        fetchMore: vi.fn(),
        refetch: mockRefetch,
        networkStatus: NetworkStatus.ready,
        client: {} as any,
        called: true,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
        subscribeToMore: vi.fn(),
        updateQuery: vi.fn(),
        observable: {} as any,
        variables: { id: 'video123' },
        reobserve: vi.fn(),
        previousData: undefined
      })
      .mockReturnValueOnce({
        data: {
          videoVariantUploads: [
            {
              id: 'upload-created',
              source: 'videos-admin',
              status: 'created',
              videoId: 'video123',
              languageId: 'created-language',
              edition: 'base',
              originalFilename: 'test-video.mp4',
              errorMessage: null,
              muxVideoId: null,
              videoVariantId: null,
              updatedAt: '2026-06-18T00:59:00.000Z',
              createdAt: '2026-06-18T00:59:00.000Z'
            },
            {
              id: 'upload-r2-prepared',
              source: 'videos-admin',
              status: 'r2Prepared',
              videoId: 'video123',
              languageId: 'r2-prepared-language',
              edition: 'base',
              originalFilename: 'test-video.mp4',
              errorMessage: null,
              muxVideoId: null,
              videoVariantId: null,
              updatedAt: '2026-06-18T00:59:00.000Z',
              createdAt: '2026-06-18T00:59:00.000Z'
            },
            {
              id: 'upload-r2-uploaded',
              source: 'videos-admin',
              status: 'r2Uploaded',
              videoId: 'video123',
              languageId: 'r2-uploaded-language',
              edition: 'base',
              originalFilename: 'test-video.mp4',
              errorMessage: null,
              muxVideoId: null,
              videoVariantId: null,
              updatedAt: '2026-06-18T00:59:00.000Z',
              createdAt: '2026-06-18T00:59:00.000Z'
            },
            {
              id: 'upload-mux-created-fresh',
              source: 'videos-admin',
              status: 'muxCreated',
              videoId: 'video123',
              languageId: 'mux-fresh-language',
              edition: 'base',
              originalFilename: 'test-video.mp4',
              errorMessage: null,
              muxVideoId: 'mux-id',
              videoVariantId: null,
              updatedAt: '2026-06-18T00:45:00.000Z',
              createdAt: '2026-06-18T00:00:00.000Z'
            },
            {
              id: 'upload-mux-created-stale',
              source: 'videos-admin',
              status: 'muxCreated',
              videoId: 'video123',
              languageId: 'mux-stale-language',
              edition: 'base',
              originalFilename: 'test-video.mp4',
              errorMessage: null,
              muxVideoId: 'mux-stale-id',
              videoVariantId: null,
              updatedAt: '2026-06-18T00:29:59.000Z',
              createdAt: '2026-06-18T00:00:00.000Z'
            },
            {
              id: 'upload-mux-ready',
              source: 'videos-admin',
              status: 'muxReady',
              videoId: 'video123',
              languageId: 'mux-ready-language',
              edition: 'base',
              originalFilename: 'test-video.mp4',
              errorMessage: null,
              muxVideoId: 'mux-ready-id',
              videoVariantId: null,
              updatedAt: '2026-06-18T00:59:00.000Z',
              createdAt: '2026-06-18T00:59:00.000Z'
            },
            {
              id: 'upload-failed',
              source: 'videos-admin',
              status: 'failed',
              videoId: 'video123',
              languageId: 'failed-language',
              edition: 'base',
              originalFilename: 'test-video.mp4',
              errorMessage: 'Mux video processing errored',
              muxVideoId: 'failed-mux-id',
              videoVariantId: null,
              updatedAt: '2026-06-18T00:59:00.000Z',
              createdAt: '2026-06-18T00:59:00.000Z'
            }
          ]
        },
        loading: false,
        error: undefined,
        fetchMore: vi.fn(),
        refetch: mockRefetch,
        networkStatus: NetworkStatus.ready,
        client: {} as any,
        called: true,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
        subscribeToMore: vi.fn(),
        updateQuery: vi.fn(),
        observable: {} as any,
        variables: {},
        reobserve: vi.fn(),
        previousData: undefined
      })

    render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )
    dateNowSpy.mockRestore()

    expect(screen.getAllByText('Upload not complete')).toHaveLength(2)
    expect(screen.getAllByText('Add again')).toHaveLength(2)
    expect(screen.getByText('Ready to process')).toBeTruthy()
    expect(screen.getByText('Start processing')).toBeTruthy()
    expect(screen.getByText('Processing')).toBeTruthy()
    expect(
      screen.getByText('Mux is processing this upload. No action needed.')
    ).toBeTruthy()
    expect(screen.getByText('Stale')).toBeTruthy()
    expect(
      screen.getByText(
        'Processing has not updated in over 30 minutes. Retry processing.'
      )
    ).toBeTruthy()
    expect(screen.getByText('Ready to finalize')).toBeTruthy()
    expect(screen.getByText('Finalize')).toBeTruthy()
    expect(screen.getByText('Failed')).toBeTruthy()
    expect(screen.getByText('Mux video processing errored')).toBeTruthy()
    expect(screen.queryByText('Resume')).toBeNull()
  })

  it('routes unresumable uploads to add again without calling resume', () => {
    const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>
    const mockedUseMutation = useMutation as MockedFunction<typeof useMutation>
    const resumeMutation = vi.fn()

    mockedUseMutation.mockReturnValue([
      resumeMutation,
      {
        loading: false,
        error: undefined,
        data: undefined,
        called: false,
        client: {} as any,
        reset: vi.fn()
      }
    ])
    mockedUseQuery
      .mockReturnValueOnce({
        data: {
          adminVideo: {
            id: 'video123',
            slug: 'test-video',
            published: true,
            variants: []
          }
        },
        loading: false,
        error: undefined,
        fetchMore: vi.fn(),
        refetch: mockRefetch,
        networkStatus: NetworkStatus.ready,
        client: {} as any,
        called: true,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
        subscribeToMore: vi.fn(),
        updateQuery: vi.fn(),
        observable: {} as any,
        variables: { id: 'video123' },
        reobserve: vi.fn(),
        previousData: undefined
      })
      .mockReturnValueOnce({
        data: {
          videoVariantUploads: [
            {
              id: 'upload-created',
              source: 'videos-admin',
              status: 'created',
              videoId: 'video123',
              languageId: '184631',
              edition: 'base',
              originalFilename: 'test-video.mp4',
              errorMessage: null,
              muxVideoId: null,
              videoVariantId: null,
              updatedAt: '2026-06-18T00:00:00.000Z',
              createdAt: '2026-06-18T00:00:00.000Z'
            },
            {
              id: 'upload-r2-prepared',
              source: 'videos-admin',
              status: 'r2Prepared',
              videoId: 'video123',
              languageId: '14278',
              edition: 'base',
              originalFilename: 'test-video.mp4',
              errorMessage: null,
              muxVideoId: null,
              videoVariantId: null,
              updatedAt: '2026-06-18T00:00:00.000Z',
              createdAt: '2026-06-18T00:00:00.000Z'
            }
          ]
        },
        loading: false,
        error: undefined,
        fetchMore: vi.fn(),
        refetch: vi.fn(),
        networkStatus: NetworkStatus.ready,
        client: {} as any,
        called: true,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
        subscribeToMore: vi.fn(),
        updateQuery: vi.fn(),
        observable: {} as any,
        variables: {},
        reobserve: vi.fn(),
        previousData: undefined
      })

    render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    fireEvent.click(screen.getAllByText('Add again')[0])

    expect(mockPush).toHaveBeenCalledWith('/videos/video123/audio/add', {
      scroll: false
    })
    expect(resumeMutation).not.toHaveBeenCalled()
  })

  it('starts processing an R2-uploaded row through the resume mutation', async () => {
    const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>
    const mockedUseMutation = useMutation as MockedFunction<typeof useMutation>
    const resumeMutation = vi.fn().mockResolvedValue({
      data: {
        videoVariantUploadResume: {
          id: 'upload-r2-uploaded',
          status: 'muxCreated',
          errorMessage: null,
          muxVideoId: 'mux-id',
          videoVariantId: null,
          updatedAt: '2026-06-18T00:00:00.000Z'
        }
      }
    })

    mockedUseMutation.mockReturnValue([
      resumeMutation,
      {
        loading: false,
        error: undefined,
        data: undefined,
        called: false,
        client: {} as any,
        reset: vi.fn()
      }
    ])
    mockedUseQuery.mockImplementation((_query, options?: any) => {
      if (options?.variables?.input?.statuses != null) {
        return {
          data: {
            videoVariantUploads: [
              {
                id: 'upload-r2-uploaded',
                source: 'videos-admin',
                status: 'r2Uploaded',
                videoId: 'video123',
                languageId: '184631',
                edition: 'base',
                originalFilename: 'test-video.mp4',
                errorMessage: null,
                muxVideoId: null,
                videoVariantId: null,
                updatedAt: '2026-06-18T00:00:00.000Z',
                createdAt: '2026-06-18T00:00:00.000Z'
              }
            ]
          },
          loading: false,
          error: undefined,
          fetchMore: vi.fn(),
          refetch: vi.fn(),
          networkStatus: NetworkStatus.ready,
          client: {} as any,
          called: true,
          startPolling: vi.fn(),
          stopPolling: vi.fn(),
          subscribeToMore: vi.fn(),
          updateQuery: vi.fn(),
          observable: {} as any,
          variables: options.variables,
          reobserve: vi.fn(),
          previousData: undefined
        } as QueryResult<any, OperationVariables>
      }

      return {
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
        fetchMore: vi.fn(),
        refetch: mockRefetch,
        networkStatus: NetworkStatus.ready,
        client: {} as any,
        called: true,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
        subscribeToMore: vi.fn(),
        updateQuery: vi.fn(),
        observable: {} as any,
        variables: options?.variables ?? {},
        reobserve: vi.fn(),
        previousData: undefined
      } as QueryResult<any, OperationVariables>
    })

    render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Start processing'))

    await waitFor(() => {
      expect(resumeMutation).toHaveBeenCalledWith({
        variables: {
          id: 'upload-r2-uploaded',
          downloadable: true,
          maxResolution: 'uhd'
        }
      })
    })
  })

  it('uses a two-hour stale threshold when Mux detects non-standard input', async () => {
    const dateNowSpy = vi
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2026-06-18T03:00:00.000Z').getTime())
    const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>
    const mockedUseMutation = useMutation as MockedFunction<typeof useMutation>
    const resumeMutation = vi.fn()

    mockedUseMutation.mockReturnValue([
      resumeMutation,
      {
        loading: false,
        error: undefined,
        data: undefined,
        called: false,
        client: {} as any,
        reset: vi.fn()
      }
    ])
    mockedUseQuery
      .mockReturnValueOnce({
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
        fetchMore: vi.fn(),
        refetch: mockRefetch,
        networkStatus: NetworkStatus.ready,
        client: {} as any,
        called: true,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
        subscribeToMore: vi.fn(),
        updateQuery: vi.fn(),
        observable: {} as any,
        variables: { id: 'video123' },
        reobserve: vi.fn(),
        previousData: undefined
      })
      .mockReturnValueOnce({
        data: {
          videoVariantUploads: [
            {
              id: 'upload-non-standard-fresh',
              source: 'qa-528-test-data',
              status: 'muxCreated',
              videoId: 'video123',
              languageId: 'fresh-language',
              edition: 'base',
              originalFilename: 'test-video.mp4',
              errorMessage: null,
              muxVideoId: 'mux-fresh-id',
              muxNonStandardInputDetectedAt: '2026-06-18T02:30:00.000Z',
              videoVariantId: null,
              updatedAt: '2026-06-18T02:29:00.000Z',
              createdAt: '2026-06-18T00:00:00.000Z'
            },
            {
              id: 'upload-non-standard-stale',
              source: 'qa-528-test-data',
              status: 'muxCreated',
              videoId: 'video123',
              languageId: 'stale-language',
              edition: 'base',
              originalFilename: 'test-video.mp4',
              errorMessage: null,
              muxVideoId: 'mux-stale-id',
              muxNonStandardInputDetectedAt: '2026-06-18T01:00:00.000Z',
              videoVariantId: null,
              updatedAt: '2026-06-18T00:59:00.000Z',
              createdAt: '2026-06-18T00:00:00.000Z'
            }
          ]
        },
        loading: false,
        error: undefined,
        fetchMore: vi.fn(),
        refetch: vi.fn(),
        networkStatus: NetworkStatus.ready,
        client: {} as any,
        called: true,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
        subscribeToMore: vi.fn(),
        updateQuery: vi.fn(),
        observable: {} as any,
        variables: {},
        reobserve: vi.fn(),
        previousData: undefined
      })

    render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )
    dateNowSpy.mockRestore()

    expect(screen.getByText('Language fresh-language')).toBeTruthy()
    expect(screen.getByText('Language stale-language')).toBeTruthy()
    expect(screen.getByText('Processing')).toBeTruthy()
    expect(screen.getByText('Stale')).toBeTruthy()
    expect(
      screen.getByText(
        'Processing has not updated in over 2 hours. Retry processing.'
      )
    ).toBeTruthy()
    expect(screen.getByText('Retry')).toBeTruthy()
    expect(resumeMutation).not.toHaveBeenCalled()
  })

  it('allows stale Mux processing rows to retry', async () => {
    const dateNowSpy = vi
      .spyOn(Date, 'now')
      .mockReturnValue(new Date('2026-06-18T01:00:00.000Z').getTime())
    const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>
    const mockedUseMutation = useMutation as MockedFunction<typeof useMutation>
    const resumeMutation = vi.fn().mockResolvedValue({
      data: {
        videoVariantUploadResume: {
          id: 'upload-mux-stale',
          status: 'muxCreated',
          errorMessage: null,
          muxVideoId: 'mux-id',
          videoVariantId: null,
          updatedAt: '2026-06-18T01:00:00.000Z'
        }
      }
    })

    mockedUseMutation.mockReturnValue([
      resumeMutation,
      {
        loading: false,
        error: undefined,
        data: undefined,
        called: false,
        client: {} as any,
        reset: vi.fn()
      }
    ])
    mockedUseQuery.mockImplementation((_query, options?: any) => {
      if (options?.variables?.input?.statuses != null) {
        return {
          data: {
            videoVariantUploads: [
              {
                id: 'upload-mux-stale',
                source: 'videos-admin',
                status: 'muxCreated',
                videoId: 'video123',
                languageId: '184631',
                edition: 'base',
                originalFilename: 'test-video.mp4',
                errorMessage: null,
                muxVideoId: 'mux-id',
                videoVariantId: null,
                updatedAt: '2026-06-18T00:29:00.000Z',
                createdAt: '2026-06-18T00:00:00.000Z'
              }
            ]
          },
          loading: false,
          error: undefined,
          fetchMore: vi.fn(),
          refetch: vi.fn(),
          networkStatus: NetworkStatus.ready,
          client: {} as any,
          called: true,
          startPolling: vi.fn(),
          stopPolling: vi.fn(),
          subscribeToMore: vi.fn(),
          updateQuery: vi.fn(),
          observable: {} as any,
          variables: options.variables,
          reobserve: vi.fn(),
          previousData: undefined
        } as QueryResult<any, OperationVariables>
      }

      return {
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
        fetchMore: vi.fn(),
        refetch: mockRefetch,
        networkStatus: NetworkStatus.ready,
        client: {} as any,
        called: true,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
        subscribeToMore: vi.fn(),
        updateQuery: vi.fn(),
        observable: {} as any,
        variables: options?.variables ?? {},
        reobserve: vi.fn(),
        previousData: undefined
      } as QueryResult<any, OperationVariables>
    })

    render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )
    dateNowSpy.mockRestore()

    fireEvent.click(screen.getByText('Retry'))

    await waitFor(() => {
      expect(resumeMutation).toHaveBeenCalledWith({
        variables: {
          id: 'upload-mux-stale',
          downloadable: true,
          maxResolution: 'uhd'
        }
      })
    })
  })

  it('clears resume state when resume mutation returns a completed upload', async () => {
    const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>
    const mockedUseMutation = useMutation as MockedFunction<typeof useMutation>
    const resumeMutation = vi.fn().mockResolvedValue({
      data: {
        videoVariantUploadResume: {
          id: 'upload-ready',
          status: 'variantCreated',
          errorMessage: null,
          muxVideoId: 'mux-id',
          videoVariantId: 'variant-id',
          updatedAt: '2026-06-18T00:00:00.000Z'
        }
      }
    })
    const uploadRefetch = vi.fn()

    mockedUseMutation.mockReturnValue([
      resumeMutation,
      {
        loading: false,
        error: undefined,
        data: undefined,
        called: false,
        client: {} as any,
        reset: vi.fn()
      }
    ])
    mockedUseQuery.mockImplementation((_query, options?: any) => {
      if (options?.variables?.input?.statuses != null) {
        return {
          data: {
            videoVariantUploads: [
              {
                id: 'upload-ready',
                source: 'videos-admin',
                status: 'muxReady',
                videoId: 'video123',
                languageId: '184631',
                edition: 'base',
                originalFilename: 'test-video.mp4',
                errorMessage: null,
                muxVideoId: 'mux-id',
                videoVariantId: null,
                updatedAt: '2026-06-18T00:00:00.000Z',
                createdAt: '2026-06-18T00:00:00.000Z'
              }
            ]
          },
          loading: false,
          error: undefined,
          fetchMore: vi.fn(),
          refetch: uploadRefetch,
          networkStatus: NetworkStatus.ready,
          client: {} as any,
          called: true,
          startPolling: vi.fn(),
          stopPolling: vi.fn(),
          subscribeToMore: vi.fn(),
          updateQuery: vi.fn(),
          observable: {} as any,
          variables: options.variables,
          reobserve: vi.fn(),
          previousData: undefined
        } as QueryResult<any, OperationVariables>
      }

      return {
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
        fetchMore: vi.fn(),
        refetch: mockRefetch,
        networkStatus: NetworkStatus.ready,
        client: {} as any,
        called: true,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
        subscribeToMore: vi.fn(),
        updateQuery: vi.fn(),
        observable: {} as any,
        variables: options?.variables ?? {},
        reobserve: vi.fn(),
        previousData: undefined
      } as QueryResult<any, OperationVariables>
    })

    render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Finalize'))

    await waitFor(() => {
      expect(resumeMutation).toHaveBeenCalledWith({
        variables: {
          id: 'upload-ready',
          downloadable: true,
          maxResolution: 'uhd'
        }
      })
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Audio language restored',
        { variant: 'success' }
      )
      expect(mockRefetch).toHaveBeenCalled()
      expect(uploadRefetch).toHaveBeenCalled()
    })
    expect(mockEnqueueSnackbar).not.toHaveBeenCalledWith(
      'Mux video processing errored',
      { variant: 'error' }
    )
  })

  it('treats an active resumed upload disappearing from incomplete uploads as complete', async () => {
    const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>
    const mockedUseMutation = useMutation as MockedFunction<typeof useMutation>
    const resumeMutation = vi.fn().mockResolvedValue({
      data: {
        videoVariantUploadResume: {
          id: 'upload-processing',
          status: 'muxCreated',
          errorMessage: null,
          muxVideoId: 'mux-id',
          videoVariantId: null,
          updatedAt: '2026-06-18T00:00:00.000Z'
        }
      }
    })
    let uploadRows = [
      {
        id: 'upload-processing',
        source: 'videos-admin',
        status: 'r2Uploaded',
        videoId: 'video123',
        languageId: '184631',
        edition: 'base',
        originalFilename: 'test-video.mp4',
        errorMessage: null,
        muxVideoId: null,
        videoVariantId: null,
        updatedAt: '2026-06-18T00:00:00.000Z',
        createdAt: '2026-06-18T00:00:00.000Z'
      }
    ]
    const uploadRefetch = vi.fn()

    mockedUseMutation.mockReturnValue([
      resumeMutation,
      {
        loading: false,
        error: undefined,
        data: undefined,
        called: false,
        client: {} as any,
        reset: vi.fn()
      }
    ])
    mockedUseQuery.mockImplementation((_query, options?: any) => {
      if (options?.variables?.input?.statuses != null) {
        return {
          data: { videoVariantUploads: uploadRows },
          loading: false,
          error: undefined,
          fetchMore: vi.fn(),
          refetch: uploadRefetch,
          networkStatus: NetworkStatus.ready,
          client: {} as any,
          called: true,
          startPolling: vi.fn(),
          stopPolling: vi.fn(),
          subscribeToMore: vi.fn(),
          updateQuery: vi.fn(),
          observable: {} as any,
          variables: options.variables,
          reobserve: vi.fn(),
          previousData: undefined
        } as QueryResult<any, OperationVariables>
      }

      return {
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
        fetchMore: vi.fn(),
        refetch: mockRefetch,
        networkStatus: NetworkStatus.ready,
        client: {} as any,
        called: true,
        startPolling: vi.fn(),
        stopPolling: vi.fn(),
        subscribeToMore: vi.fn(),
        updateQuery: vi.fn(),
        observable: {} as any,
        variables: options?.variables ?? {},
        reobserve: vi.fn(),
        previousData: undefined
      } as QueryResult<any, OperationVariables>
    })

    const { rerender } = render(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    fireEvent.click(screen.getByText('Start processing'))

    await waitFor(() => expect(uploadRefetch).toHaveBeenCalled())

    uploadRows = []
    rerender(
      <MockedProvider>
        <ClientLayout>
          <div>Child content</div>
        </ClientLayout>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Audio language restored',
        { variant: 'success' }
      )
      expect(mockRefetch).toHaveBeenCalled()
    })
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
    const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>
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
      fetchMore: vi.fn(),
      refetch: mockRefetch,
      networkStatus: NetworkStatus.ready,
      client: {} as any,
      called: true,
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
      subscribeToMore: vi.fn(),
      updateQuery: vi.fn(),
      observable: {} as any,
      variables: { id: 'video123' },
      reobserve: vi.fn(),
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
    const mockWindowOpen = vi.fn()
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
