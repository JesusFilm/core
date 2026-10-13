import { beforeEach, vi } from 'vitest'

import { prismaMock } from '../../../test/prismaMock'

import { requestVideoVariantReconciliation } from './requestVideoVariantReconciliation'

describe('requestVideoVariantReconciliation', () => {
  const intent = {
    videoVariantId: '53424_Rescue',
    videoId: 'Rescue',
    languageId: '53424',
    edition: 'base',
    published: true,
    reason: 'video-relationship-change' as const
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a pending record for a Variant without one', async () => {
    prismaMock.videoVariantReconciliation.findUnique.mockResolvedValue(null)

    await requestVideoVariantReconciliation(intent)

    expect(prismaMock.videoVariantReconciliation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        videoVariantId: '53424_Rescue',
        reason: 'video-relationship-change',
        status: 'processing',
        retryAt: expect.any(Date)
      })
    })
    expect(prismaMock.videoVariantReconciliation.update).not.toHaveBeenCalled()
  })

  it('restarts the clock when re-requesting an existing record', async () => {
    prismaMock.videoVariantReconciliation.findUnique.mockResolvedValue({
      id: 'status_53424_Rescue'
    } as never)
    const before = Date.now()

    await requestVideoVariantReconciliation(intent)

    expect(prismaMock.videoVariantReconciliation.create).not.toHaveBeenCalled()
    const { data } =
      prismaMock.videoVariantReconciliation.update.mock.calls[0][0]
    expect(data).toMatchObject({
      reason: 'video-relationship-change',
      status: 'processing',
      errorMessage: null
    })
    // The reconciler's time windows count from createdAt, so a re-request
    // must not inherit the original request's age.
    expect((data.createdAt as Date).getTime()).toBeGreaterThanOrEqual(before)
  })
})
