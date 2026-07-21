import { useMutation, useQuery } from '@apollo/client'
import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { ProcessingStatusList } from './ProcessingStatusList'

vi.mock('@apollo/client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@apollo/client')>()),
  useMutation: vi.fn(),
  useQuery: vi.fn()
}))

describe('ProcessingStatusList', () => {
  it('shows degraded stages and lets a Publisher request a retry', async () => {
    const retry = vi.fn().mockResolvedValue({ data: {} })
    const refetch = vi.fn().mockResolvedValue({ data: {} })
    vi.mocked(useMutation).mockReturnValue([retry, { loading: false }] as never)
    vi.mocked(useQuery).mockReturnValue({
      data: {
        videoVariantUploadStatuses: [
          {
            id: 'upload-1',
            health: 'degraded',
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
})
