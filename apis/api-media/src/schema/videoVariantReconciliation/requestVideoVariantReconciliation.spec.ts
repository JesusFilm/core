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

  it('keeps the original reason when a fresh upload is re-requested before Mux resolves', async () => {
    prismaMock.videoVariantReconciliation.findUnique.mockResolvedValue({
      id: 'status-1',
      reason: 'video-variant-create',
      processingStages: { mux: { state: 'processing', attempts: 1 } }
    } as never)

    await requestVideoVariantReconciliation({
      ...intent,
      reason: 'video-variant-publication-change'
    })

    const { data } =
      prismaMock.videoVariantReconciliation.update.mock.calls[0][0]
    expect(data).toMatchObject({ reason: 'video-variant-create' })
  })

  it('keeps the original reason when a fresh upload is re-requested after Mux times out', async () => {
    prismaMock.videoVariantReconciliation.findUnique.mockResolvedValue({
      id: 'status-1',
      reason: 'video-variant-create',
      processingStages: { mux: { state: 'failed', attempts: 1 } }
    } as never)

    await requestVideoVariantReconciliation({
      ...intent,
      reason: 'video-variant-publication-change'
    })

    const { data } =
      prismaMock.videoVariantReconciliation.update.mock.calls[0][0]
    // A timed-out Mux upload never produced media, so it must still be
    // excluded from the generated-parent shape heuristic rather than being
    // force-published as a media-less container parent.
    expect(data).toMatchObject({ reason: 'video-variant-create' })
  })

  it.each([
    ['still processing', 'processing'],
    ['timed out', 'failed']
  ])(
    'does not let a fresh upload whose Mux is %s swallow a delete',
    async (_label, muxState) => {
      prismaMock.videoVariantReconciliation.findUnique.mockResolvedValue({
        id: 'status-1',
        reason: 'video-variant-create',
        processingStages: { mux: { state: muxState, attempts: 1 } }
      } as never)

      await requestVideoVariantReconciliation({
        ...intent,
        published: false,
        reason: 'video-variant-delete'
      })

      const { data } =
        prismaMock.videoVariantReconciliation.update.mock.calls[0][0]
      // reconcileReasonSpecificVariant only runs the delete cleanup for this
      // reason; keeping 'video-variant-create' would leave the row to fail on
      // a Variant that no longer exists and alert on it.
      expect(data).toMatchObject({ reason: 'video-variant-delete' })
    }
  )

  it('overwrites the reason normally once Mux has resolved', async () => {
    prismaMock.videoVariantReconciliation.findUnique.mockResolvedValue({
      id: 'status-1',
      reason: 'video-variant-create',
      processingStages: { mux: { state: 'complete', attempts: 1 } }
    } as never)

    await requestVideoVariantReconciliation({
      ...intent,
      reason: 'video-variant-publication-change'
    })

    const { data } =
      prismaMock.videoVariantReconciliation.update.mock.calls[0][0]
    expect(data).toMatchObject({ reason: 'video-variant-publication-change' })
  })

  it('does not apply stickiness to a non-fresh-upload reason', async () => {
    prismaMock.videoVariantReconciliation.findUnique.mockResolvedValue({
      id: 'status_53424_Rescue',
      reason: 'generated-parent',
      processingStages: { mux: { state: 'notApplicable', attempts: 0 } }
    } as never)

    await requestVideoVariantReconciliation(intent)

    const { data } =
      prismaMock.videoVariantReconciliation.update.mock.calls[0][0]
    expect(data).toMatchObject({ reason: 'video-relationship-change' })
  })
})
