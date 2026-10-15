import { useMutation, useQuery } from '@apollo/client/react'
import { fireEvent, render, screen } from '@testing-library/react'
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
            errorMessage: null,
            updatedAt: '2026-07-21T12:00:00.000Z',
            processingStages: JSON.stringify({})
          },
          {
            id: 'upload-2',
            status: 'complete',
            videoId: 'episode-2',
            videoVariantId: 'variant-2',
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
})
