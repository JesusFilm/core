import {
  NetworkStatus,
  OperationVariables,
  QueryResult,
  useMutation,
  useQuery
} from '@apollo/client'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { type MockedFunction } from 'vitest'

import { StatusPipeline } from './StatusPipeline'

vi.mock('@apollo/client', async () => {
  const original = await vi.importActual('@apollo/client')
  return {
    ...original,
    useQuery: vi.fn(),
    useMutation: vi.fn()
  }
})

vi.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar
  })
}))

const mockRefetch = vi.fn()
const mockStartPolling = vi.fn()
const mockStopPolling = vi.fn()
const mockResumeVideoVariantUpload = vi.fn()
const mockEnqueueSnackbar = vi.fn()

const notCompleteStatuses = [
  'created',
  'r2Prepared',
  'r2Uploaded',
  'muxCreated',
  'muxReady',
  'failed'
]

const uploadRows = [
  {
    id: 'upload-r2',
    source: 'videos-admin',
    sourceKey: 'source-key',
    status: 'r2Uploaded',
    videoId: 'video-1',
    languageId: '529',
    language: { id: '529', name: [{ value: 'English' }] },
    edition: 'base',
    originalFilename: 'jesus-film.mp4',
    errorMessage: null,
    r2AssetId: 'r2-asset-1',
    muxVideoId: null,
    muxNonStandardInputDetectedAt: null,
    videoVariantId: null,
    createdAt: '2026-07-09T10:00:00.000Z',
    updatedAt: '2026-07-09T10:05:00.000Z'
  },
  {
    id: 'upload-failed',
    source: 'legacy-import',
    sourceKey: null,
    status: 'failed',
    videoId: 'video-2',
    languageId: '496',
    language: { id: '496', name: [{ value: 'Spanish' }] },
    edition: 'standard',
    originalFilename: 'spanish.mov',
    errorMessage: 'Mux rejected the asset',
    r2AssetId: 'r2-asset-2',
    muxVideoId: 'mux-2',
    muxNonStandardInputDetectedAt: '2026-07-08T10:04:00.000Z',
    videoVariantId: 'variant-2',
    createdAt: '2026-07-08T10:00:00.000Z',
    updatedAt: '2026-07-08T10:05:00.000Z'
  }
]

function createQueryResult(
  data: unknown
): QueryResult<any, OperationVariables> {
  return {
    data,
    loading: false,
    error: undefined,
    fetchMore: vi.fn(),
    refetch: mockRefetch,
    networkStatus: NetworkStatus.ready,
    client: {} as any,
    called: true,
    startPolling: mockStartPolling,
    stopPolling: mockStopPolling,
    subscribeToMore: vi.fn(),
    updateQuery: vi.fn(),
    observable: {} as any,
    variables: {},
    reobserve: vi.fn(),
    previousData: undefined
  }
}

describe('StatusPipeline', () => {
  beforeEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()

    const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>
    const mockedUseMutation = useMutation as MockedFunction<typeof useMutation>

    mockedUseQuery.mockReturnValue(
      createQueryResult({ videoVariantUploads: uploadRows })
    )
    mockResumeVideoVariantUpload.mockResolvedValue({
      data: {
        videoVariantUploadResume: {
          id: 'upload-r2',
          status: 'muxCreated',
          errorMessage: null,
          muxVideoId: 'mux-new',
          muxNonStandardInputDetectedAt: null,
          videoVariantId: null,
          updatedAt: '2026-07-09T10:10:00.000Z'
        }
      }
    })
    mockedUseMutation.mockReturnValue([
      mockResumeVideoVariantUpload,
      {
        loading: false,
        error: undefined,
        data: undefined,
        called: false,
        client: {} as any,
        reset: vi.fn()
      }
    ])
  })

  it('requests the latest not-complete uploads by default', () => {
    render(<StatusPipeline />)

    const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>

    expect(mockedUseQuery.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({
        variables: {
          input: { statuses: notCompleteStatuses },
          limit: 100,
          languageId: '529'
        },
        fetchPolicy: 'cache-and-network'
      })
    )
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent(
      'Not complete'
    )
  })

  it('allows filtering to completed uploads', () => {
    render(<StatusPipeline />)

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Status' }))
    fireEvent.click(screen.getByRole('option', { name: 'Variant created' }))

    const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>
    expect(mockedUseQuery.mock.calls.at(-1)?.[1]).toEqual(
      expect.objectContaining({
        variables: expect.objectContaining({
          input: { statuses: ['variantCreated'] },
          limit: 100
        })
      })
    )
  })

  it('renders operational fields and links rows back to videos', () => {
    render(<StatusPipeline />)

    expect(screen.getByText('r2Uploaded')).toBeInTheDocument()
    expect(screen.getByText('failed')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'video-1' })).toHaveAttribute(
      'href',
      '/videos/video-1'
    )
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('base')).toBeInTheDocument()
    expect(screen.getByText('videos-admin')).toBeInTheDocument()
    expect(screen.getByText('source-key')).toBeInTheDocument()
    expect(screen.getByText('jesus-film.mp4')).toBeInTheDocument()
    expect(screen.getByText('upload-r2')).toBeInTheDocument()
    expect(screen.getByText('r2-asset-1')).toBeInTheDocument()
    expect(screen.getByText('mux-2')).toBeInTheDocument()
    expect(screen.getByText('2026-07-08T10:04:00.000Z')).toBeInTheDocument()
    expect(screen.getByText('variant-2')).toBeInTheDocument()
    expect(screen.getByText('Mux rejected the asset')).toBeInTheDocument()
    expect(screen.getByText('2026-07-09T10:00:00.000Z')).toBeInTheDocument()
    expect(screen.getByText('2026-07-09T10:05:00.000Z')).toBeInTheDocument()
  })

  it('polls while incomplete rows are visible', () => {
    render(<StatusPipeline />)

    expect(mockStartPolling).toHaveBeenCalledWith(3000)
    expect(mockStopPolling).not.toHaveBeenCalled()
  })

  it('stops polling when visible rows are completed-only', () => {
    const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>
    mockedUseQuery.mockReturnValue(
      createQueryResult({
        videoVariantUploads: [
          {
            ...uploadRows[0],
            id: 'upload-complete',
            status: 'variantCreated',
            videoVariantId: 'variant-complete'
          }
        ]
      })
    )

    render(<StatusPipeline />)

    expect(mockStartPolling).not.toHaveBeenCalled()
    expect(mockStopPolling).toHaveBeenCalled()
  })

  it('uses the resume mutation for recoverable rows', async () => {
    render(<StatusPipeline />)

    fireEvent.click(screen.getByRole('button', { name: /start processing/i }))

    await waitFor(() => {
      expect(mockResumeVideoVariantUpload).toHaveBeenCalledWith({
        variables: {
          id: 'upload-r2',
          downloadable: true,
          maxResolution: 'uhd'
        }
      })
    })
    expect(mockRefetch).toHaveBeenCalled()
  })

  it('treats an active resumed upload disappearing from not-complete rows as recovered', async () => {
    const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>
    let visibleUploads: unknown[] = uploadRows
    mockedUseQuery.mockImplementation(() =>
      createQueryResult({ videoVariantUploads: visibleUploads })
    )

    const { rerender } = render(<StatusPipeline />)

    fireEvent.click(screen.getByRole('button', { name: /start processing/i }))

    await waitFor(() => {
      expect(mockResumeVideoVariantUpload).toHaveBeenCalled()
    })

    visibleUploads = []
    rerender(<StatusPipeline />)

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Upload recovered', {
        variant: 'success'
      })
    })
  })

  it('shows failure feedback when an active resumed upload later fails', async () => {
    const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>
    let visibleUploads: unknown[] = uploadRows
    mockedUseQuery.mockImplementation(() =>
      createQueryResult({ videoVariantUploads: visibleUploads })
    )

    const { rerender } = render(<StatusPipeline />)

    fireEvent.click(screen.getByRole('button', { name: /start processing/i }))

    await waitFor(() => {
      expect(mockResumeVideoVariantUpload).toHaveBeenCalled()
    })

    visibleUploads = [
      {
        ...uploadRows[0],
        status: 'failed',
        errorMessage: 'Mux processing failed'
      }
    ]
    rerender(<StatusPipeline />)

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
        'Mux processing failed',
        { variant: 'error' }
      )
    })
  })

  it('shows feedback when retry completes the upload', async () => {
    mockResumeVideoVariantUpload.mockResolvedValueOnce({
      data: {
        videoVariantUploadResume: {
          id: 'upload-r2',
          status: 'variantCreated',
          errorMessage: null
        }
      }
    })

    render(<StatusPipeline />)

    fireEvent.click(screen.getByRole('button', { name: /start processing/i }))

    await waitFor(() => {
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Upload recovered', {
        variant: 'success'
      })
    })
  })

  it('does not expose retry actions for browser-side incomplete uploads', () => {
    const mockedUseQuery = useQuery as MockedFunction<typeof useQuery>
    mockedUseQuery.mockReturnValue(
      createQueryResult({
        videoVariantUploads: [
          {
            ...uploadRows[0],
            id: 'upload-created',
            status: 'created'
          },
          {
            ...uploadRows[0],
            id: 'upload-prepared',
            status: 'r2Prepared'
          }
        ]
      })
    )

    render(<StatusPipeline />)

    expect(
      screen.queryByRole('button', { name: /start processing|retry|finalize/i })
    ).not.toBeInTheDocument()
    expect(screen.getAllByText('Open video')).toHaveLength(2)
  })
})
