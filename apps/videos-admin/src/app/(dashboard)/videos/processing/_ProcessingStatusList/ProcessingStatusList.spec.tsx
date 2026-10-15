import { useMutation, useQuery } from '@apollo/client/react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { vi } from 'vitest'

import { ProcessingStatusList } from './ProcessingStatusList'

vi.mock('@apollo/client/react', async () => {
  const original = await vi.importActual('@apollo/client/react')
  return {
    ...original,
    useMutation: vi.fn(),
    useQuery: vi.fn()
  }
})

describe('ProcessingStatusList', () => {
  it('shows degraded stages and lets a Publisher request a retry', async () => {
    const retry = vi.fn().mockResolvedValue({ data: {} })
    const refetch = vi.fn().mockResolvedValue({ data: {} })
    vi.mocked(useMutation).mockReturnValue([retry, { loading: false }] as never)
    vi.mocked(useQuery).mockReturnValue({
      data: {
        videoVariantReconciliations: [
          {
            id: 'upload-1',
            status: 'degraded',
            videoId: 'episode-1',
            videoVariantId: 'variant-1',
            edition: 'base',
            language: { id: '529', name: [{ value: 'English' }] },
            errorMessage: 'Parent sync failed',
            updatedAt: '2026-07-21T12:00:00.000Z',
            processingStages: JSON.stringify({
              parentSync: { state: 'failed', attempts: 5 }
            })
          }
        ]
      },
      loading: false,
      refetch
    } as never)

    render(<ProcessingStatusList />)

    expect(screen.getByText('Parent sync failed')).toBeInTheDocument()
    expect(screen.getByText('parentSync: failed (5)')).toBeInTheDocument()
    const videoLink = screen.getByRole('link', { name: /English \(base\)/ })
    expect(videoLink).toHaveAttribute('href', '/videos/episode-1')
    fireEvent.click(screen.getByRole('button', { name: 'Retry processing' }))

    expect(retry).toHaveBeenCalledWith({ variables: { id: 'upload-1' } })
  })

  it('disables retry for records already processing or complete', async () => {
    const retry = vi.fn()
    const refetch = vi.fn()
    vi.mocked(useMutation).mockReturnValue([retry, { loading: false }] as never)
    vi.mocked(useQuery).mockReturnValue({
      data: {
        videoVariantReconciliations: [
          {
            id: 'upload-1',
            status: 'processing',
            videoId: 'episode-1',
            videoVariantId: 'variant-1',
            edition: 'base',
            language: { id: '529', name: [{ value: 'English' }] },
            errorMessage: null,
            updatedAt: '2026-07-21T12:00:00.000Z',
            processingStages: JSON.stringify({})
          },
          {
            id: 'upload-2',
            status: 'complete',
            videoId: 'episode-2',
            videoVariantId: 'variant-2',
            edition: 'base',
            language: { id: '529', name: [{ value: 'English' }] },
            errorMessage: null,
            updatedAt: '2026-07-21T12:00:00.000Z',
            processingStages: JSON.stringify({})
          }
        ]
      },
      loading: false,
      refetch
    } as never)

    render(<ProcessingStatusList />)

    const retryButtons = screen.getAllByRole('button', {
      name: 'Retry processing'
    })
    expect(retryButtons).toHaveLength(2)
    retryButtons.forEach((button) => expect(button).toBeDisabled())
  })

  it('disables the minimum retries filter until a blocking stage is chosen', async () => {
    const retry = vi.fn()
    const refetch = vi.fn()
    vi.mocked(useMutation).mockReturnValue([retry, { loading: false }] as never)
    vi.mocked(useQuery).mockReturnValue({
      data: { videoVariantReconciliations: [] },
      loading: false,
      refetch
    } as never)

    render(<ProcessingStatusList />)

    expect(screen.getByLabelText('Minimum retries')).toBeDisabled()

    fireEvent.mouseDown(screen.getByLabelText('Blocking stage'))
    fireEvent.click(screen.getByRole('option', { name: 'mux' }))

    expect(screen.getByLabelText('Minimum retries')).toBeEnabled()
  })

  it('shows an error state when the query fails', async () => {
    const retry = vi.fn()
    const refetch = vi.fn()
    vi.mocked(useMutation).mockReturnValue([retry, { loading: false }] as never)
    vi.mocked(useQuery).mockReturnValue({
      data: undefined,
      loading: false,
      error: new Error('Network error'),
      refetch
    } as never)

    render(<ProcessingStatusList />)

    expect(
      screen.getByText('Failed to load processing statuses: Network error')
    ).toBeInTheDocument()
  })

  it('shows a snackbar when retrying processing fails', async () => {
    const retry = vi.fn().mockRejectedValue(new Error('retry failed'))
    const refetch = vi.fn()
    vi.mocked(useMutation).mockReturnValue([retry, { loading: false }] as never)
    vi.mocked(useQuery).mockReturnValue({
      data: {
        videoVariantReconciliations: [
          {
            id: 'upload-1',
            status: 'failed',
            videoId: 'episode-1',
            videoVariantId: 'variant-1',
            edition: 'base',
            language: { id: '529', name: [{ value: 'English' }] },
            errorMessage: 'Mux upload failed',
            updatedAt: '2026-07-21T12:00:00.000Z',
            processingStages: JSON.stringify({
              mux: { state: 'failed', attempts: 1 }
            })
          }
        ]
      },
      loading: false,
      refetch
    } as never)

    render(
      <SnackbarProvider>
        <ProcessingStatusList />
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Retry processing' }))

    await waitFor(() => {
      expect(screen.getByText('Failed to retry processing')).toBeInTheDocument()
    })
    expect(refetch).not.toHaveBeenCalled()
  })

  it('does not report a failed retry when only the follow-up refetch fails', async () => {
    const retry = vi.fn().mockResolvedValue({ data: {} })
    const refetch = vi.fn().mockRejectedValue(new Error('network blip'))
    vi.mocked(useMutation).mockReturnValue([retry, { loading: false }] as never)
    vi.mocked(useQuery).mockReturnValue({
      data: {
        videoVariantReconciliations: [
          {
            id: 'upload-1',
            status: 'failed',
            videoId: 'episode-1',
            videoVariantId: 'variant-1',
            edition: 'base',
            language: { id: '529', name: [{ value: 'English' }] },
            errorMessage: 'Mux upload failed',
            updatedAt: '2026-07-21T12:00:00.000Z',
            processingStages: JSON.stringify({
              mux: { state: 'failed', attempts: 1 }
            })
          }
        ]
      },
      loading: false,
      refetch
    } as never)

    render(
      <SnackbarProvider>
        <ProcessingStatusList />
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Retry processing' }))

    await waitFor(() => {
      expect(retry).toHaveBeenCalledWith({ variables: { id: 'upload-1' } })
    })
    expect(
      screen.queryByText('Failed to retry processing')
    ).not.toBeInTheDocument()
  })

  it('disables Previous and Next when there are no results', async () => {
    const retry = vi.fn()
    const refetch = vi.fn()
    vi.mocked(useMutation).mockReturnValue([retry, { loading: false }] as never)
    vi.mocked(useQuery).mockReturnValue({
      data: { videoVariantReconciliations: [] },
      loading: false,
      refetch
    } as never)

    render(<ProcessingStatusList />)

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('enables Next when a full page of results is returned', async () => {
    const retry = vi.fn()
    const refetch = vi.fn()
    const fullPage = Array.from({ length: 50 }, (_, index) => ({
      id: `upload-${index}`,
      status: 'complete',
      videoId: `episode-${index}`,
      videoVariantId: `variant-${index}`,
      edition: 'base',
      language: { id: '529', name: [{ value: 'English' }] },
      errorMessage: null,
      updatedAt: '2026-07-21T12:00:00.000Z',
      processingStages: JSON.stringify({})
    }))
    vi.mocked(useMutation).mockReturnValue([retry, { loading: false }] as never)
    vi.mocked(useQuery).mockReturnValue({
      data: { videoVariantReconciliations: fullPage },
      loading: false,
      refetch
    } as never)

    render(<ProcessingStatusList />)

    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()
  })

  it('sends the selected health filter to the query', async () => {
    const retry = vi.fn()
    const refetch = vi.fn()
    vi.mocked(useMutation).mockReturnValue([retry, { loading: false }] as never)
    vi.mocked(useQuery).mockReturnValue({
      data: { videoVariantReconciliations: [] },
      loading: false,
      refetch
    } as never)

    render(<ProcessingStatusList />)

    fireEvent.mouseDown(screen.getByLabelText('Health'))
    fireEvent.click(screen.getByRole('option', { name: 'failed' }))

    await waitFor(() => {
      expect(useQuery).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({
          variables: expect.objectContaining({ status: 'failed', offset: 0 })
        })
      )
    })
  })

  it('sends blockingStage and minRetryCount together once both are set', async () => {
    const retry = vi.fn()
    const refetch = vi.fn()
    vi.mocked(useMutation).mockReturnValue([retry, { loading: false }] as never)
    vi.mocked(useQuery).mockReturnValue({
      data: { videoVariantReconciliations: [] },
      loading: false,
      refetch
    } as never)

    render(<ProcessingStatusList />)

    fireEvent.mouseDown(screen.getByLabelText('Blocking stage'))
    fireEvent.click(screen.getByRole('option', { name: 'mux' }))
    fireEvent.change(screen.getByLabelText('Minimum retries'), {
      target: { value: '3' }
    })

    await waitFor(() => {
      expect(useQuery).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({
          variables: expect.objectContaining({
            blockingStage: 'mux',
            minRetryCount: 3
          })
        })
      )
    })
  })
})
