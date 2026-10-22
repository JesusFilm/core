import { type MockInstance, vi } from 'vitest'

import { prismaMock } from '../../test/prismaMock'
import { videoCacheReset } from '../lib/videoCacheReset'

import { fixStuckDraftVariants } from './fix-stuck-draft-variants'

vi.mock('../lib/videoCacheReset', () => ({
  videoCacheReset: vi.fn().mockResolvedValue(undefined)
}))

const staleCreatedAt = new Date('2026-10-01T00:00:00.000Z')

function brokenR4(): Record<string, unknown> {
  return {
    id: '529_Next_Gen_Media_ASF_Collection',
    videoId: 'Next_Gen_Media_ASF_Collection',
    languageId: '529',
    published: false,
    video: {
      id: 'Next_Gen_Media_ASF_Collection',
      published: false,
      availableLanguages: []
    },
    reconciliation: {
      id: 'reconciliation-r4',
      status: 'failed',
      published: true,
      retryAt: null,
      errorMessage: 'Mux did not produce a usable Variant within two hours',
      createdAt: staleCreatedAt
    }
  }
}

function brokenR2(): Record<string, unknown> {
  return {
    id: '7_529-KnowGodBPFull',
    videoId: '7_KnowGodBPFull',
    languageId: '529',
    published: false,
    video: {
      id: '7_KnowGodBPFull',
      published: false,
      availableLanguages: []
    },
    reconciliation: {
      id: 'reconciliation-r2',
      status: 'processing',
      published: true,
      retryAt: new Date('2026-10-22T01:00:00.000Z'),
      errorMessage: null,
      createdAt: staleCreatedAt
    }
  }
}

function mockVariants(variants: Array<Record<string, unknown> | null>): void {
  const byId = new Map<string, Record<string, unknown>>()
  for (const variant of variants) {
    if (variant != null) byId.set(variant.id as string, variant)
  }
  prismaMock.videoVariant.findUnique.mockImplementation((({
    where
  }: {
    where: { id: string }
  }) => Promise.resolve(byId.get(where.id) ?? null)) as never)
}

describe('fixStuckDraftVariants', () => {
  let logSpy: MockInstance<typeof console.log>

  function output(): string {
    return logSpy.mock.calls.map((args) => args.join(' ')).join('\n')
  }

  beforeEach(() => {
    vi.mocked(videoCacheReset).mockClear()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
        await callback(prismaMock)
    )
    prismaMock.videoVariant.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.video.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.videoVariantReconciliation.updateMany.mockResolvedValue({
      count: 1
    })
  })

  afterEach(() => {
    logSpy.mockRestore()
  })

  describe('dry run', () => {
    it('prints the before state and intended changes without writing', async () => {
      mockVariants([brokenR4(), brokenR2()])

      await expect(fixStuckDraftVariants(false)).resolves.toBe(true)

      expect(prismaMock.$transaction).not.toHaveBeenCalled()
      expect(prismaMock.videoVariant.updateMany).not.toHaveBeenCalled()
      expect(prismaMock.video.updateMany).not.toHaveBeenCalled()
      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).not.toHaveBeenCalled()
      expect(videoCacheReset).not.toHaveBeenCalled()

      const printed = output()
      expect(printed).toContain(
        '[R4] VideoVariant 529_Next_Gen_Media_ASF_Collection'
      )
      expect(printed).toContain('[R2] VideoVariant 7_529-KnowGodBPFull')
      expect(printed).toContain(
        'errorMessage: "Mux did not produce a usable Variant within two hours"'
      )
      expect(printed).toContain('createdAt: "2026-10-01T00:00:00.000Z"')
      expect(printed).toContain('VideoVariant.published: false -> true')
      expect(printed).toContain(
        'Video 7_KnowGodBPFull availableLanguages: [] -> ["529"]'
      )
      expect(printed).toContain(
        'VideoVariantReconciliation reconciliation-r4: status "failed" -> "complete"'
      )
      expect(printed).toContain(
        'VideoVariantReconciliation reconciliation-r2: status "processing" -> "complete"'
      )
      expect(printed).toContain('retryAt "2026-10-22T01:00:00.000Z" -> null')
      expect(printed).toContain('DRY RUN')
    })

    it('does not plan an availableLanguages change for R4', async () => {
      mockVariants([brokenR4(), brokenR2()])

      await fixStuckDraftVariants(false)

      expect(output()).not.toContain(
        'Video Next_Gen_Media_ASF_Collection availableLanguages: [] ->'
      )
    })
  })

  describe('apply', () => {
    it('writes both records in one transaction then resets both Video caches', async () => {
      mockVariants([brokenR4(), brokenR2()])

      await expect(fixStuckDraftVariants(true)).resolves.toBe(true)

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)

      expect(prismaMock.videoVariant.updateMany).toHaveBeenCalledWith({
        where: {
          id: '529_Next_Gen_Media_ASF_Collection',
          videoId: 'Next_Gen_Media_ASF_Collection',
          languageId: '529',
          published: false
        },
        data: { published: true }
      })
      expect(prismaMock.videoVariant.updateMany).toHaveBeenCalledWith({
        where: {
          id: '7_529-KnowGodBPFull',
          videoId: '7_KnowGodBPFull',
          languageId: '529',
          published: false
        },
        data: { published: true }
      })

      expect(prismaMock.video.updateMany).toHaveBeenCalledTimes(1)
      expect(prismaMock.video.updateMany).toHaveBeenCalledWith({
        where: {
          id: '7_KnowGodBPFull',
          NOT: { availableLanguages: { has: '529' } }
        },
        data: { availableLanguages: { push: '529' } }
      })

      const reconciliationData = {
        status: 'complete',
        published: true,
        retryAt: null,
        errorMessage: null
      }
      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalledWith({
        where: {
          videoVariantId: '529_Next_Gen_Media_ASF_Collection',
          status: { not: 'complete' }
        },
        data: reconciliationData
      })
      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalledWith({
        where: {
          videoVariantId: '7_529-KnowGodBPFull',
          status: { not: 'complete' }
        },
        data: reconciliationData
      })

      expect(prismaMock.video.update).not.toHaveBeenCalled()
      expect(videoCacheReset).toHaveBeenCalledTimes(2)
      expect(videoCacheReset).toHaveBeenCalledWith(
        'Next_Gen_Media_ASF_Collection'
      )
      expect(videoCacheReset).toHaveBeenCalledWith('7_KnowGodBPFull')
      expect(output()).toContain('APPLIED')
    })

    it('rolls back and skips cache resets when a guarded write matches no row', async () => {
      mockVariants([brokenR4(), brokenR2()])
      prismaMock.videoVariantReconciliation.updateMany.mockResolvedValueOnce({
        count: 1
      })
      prismaMock.videoVariantReconciliation.updateMany.mockResolvedValueOnce({
        count: 0
      })

      await expect(fixStuckDraftVariants(true)).rejects.toThrow(
        'VideoVariantReconciliation for 7_529-KnowGodBPFull changed'
      )
      expect(videoCacheReset).not.toHaveBeenCalled()
    })
  })

  describe('precondition abort', () => {
    it('writes nothing when R2 availableLanguages already contains 529', async () => {
      const r2 = brokenR2()
      r2.video = { ...(r2.video as object), availableLanguages: ['529'] }
      mockVariants([brokenR4(), r2])

      await expect(fixStuckDraftVariants(true)).resolves.toBe(false)

      expect(prismaMock.$transaction).not.toHaveBeenCalled()
      expect(videoCacheReset).not.toHaveBeenCalled()
      expect(output()).toContain(
        '[R2] Video 7_KnowGodBPFull availableLanguages already contains 529'
      )
    })

    it('writes nothing for either record when only R4 has drifted', async () => {
      const r4 = brokenR4()
      r4.published = true
      r4.reconciliation = {
        ...(r4.reconciliation as object),
        status: 'complete'
      }
      mockVariants([r4, brokenR2()])

      await expect(fixStuckDraftVariants(true)).resolves.toBe(false)

      expect(prismaMock.$transaction).not.toHaveBeenCalled()
      expect(prismaMock.videoVariant.updateMany).not.toHaveBeenCalled()
      const printed = output()
      expect(printed).toContain(
        '[R4] VideoVariant 529_Next_Gen_Media_ASF_Collection published is true, expected false'
      )
      expect(printed).toContain(
        '[R4] VideoVariantReconciliation reconciliation-r4 status is already complete'
      )
    })

    it('aborts when a variant or its reconciliation row is missing', async () => {
      const r2 = brokenR2()
      r2.reconciliation = null
      mockVariants([null, r2])

      await expect(fixStuckDraftVariants(false)).resolves.toBe(false)

      const printed = output()
      expect(printed).toContain(
        '[R4] VideoVariant 529_Next_Gen_Media_ASF_Collection not found'
      )
      expect(printed).toContain(
        '[R2] VideoVariantReconciliation for 7_529-KnowGodBPFull not found'
      )
    })
  })
})
