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

  it('empties a video the batched lookup returns no row for', async () => {
    // The id scan and the recompute are separate reads, so a video deleted
    // between them has no row to reduce. It must still be updated, not
    // skipped and not crash on a missing map entry.
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

    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: 'vanished' },
      data: { availableLanguages: [] }
    })
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
})
