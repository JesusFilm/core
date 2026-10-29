import { prismaMock } from '../../../test/prismaMock'

import { findDueReconciliations } from './dueRecords'

describe('findDueReconciliations', () => {
  const where = { status: { in: ['processing' as const] } }

  it('takes user-initiated records before bulk ones', async () => {
    prismaMock.videoVariantReconciliation.findMany
      .mockResolvedValueOnce([{ id: 'publish-toggle' }] as any)
      .mockResolvedValueOnce([{ id: 'relationship-1' }] as any)

    const due = await findDueReconciliations({ where, take: 2 })

    expect(due).toEqual([{ id: 'publish-toggle' }, { id: 'relationship-1' }])
    expect(
      prismaMock.videoVariantReconciliation.findMany
    ).toHaveBeenNthCalledWith(1, {
      where: {
        AND: [
          where,
          {
            reason: {
              notIn: ['video-relationship-change', 'backfill-generated-parent']
            }
          }
        ]
      },
      select: { id: true },
      orderBy: { retryAt: 'asc' },
      take: 2
    })
    expect(
      prismaMock.videoVariantReconciliation.findMany
    ).toHaveBeenNthCalledWith(2, {
      where: {
        AND: [
          where,
          {
            reason: {
              in: ['video-relationship-change', 'backfill-generated-parent']
            }
          }
        ]
      },
      select: { id: true },
      orderBy: { retryAt: 'asc' },
      take: 1
    })
  })

  it('skips the bulk query when user-initiated records fill the batch', async () => {
    prismaMock.videoVariantReconciliation.findMany.mockResolvedValueOnce([
      { id: 'publish-toggle-1' },
      { id: 'publish-toggle-2' }
    ] as any)

    const due = await findDueReconciliations({ where, take: 2 })

    expect(due).toEqual([{ id: 'publish-toggle-1' }, { id: 'publish-toggle-2' }])
    expect(prismaMock.videoVariantReconciliation.findMany).toHaveBeenCalledTimes(
      1
    )
  })
})
