import { vi } from 'vitest'

import { Prisma } from '@core/prisma/media/client'

import { prismaMock } from '../../../../../test/prismaMock'
import { logger } from '../../../lib/logger'

import { seedVideoLanguages } from './videoLanguage'

interface VideoRow {
  id: string
  variants: Array<{ languageId: string }>
  children: Array<{ availableLanguages: string[] }>
}

// seedVideoLanguages issues two distinct findMany shapes: the plain id scan
// (no `select.variants`) and the batched recompute's selected-payload read.
// Typing the mock implementations against the real args/return types -
// rather than `any` - keeps a fixture that drifts from videoLanguage.ts's
// actual `select` a compile error, with the widening confined to the mock
// boundary (the as*Result helpers below, which every fixture in this file
// is already narrower than).
type SeedVideoFindManyArgs = Prisma.VideoFindManyArgs

function isRecomputeArgs(args: SeedVideoFindManyArgs): boolean {
  return args.select?.variants != null
}

// `where.id` is typed as `StringFilter | string` since Prisma also allows a
// bare equality match - the recompute's chunked reads only ever pass the
// `{ in }` form, so that's the only shape narrowed here. `in` itself admits
// a `FieldRef` (a column-to-column comparison) alongside a literal array -
// the recompute only ever constructs it from a literal array of ids.
function idsFromArgs(args: SeedVideoFindManyArgs): string[] {
  const idFilter = args.where?.id
  if (typeof idFilter !== 'object' || idFilter == null || !('in' in idFilter)) {
    return []
  }
  return Array.isArray(idFilter.in) ? idFilter.in : []
}

// The deep mock's findMany/update/$transaction signatures return
// PrismaPromise, not a plain Promise - mockResolvedValue(Once) handles that
// wrapping internally, but a `mockImplementation` callback must produce it
// explicitly. These confine that one bit of widening to the mock boundary,
// leaving every fixture above typed and compile-checked against the real
// selected-payload shape.
function asFindManyResult(
  rows: unknown
): ReturnType<typeof prismaMock.video.findMany> {
  return Promise.resolve(rows) as unknown as ReturnType<
    typeof prismaMock.video.findMany
  >
}

function asUpdateResult(
  row: unknown
): ReturnType<typeof prismaMock.video.update> {
  return Promise.resolve(row) as unknown as ReturnType<
    typeof prismaMock.video.update
  >
}

function asTransactionResult(
  value: unknown
): ReturnType<typeof prismaMock.$transaction> {
  return Promise.resolve(value)
}

// `$transaction` is overloaded (an array of queries, or an interactive
// callback) - this job only ever uses the array form, but a
// `mockImplementation` callback must satisfy the whole overloaded type,
// not just the branch under test. Typing the parameter `unknown` (rather
// than casting the mock itself) accepts either call shape while the cast
// stays confined to this one, deliberately-narrowed boundary.
function givenTransactionPassesThrough(): void {
  prismaMock.$transaction.mockImplementation((updates: unknown) =>
    asTransactionResult(Promise.all(updates as Array<Promise<unknown>>))
  )
}

// seedVideoLanguages reads twice: once for the id list, once for the batched
// recompute. Serve both from the same fixture so a test only declares rows.
function givenVideos(rows: VideoRow[]): void {
  prismaMock.video.findMany.mockImplementation(
    (args: SeedVideoFindManyArgs = {}) =>
      asFindManyResult(
        isRecomputeArgs(args) ? rows : rows.map(({ id }) => ({ id }))
      )
  )
  givenTransactionPassesThrough()
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
    prismaMock.video.findMany.mockImplementation(
      (args: SeedVideoFindManyArgs = {}) =>
        asFindManyResult(isRecomputeArgs(args) ? [] : [{ id: 'vanished' }])
    )
    givenTransactionPassesThrough()

    await seedVideoLanguages()

    expect(prismaMock.video.update).not.toHaveBeenCalled()
  })

  it('issues a bounded number of read queries no matter how many videos exist', async () => {
    // This job runs over the whole Video table, so its read cost must not
    // scale with the catalog. Deriving each video through a per-id lookup
    // made this O(rows) - 401 reads for 400 videos - and got worse with
    // every title added. The batched lookup keeps it flat regardless of
    // row count: one id scan, then one recompute pass that writes, then a
    // second recompute pass that finds nothing left to change and stops
    // without writing again.
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

    expect([...readsByRowCount.values()]).toEqual([3, 3, 3])
    expect(prismaMock.video.findUnique).not.toHaveBeenCalled()
  })

  it('converges a multi-level hierarchy over several passes instead of zeroing out the top', async () => {
    // A single pass reads every child's *currently stored* availableLanguages,
    // so a 3-level hierarchy (collection > series > episode) only has its
    // leaf corrected on the first pass - the series and collection above it
    // would still compute from stale pre-fix values and stay wrong. This
    // fixture starts every container with a stale (empty) stored value, the
    // kind of drift this job exists to repair, and asserts the whole chain
    // ends up correct, not just the leaf.
    interface StatefulRow {
      id: string
      variants: Array<{ languageId: string }>
      childIds: string[]
      availableLanguages: string[]
    }

    const store = new Map<string, StatefulRow>(
      [
        {
          id: 'episode',
          variants: [{ languageId: '529' }],
          childIds: [],
          availableLanguages: []
        },
        {
          id: 'series',
          variants: [],
          childIds: ['episode'],
          availableLanguages: []
        },
        {
          id: 'collection',
          variants: [],
          childIds: ['series'],
          availableLanguages: []
        }
      ].map((row) => [row.id, row])
    )

    prismaMock.video.findMany.mockImplementation(
      (args: SeedVideoFindManyArgs = {}) => {
        if (!isRecomputeArgs(args)) {
          return asFindManyResult([...store.keys()].map((id) => ({ id })))
        }
        const ids = idsFromArgs(args)
        return asFindManyResult(
          ids.map((id) => {
            const row = store.get(id) as StatefulRow
            return {
              id,
              variants: row.variants,
              children: row.childIds.map((childId) => ({
                availableLanguages: (store.get(childId) as StatefulRow)
                  .availableLanguages
              }))
            }
          })
        )
      }
    )
    prismaMock.video.update.mockImplementation(
      (args: Prisma.VideoUpdateArgs) => {
        const availableLanguages = (
          args.data as { availableLanguages?: string[] }
        ).availableLanguages
        ;(
          store.get(args.where.id as string) as StatefulRow
        ).availableLanguages = availableLanguages ?? []
        return asUpdateResult({})
      }
    )
    givenTransactionPassesThrough()

    await seedVideoLanguages()

    expect(store.get('episode')?.availableLanguages).toEqual(['529'])
    expect(store.get('series')?.availableLanguages).toEqual(['529'])
    expect(store.get('collection')?.availableLanguages).toEqual(['529'])
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

    prismaMock.video.findMany.mockImplementation(
      (args: SeedVideoFindManyArgs = {}) => {
        if (!isRecomputeArgs(args)) {
          return asFindManyResult(rows.map(({ id }) => ({ id })))
        }
        const ids = idsFromArgs(args)
        recomputeCallSizes.push(ids.length)
        return asFindManyResult(rows.filter((row) => ids.includes(row.id)))
      }
    )
    givenTransactionPassesThrough()

    await seedVideoLanguages()

    // Two passes over this flat fixture: the first writes every row, the
    // second recomputes identically and finds nothing left to change.
    expect(recomputeCallSizes).toEqual([5000, 1, 5000, 1])
    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: 'video-0' },
      data: { availableLanguages: ['529'] }
    })
    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: `video-${rowCount - 1}` },
      data: { availableLanguages: ['529'] }
    })
  })

  it('retries a video whose write exhausted its retries, instead of treating the unwritten value as already converged', async () => {
    // A batch that exhausts its retries never persists its intended value.
    // If the next pass's diff compared against that unwritten value, an
    // unchanged input would recompute the same value and be wrongly called
    // converged - leaking the never-written value forever. Fail every
    // transaction during the first recompute pass, then let it succeed:
    // a correct implementation must still retry on the next pass.
    vi.useFakeTimers()
    try {
      let recomputePasses = 0
      prismaMock.video.findMany.mockImplementation(
        (args: SeedVideoFindManyArgs = {}) => {
          if (!isRecomputeArgs(args)) {
            return asFindManyResult([{ id: 'flaky' }])
          }
          recomputePasses++
          return asFindManyResult([
            { id: 'flaky', variants: [{ languageId: '529' }], children: [] }
          ])
        }
      )
      prismaMock.$transaction.mockImplementation(() =>
        recomputePasses >= 2
          ? asTransactionResult([])
          : Promise.reject(new Error('transaction boom'))
      )
      const loggerErrorSpy = vi.spyOn(logger, 'error')

      const seeded = seedVideoLanguages()
      await vi.runAllTimersAsync()
      await seeded

      // Three recompute passes: one that fails to write, one that retries
      // and succeeds, and one final pass that finds nothing left to change.
      expect(recomputePasses).toBe(3)
      expect(loggerErrorSpy).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('hit MAX_PASSES')
      )
    } finally {
      vi.useRealTimers()
    }
  })
})
