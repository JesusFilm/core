import { Video } from '@core/prisma/media/client'

import { prismaMock } from '../../../../../test/prismaMock'

import { seedVideoLanguages } from './videoLanguage'

interface VideoRow {
  id: string
  variants: Array<{ languageId: string }>
  children: Array<{ availableLanguages: string[] }>
}

// seedVideoLanguages reads twice: once for the id list, once for the batched
// recompute. Serve both from the same fixture so a test only declares rows.
function givenVideos(rows: VideoRow[]): void {
  ;(prismaMock.video.findMany as any).mockImplementation(
    async ({ select }: { select?: Record<string, unknown> }) =>
      select?.variants == null
        ? (rows.map(({ id }) => ({ id })) as unknown as Video[])
        : rows
  )
  ;(prismaMock.$transaction as any).mockImplementation(
    async (updates: Array<Promise<unknown>>) => Promise.all(updates)
  )
}

describe('seedVideoLanguages', () => {
  it('routes every video through the shared recompute, so a container keeps its child-derived languages', async () => {
    // A container video (e.g. a series) has no variants of its own - if
    // this job derived availableLanguages from a video's own variants only,
    // it would zero this out even though the child legitimately provides
    // the language.
    givenVideos([
      {
        id: 'container',
        variants: [],
        children: [{ availableLanguages: ['529'] }]
      },
      { id: 'child', variants: [{ languageId: '529' }], children: [] }
    ])

    await seedVideoLanguages()

    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: 'container' },
      data: { availableLanguages: ['529'] }
    })
    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: 'child' },
      data: { availableLanguages: ['529'] }
    })
  })

  it('still derives a leaf video (no children) from its own published variants', async () => {
    givenVideos([
      {
        id: 'leaf',
        variants: [{ languageId: '496' }, { languageId: '529' }],
        children: []
      }
    ])

    await seedVideoLanguages()

    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: 'leaf' },
      data: { availableLanguages: ['496', '529'] }
    })
  })

  it('skips a video the batched lookup returns no row for', async () => {
    // The id scan and the recompute are separate reads, so a video deleted
    // between them has no row to reduce and no entry in the returned map.
    // Updating a since-deleted id would fail (and roll back) the whole
    // batch's transaction, so it must be skipped rather than updated with
    // an empty array.
    ;(prismaMock.video.findMany as any).mockImplementation(
      async ({ select }: { select?: Record<string, unknown> }) =>
        select?.variants == null
          ? ([{ id: 'vanished' }] as unknown as Video[])
          : []
    )
    ;(prismaMock.$transaction as any).mockImplementation(
      async (updates: Array<Promise<unknown>>) => Promise.all(updates)
    )

    await seedVideoLanguages()

    expect(prismaMock.video.update).not.toHaveBeenCalled()
  })

  it('issues a bounded number of read queries no matter how many videos exist', async () => {
    // This job runs over the whole Video table, so its read cost must not
    // scale with the catalog. Deriving each video through a per-id lookup
    // made this O(rows) - 401 reads for 400 videos - and got worse with
    // every title added. The batched lookup keeps it flat at two.
    const readsByRowCount = new Map<number, number>()

    for (const rowCount of [10, 100, 400]) {
      prismaMock.video.findMany.mockReset()
      prismaMock.video.findUnique.mockReset()

      givenVideos(
        Array.from({ length: rowCount }, (_, index) => ({
          id: `video-${index}`,
          variants: [{ languageId: '529' }],
          children: []
        }))
      )

      await seedVideoLanguages()

      readsByRowCount.set(
        rowCount,
        prismaMock.video.findMany.mock.calls.length +
          prismaMock.video.findUnique.mock.calls.length
      )
    }

    expect([...readsByRowCount.values()]).toEqual([2, 2, 2])
    expect(prismaMock.video.findUnique).not.toHaveBeenCalled()
  })

  it('chunks the batched recompute once the catalog exceeds a single read chunk', async () => {
    // A single `id: { in: videoIds } }` filter over the whole table can
    // exceed the database's bind-parameter limit once the catalog is large
    // enough, so the recompute must page through the id list in chunks
    // rather than pass all of it to one query.
    const rowCount = 5001
    const rows = Array.from({ length: rowCount }, (_, index) => ({
      id: `video-${index}`,
      variants: [{ languageId: '529' }],
      children: []
    }))
    const recomputeCallSizes: number[] = []

    ;(prismaMock.video.findMany as any).mockImplementation(
      async ({
        select,
        where
      }: {
        select?: Record<string, unknown>
        where?: { id: { in: string[] } }
      }) => {
        if (select?.variants == null) {
          return rows.map(({ id }) => ({ id })) as unknown as Video[]
        }
        const ids = where?.id.in ?? []
        recomputeCallSizes.push(ids.length)
        return rows.filter((row) => ids.includes(row.id))
      }
    )
    ;(prismaMock.$transaction as any).mockImplementation(
      async (updates: Array<Promise<unknown>>) => Promise.all(updates)
    )

    await seedVideoLanguages()

    expect(recomputeCallSizes).toEqual([5000, 1])
    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: 'video-0' },
      data: { availableLanguages: ['529'] }
    })
    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: `video-${rowCount - 1}` },
      data: { availableLanguages: ['529'] }
    })
  })
})
