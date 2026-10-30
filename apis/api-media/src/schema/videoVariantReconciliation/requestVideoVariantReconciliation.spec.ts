import { beforeEach, vi } from 'vitest'

import { prismaMock } from '../../../test/prismaMock'

import {
  FRESH_UPLOAD_REASONS,
  requestVideoVariantReconciliation
} from './requestVideoVariantReconciliation'

// A toggle is pending while its row is still processing, or degraded but
// still scheduled for a retry. A degraded row with no retryAt is final: the
// sweep will never pick it up again, so it must not block a later upload.
const pendingExplicitPublication = {
  reason: {
    in: ['video-variant-publication-change', 'fresh-upload-publication-change']
  },
  OR: [{ status: 'processing' }, { status: 'degraded', retryAt: { not: null } }]
}
const notPendingExplicitPublication = { NOT: pendingExplicitPublication }

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
  })

  it('restarts the clock when re-requesting an existing record', async () => {
    prismaMock.videoVariantReconciliation.findUnique.mockResolvedValue({
      id: 'status_53424_Rescue'
    } as never)
    const before = Date.now()

    await requestVideoVariantReconciliation(intent)

    expect(prismaMock.videoVariantReconciliation.create).not.toHaveBeenCalled()
    // Both conditional writes (pending toggle / no pending toggle) restart it.
    for (const [{ data }] of prismaMock.videoVariantReconciliation.updateMany
      .mock.calls) {
      expect(data).toMatchObject({ status: 'processing', errorMessage: null })
      // The reconciler's time windows count from createdAt, so a re-request
      // must not inherit the original request's age.
      expect((data.createdAt as Date).getTime()).toBeGreaterThanOrEqual(before)
    }
    expect(
      prismaMock.videoVariantReconciliation.updateMany.mock.calls[1][0].data
    ).toMatchObject({ reason: 'video-relationship-change' })
  })

  it('records an explicit toggle on a fresh upload before Mux resolves as a fresh-upload toggle', async () => {
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
    // Still a fresh upload (kept out of the generated-parent shape
    // heuristic), and still an explicit toggle (protected from a stale
    // upload callback).
    expect(data).toMatchObject({
      reason: 'fresh-upload-publication-change',
      published: true
    })
    expect(FRESH_UPLOAD_REASONS.has('fresh-upload-publication-change')).toBe(
      true
    )
  })

  it('drops fresh-upload stickiness for a toggle on a Variant with nothing awaiting Mux', async () => {
    // A collection's own Variant from the videos-admin create form: created
    // with no media and no Mux asset, so its video-variant-create reason
    // would otherwise stay "fresh" forever and the sweep would wait two
    // hours on a Mux asset that does not exist, then fail and alert.
    prismaMock.videoVariantReconciliation.findUnique.mockResolvedValue({
      id: 'status-1',
      reason: 'video-variant-create',
      processingStages: { mux: { state: 'processing', attempts: 1 } }
    } as never)

    await requestVideoVariantReconciliation({
      ...intent,
      reason: 'video-variant-publication-change',
      awaitingMux: false
    })

    const { data } =
      prismaMock.videoVariantReconciliation.update.mock.calls[0][0]
    expect(data).toMatchObject({
      reason: 'video-variant-publication-change',
      published: true
    })
  })

  it('keeps treating a fresh upload as fresh when toggled after Mux times out', async () => {
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
    expect(data).toMatchObject({ reason: 'fresh-upload-publication-change' })
  })

  it('keeps the original reason when a fresh upload gets a non-toggle re-request before Mux resolves', async () => {
    prismaMock.videoVariantReconciliation.findUnique.mockResolvedValue({
      id: 'status-1',
      reason: 'video-variant-create',
      processingStages: { mux: { state: 'processing', attempts: 1 } }
    } as never)

    await requestVideoVariantReconciliation({
      ...intent,
      reason: 'video-variant-language-change'
    })

    expect(
      prismaMock.videoVariantReconciliation.updateMany
    ).toHaveBeenLastCalledWith({
      where: { id: 'status-1', ...notPendingExplicitPublication },
      data: expect.objectContaining({ reason: 'video-variant-create' })
    })
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

    expect(
      prismaMock.videoVariantReconciliation.updateMany
    ).toHaveBeenLastCalledWith({
      where: { id: 'status_53424_Rescue', ...notPendingExplicitPublication },
      data: expect.objectContaining({ reason: 'video-relationship-change' })
    })
  })

  describe('publish intent', () => {
    beforeEach(() => {
      prismaMock.videoVariantReconciliation.findUnique.mockResolvedValue({
        id: 'reconciliation-1'
      } as never)
    })

    it('does not overwrite an explicit Draft request with a stale upload-ready publish', async () => {
      prismaMock.videoVariantReconciliation.updateMany.mockResolvedValue({
        count: 0
      })

      await requestVideoVariantReconciliation({
        videoVariantId: 'variant-1',
        videoId: 'video-1',
        languageId: '20770',
        edition: 'base',
        published: true,
        reason: 'process-video-upload'
      })

      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalledWith({
        where: { id: 'reconciliation-1', ...notPendingExplicitPublication },
        data: expect.objectContaining({
          reason: 'process-video-upload',
          published: true
        })
      })
      expect(
        prismaMock.videoVariantReconciliation.update
      ).not.toHaveBeenCalled()
    })

    it('does not overwrite an explicit republish with a stale upload-ready draft', async () => {
      prismaMock.videoVariantReconciliation.updateMany.mockResolvedValue({
        count: 0
      })

      await requestVideoVariantReconciliation({
        videoVariantId: 'variant-1',
        videoId: 'video-1',
        languageId: '20770',
        edition: 'base',
        published: false,
        reason: 'process-video-upload'
      })

      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalledWith({
        where: { id: 'reconciliation-1', ...notPendingExplicitPublication },
        data: expect.objectContaining({
          reason: 'process-video-upload',
          published: false
        })
      })
      expect(
        prismaMock.videoVariantReconciliation.update
      ).not.toHaveBeenCalled()
    })

    it('still applies an upload-ready publish when no explicit Draft request is pending', async () => {
      prismaMock.videoVariantReconciliation.updateMany.mockResolvedValue({
        count: 1
      })

      await requestVideoVariantReconciliation({
        videoVariantId: 'variant-1',
        videoId: 'video-1',
        languageId: '20770',
        edition: 'base',
        published: true,
        reason: 'process-video-upload'
      })

      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalled()
    })

    it('always applies an explicit unpublish request, overwriting any pending intent', async () => {
      await requestVideoVariantReconciliation({
        videoVariantId: 'variant-1',
        videoId: 'video-1',
        languageId: '20770',
        edition: 'base',
        published: false,
        reason: 'video-variant-publication-change'
      })

      expect(prismaMock.videoVariantReconciliation.update).toHaveBeenCalledWith(
        {
          where: { id: 'reconciliation-1' },
          data: expect.objectContaining({
            reason: 'video-variant-publication-change',
            published: false
          })
        }
      )
      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).not.toHaveBeenCalled()
    })

    it('still applies an upload-ready draft when no explicit publish request is pending', async () => {
      prismaMock.videoVariantReconciliation.updateMany.mockResolvedValue({
        count: 1
      })

      await requestVideoVariantReconciliation({
        videoVariantId: 'variant-1',
        videoId: 'video-1',
        languageId: '20770',
        edition: 'base',
        published: false,
        reason: 'process-video-upload'
      })

      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalled()
      expect(
        prismaMock.videoVariantReconciliation.update
      ).not.toHaveBeenCalled()
    })

    it('does not overwrite a pending publish intent with a language change', async () => {
      await requestVideoVariantReconciliation({
        videoVariantId: 'variant-1',
        videoId: 'video-1',
        languageId: '20770',
        edition: 'base',
        published: false,
        reason: 'video-variant-language-change'
      })

      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalledWith({
        where: { id: 'reconciliation-1', ...notPendingExplicitPublication },
        data: expect.not.objectContaining({ published: expect.anything() })
      })
      expect(
        prismaMock.videoVariantReconciliation.update
      ).not.toHaveBeenCalled()
    })

    it('keeps a pending explicit Draft request protected when a language change lands first', async () => {
      // Without this, a language change landing while an explicit Draft is
      // still pending would overwrite `reason` to video-variant-language-change,
      // which drops the guard that stops a later stale upload callback from
      // reinstating `published: true` over the pending Draft. The guard is
      // evaluated against the row's live state at write time (via `where`),
      // not this stale `findUnique` read, so a concurrent explicit toggle that
      // lands between the read and the write is still protected. The write
      // leaves `reason` out entirely, so either explicit reason
      // (video-variant-publication-change or fresh-upload-publication-change)
      // survives as-is.
      prismaMock.videoVariantReconciliation.findUnique.mockResolvedValue({
        id: 'reconciliation-1',
        reason: 'video-variant-publication-change',
        status: 'processing'
      } as never)

      await requestVideoVariantReconciliation({
        videoVariantId: 'variant-1',
        videoId: 'video-1',
        languageId: '20770',
        edition: 'base',
        published: false,
        reason: 'video-variant-language-change'
      })

      // Check each key on its own: `expect.not.objectContaining` with both
      // keys passes as soon as either one is missing.
      const protectedCall =
        prismaMock.videoVariantReconciliation.updateMany.mock.calls.find(
          ([args]) => args.where != null && !('NOT' in args.where)
        )
      expect(protectedCall?.[0].where).toEqual({
        id: 'reconciliation-1',
        ...pendingExplicitPublication
      })
      expect(protectedCall?.[0].data).not.toHaveProperty('reason')
      expect(protectedCall?.[0].data).not.toHaveProperty('published')
    })

    it('records an upload callback as process-video-upload after a fresh-upload toggle times out', async () => {
      // The toggle failed with Mux, so it is no longer pending and the
      // re-upload's callback is allowed to write. Keeping the toggle's
      // reason would mark the row as a pending explicit toggle no editor
      // made, and block the next upload callback while it processes.
      prismaMock.videoVariantReconciliation.findUnique.mockResolvedValue({
        id: 'reconciliation-1',
        reason: 'fresh-upload-publication-change',
        processingStages: { mux: { state: 'failed', attempts: 1 } }
      } as never)
      prismaMock.videoVariantReconciliation.updateMany.mockResolvedValue({
        count: 1
      })

      await requestVideoVariantReconciliation({
        videoVariantId: 'variant-1',
        videoId: 'video-1',
        languageId: '20770',
        edition: 'base',
        published: true,
        reason: 'process-video-upload'
      })

      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalledWith({
        where: { id: 'reconciliation-1', ...notPendingExplicitPublication },
        data: expect.objectContaining({
          reason: 'process-video-upload',
          published: true
        })
      })
    })

    it('lets an upload callback write over a toggle whose degraded state is final', async () => {
      // 'degraded' with retryAt null is what persistReconciliationStatus
      // leaves after five attempts or a non-retryable Algolia error. The
      // sweep never revisits it, so a re-upload's callback must be allowed
      // to write; otherwise the variant stays offline until someone toggles
      // it by hand.
      prismaMock.videoVariantReconciliation.findUnique.mockResolvedValue({
        id: 'reconciliation-1',
        reason: 'video-variant-publication-change',
        processingStages: { mux: { state: 'complete', attempts: 1 } }
      } as never)
      prismaMock.videoVariantReconciliation.updateMany.mockResolvedValue({
        count: 1
      })

      await requestVideoVariantReconciliation({
        videoVariantId: 'variant-1',
        videoId: 'video-1',
        languageId: '20770',
        edition: 'base',
        published: false,
        reason: 'process-video-upload'
      })

      const { where } =
        prismaMock.videoVariantReconciliation.updateMany.mock.calls[0][0] ?? {}
      expect(where).toEqual({
        id: 'reconciliation-1',
        ...notPendingExplicitPublication
      })
      // The exclusion only covers a degraded row that is still retrying, so
      // a final one (retryAt null) falls outside it and the write applies.
      expect(where?.NOT).toMatchObject({
        OR: expect.arrayContaining([
          { status: 'degraded', retryAt: { not: null } }
        ])
      })
      expect(where?.NOT).not.toMatchObject({
        OR: expect.arrayContaining([{ status: 'degraded' }])
      })
    })

    it('still protects a toggle that is degraded but retrying from an upload callback', async () => {
      prismaMock.videoVariantReconciliation.findUnique.mockResolvedValue({
        id: 'reconciliation-1',
        reason: 'video-variant-publication-change',
        processingStages: { mux: { state: 'complete', attempts: 1 } }
      } as never)
      prismaMock.videoVariantReconciliation.updateMany.mockResolvedValue({
        count: 0
      })

      await requestVideoVariantReconciliation({
        videoVariantId: 'variant-1',
        videoId: 'video-1',
        languageId: '20770',
        edition: 'base',
        published: true,
        reason: 'process-video-upload'
      })

      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalledTimes(1)
      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalledWith({
        where: { id: 'reconciliation-1', ...notPendingExplicitPublication },
        data: expect.objectContaining({ published: true })
      })
      expect(
        prismaMock.videoVariantReconciliation.update
      ).not.toHaveBeenCalled()
    })

    it('adopts the new reason once the pending Draft request has settled', async () => {
      prismaMock.videoVariantReconciliation.findUnique.mockResolvedValue({
        id: 'reconciliation-1',
        reason: 'video-variant-publication-change',
        status: 'complete'
      } as never)

      await requestVideoVariantReconciliation({
        videoVariantId: 'variant-1',
        videoId: 'video-1',
        languageId: '20770',
        edition: 'base',
        published: false,
        reason: 'video-variant-language-change'
      })

      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalledWith({
        where: { id: 'reconciliation-1', ...notPendingExplicitPublication },
        data: expect.objectContaining({
          reason: 'video-variant-language-change'
        })
      })
    })

    it('creates a new reconciliation row when none exists yet', async () => {
      prismaMock.videoVariantReconciliation.findUnique.mockResolvedValue(null)

      await requestVideoVariantReconciliation({
        videoVariantId: 'variant-1',
        videoId: 'video-1',
        languageId: '20770',
        edition: 'base',
        published: true,
        reason: 'process-video-upload'
      })

      expect(prismaMock.videoVariantReconciliation.create).toHaveBeenCalledWith(
        {
          data: expect.objectContaining({
            videoVariantId: 'variant-1',
            published: true
          })
        }
      )
    })
  })
})
