import { prismaMock } from '../../../../test/prismaMock'

import {
  VerifyAvailableLanguagesCursor,
  computeAvailableLanguagesGraph,
  verifyAvailableLanguages
} from './verifyAvailableLanguages'

interface FixtureVideo {
  availableLanguages: string[]
  variantLanguageIds: string[]
  childIds: string[]
}

// Installs a small in-memory catalog that the verifier's mocked Prisma
// calls read from (and, in fix mode, write into), so its bottom-up
// level-by-level, paginated traversal is exercised against a realistic
// graph shape and query sequence rather than a hand-sequenced list of mock
// call results.
function installCatalog(
  videos: Record<string, FixtureVideo>
): Map<string, FixtureVideo> {
  const db = new Map(
    Object.entries(videos).map(([id, video]) => [id, { ...video }])
  )

  // Cast to `any`: these fixtures deliberately model only the columns each
  // query's own `select` asks for, which is narrower than prismaMock's deep
  // Video type.
  ;(prismaMock.video.findMany as any).mockImplementation(
    async (args: {
      where?: { id?: { in?: string[] } }
      orderBy?: { id: 'asc' }
      take?: number
      cursor?: { id: string }
      skip?: number
    }) => {
      const idFilter = args.where?.id?.in

      // The graph-shape query -- no `where`, id + live children ids only.
      if (idFilter == null) {
        return Array.from(db.entries()).map(([id, video]) => ({
          id,
          children: video.childIds
            .filter((childId) => db.has(childId))
            .map((childId) => ({ id: childId }))
        }))
      }

      // A per-level, paginated own-data query.
      let ids = idFilter.filter((id) => db.has(id)).sort()
      if (args.cursor != null) {
        const cursorIndex = ids.indexOf(args.cursor.id)
        ids = ids.slice(cursorIndex + (args.skip ?? 0))
      }
      if (args.take != null) ids = ids.slice(0, args.take)

      return ids.map((id) => {
        const video = db.get(id)!
        return {
          id,
          availableLanguages: video.availableLanguages,
          variants: video.variantLanguageIds.map((languageId) => ({
            languageId
          })),
          children: video.childIds
            .filter((childId) => db.has(childId))
            .map((childId) => ({
              availableLanguages: db.get(childId)!.availableLanguages
            }))
        }
      })
    }
  )
  ;(prismaMock.video.updateMany as any).mockImplementation(
    async (args: {
      where: {
        id: string
        availableLanguages?: { equals?: string[] }
      }
      data: { availableLanguages?: { set: string[] } }
    }) => {
      const video = db.get(args.where.id)
      const expectedStored = args.where.availableLanguages?.equals
      const stillMatches =
        video != null &&
        (expectedStored == null ||
          (video.availableLanguages.length === expectedStored.length &&
            video.availableLanguages.every(
              (languageId, index) => languageId === expectedStored[index]
            )))

      if (stillMatches && args.data.availableLanguages != null) {
        video!.availableLanguages = args.data.availableLanguages.set
        return { count: 1 }
      }
      return { count: 0 }
    }
  )

  return db
}

describe('verifyAvailableLanguages', () => {
  it('reports a mismatch between stored and computed values without writing', async () => {
    const db = installCatalog({
      child: {
        availableLanguages: ['529'],
        variantLanguageIds: ['529'],
        childIds: []
      },
      parent: {
        // stored value is stale -- it's missing the child's language
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['child']
      }
    })

    const result = await verifyAvailableLanguages()

    expect(result.mismatches).toEqual([
      { videoId: 'parent', stored: [], computed: ['529'] }
    ])
    expect(result.fixed).toEqual([])
    expect(result.unresolvedVideoIds).toEqual([])
    expect(result.nextCursor).toBeNull()
    // report-only mode must not write anything back
    expect(db.get('parent')?.availableLanguages).toEqual([])
    expect(prismaMock.video.updateMany).not.toHaveBeenCalled()
  })

  it('does not report a video whose stored value already matches the computed one', async () => {
    installCatalog({
      child: {
        availableLanguages: ['529'],
        variantLanguageIds: ['529'],
        childIds: []
      },
      parent: {
        availableLanguages: ['529'],
        variantLanguageIds: [],
        childIds: ['child']
      }
    })

    const result = await verifyAvailableLanguages()

    expect(result.mismatches).toEqual([])
    expect(result.checked).toBe(2)
    expect(result.nextCursor).toBeNull()
  })

  it('self-heals a mismatch by writing the computed value when fix is true', async () => {
    const db = installCatalog({
      child: {
        availableLanguages: ['529'],
        variantLanguageIds: ['529'],
        childIds: []
      },
      parent: {
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['child']
      }
    })

    const result = await verifyAvailableLanguages({ fix: true })

    expect(result.fixed).toEqual(['parent'])
    expect(db.get('parent')?.availableLanguages).toEqual(['529'])
  })

  it('propagates a corrected child value up through a multi-level hierarchy in one pass', async () => {
    const db = installCatalog({
      video: {
        availableLanguages: ['21028'],
        variantLanguageIds: ['21028'],
        childIds: []
      },
      series: {
        // stale at every level
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['video']
      },
      featureFilm: {
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['series']
      }
    })

    const result = await verifyAvailableLanguages({ fix: true })

    expect(result.fixed.sort()).toEqual(['featureFilm', 'series'])
    expect(db.get('series')?.availableLanguages).toEqual(['21028'])
    expect(db.get('featureFilm')?.availableLanguages).toEqual(['21028'])
  })

  it('excludes videos on a cycle from the walk instead of hanging, and reports them as unresolved', async () => {
    installCatalog({
      a: {
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['b']
      },
      b: {
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['a']
      },
      independent: {
        availableLanguages: ['529'],
        variantLanguageIds: ['529'],
        childIds: []
      }
    })

    const result = await verifyAvailableLanguages()

    expect(result.unresolvedVideoIds.sort()).toEqual(['a', 'b'])
    expect(result.checked).toBe(1)
    expect(result.nextCursor).toBeNull()
    expect(
      result.mismatches.find((mismatch) => mismatch.videoId === 'independent')
    ).toBeUndefined()
  })

  it('reports a video blocked by a descendant cycle as unresolved too', async () => {
    installCatalog({
      'cyclic-a': {
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['cyclic-b']
      },
      'cyclic-b': {
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['cyclic-a']
      },
      parent: {
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['cyclic-a']
      }
    })

    const result = await verifyAvailableLanguages()

    expect(result.unresolvedVideoIds.sort()).toEqual([
      'cyclic-a',
      'cyclic-b',
      'parent'
    ])
    expect(result.checked).toBe(0)
  })

  it('batches every video in a level into one query instead of one query per video', async () => {
    installCatalog({
      a: { availableLanguages: [], variantLanguageIds: ['1'], childIds: [] },
      b: { availableLanguages: [], variantLanguageIds: ['2'], childIds: [] },
      c: { availableLanguages: [], variantLanguageIds: ['3'], childIds: [] },
      parent: {
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['a', 'b', 'c']
      }
    })

    await verifyAvailableLanguages()

    // One call for the graph shape, plus one per level (leaves, then
    // parent) -- never one call per video.
    expect(prismaMock.video.findMany).toHaveBeenCalledTimes(3)
  })

  it('returns a resumable cursor when a level exceeds pageSize, and a follow-up call continues from it', async () => {
    installCatalog({
      a: { availableLanguages: ['1'], variantLanguageIds: ['1'], childIds: [] },
      b: { availableLanguages: [], variantLanguageIds: ['2'], childIds: [] },
      c: { availableLanguages: ['3'], variantLanguageIds: ['3'], childIds: [] }
    })

    const first = await verifyAvailableLanguages({ pageSize: 2 })

    expect(first.checked).toBe(2)
    expect(first.nextCursor).toEqual({ level: 0, afterId: 'b' })
    // Only the first two (a, b) were compared so far -- b is the one
    // seeded mismatch among them.
    expect(first.mismatches.map((m) => m.videoId)).toEqual(['b'])

    const second = await verifyAvailableLanguages({
      pageSize: 2,
      cursor: first.nextCursor as VerifyAvailableLanguagesCursor
    })

    expect(second.checked).toBe(1)
    expect(second.nextCursor).toBeNull()
    expect(second.mismatches).toEqual([])

    // Together, the two paginated calls found exactly the one seeded
    // mismatch a single unbounded call would have found.
    expect(first.mismatches.length + second.mismatches.length).toBe(1)
  })

  it('does not reprocess a video already covered by a previous page when resuming', async () => {
    installCatalog({
      a: { availableLanguages: ['1'], variantLanguageIds: ['1'], childIds: [] },
      b: { availableLanguages: ['2'], variantLanguageIds: ['2'], childIds: [] }
    })

    const first = await verifyAvailableLanguages({ pageSize: 1 })
    expect(first.nextCursor).toEqual({ level: 0, afterId: 'a' })
    ;(prismaMock.video.findMany as any).mockClear()

    const second = await verifyAvailableLanguages({
      pageSize: 1,
      cursor: first.nextCursor as VerifyAvailableLanguagesCursor
    })

    expect(second.checked).toBe(1)
    const ownDataCall = (prismaMock.video.findMany as any).mock.calls.find(
      (call: any[]) => call[0]?.where?.id?.in != null
    )
    expect(ownDataCall[0].cursor).toEqual({ id: 'a' })
    expect(ownDataCall[0].skip).toBe(1)
  })

  it('rejects a non-positive pageSize instead of looping forever with no progress', async () => {
    await expect(verifyAvailableLanguages({ pageSize: 0 })).rejects.toThrow(
      /pageSize must be a positive integer/
    )
    await expect(verifyAvailableLanguages({ pageSize: -5 })).rejects.toThrow(
      /pageSize must be a positive integer/
    )
  })

  it('reuses a precomputed graph instead of re-deriving it from the catalog', async () => {
    installCatalog({
      child: {
        availableLanguages: ['529'],
        variantLanguageIds: ['529'],
        childIds: []
      },
      parent: {
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['child']
      }
    })

    const graph = await computeAvailableLanguagesGraph()
    ;(prismaMock.video.findMany as any).mockClear()

    const result = await verifyAvailableLanguages({ graph })

    expect(result.mismatches).toEqual([
      { videoId: 'parent', stored: [], computed: ['529'] }
    ])
    // No graph-shape query (a findMany with no `where`) this time -- only
    // the per-level own-data queries.
    const graphShapeCalls = (
      prismaMock.video.findMany as any
    ).mock.calls.filter((call: any[]) => call[0]?.where?.id?.in == null)
    expect(graphShapeCalls).toEqual([])
  })

  it('does not overwrite a value changed by a concurrent write since it was read', async () => {
    const db = installCatalog({
      child: {
        availableLanguages: ['529'],
        variantLanguageIds: ['529'],
        childIds: []
      },
      parent: {
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['child']
      }
    })

    // Simulate a concurrent publish landing on `parent` between this
    // verifier's read and its guarded write: by the time the guarded
    // update runs, the row no longer holds the value the verifier read.
    ;(prismaMock.video.updateMany as any).mockImplementation(
      async (args: { where: { id: string } }) => {
        if (args.where.id === 'parent') {
          db.get('parent')!.availableLanguages = ['21028']
          return { count: 0 }
        }
        return { count: 1 }
      }
    )

    const result = await verifyAvailableLanguages({ fix: true })

    expect(result.mismatches).toEqual([
      { videoId: 'parent', stored: [], computed: ['529'] }
    ])
    // Not fixed -- the guarded update's WHERE no longer matched once the
    // concurrent write landed, so the correction was skipped rather than
    // clobbering it.
    expect(result.fixed).toEqual([])
    expect(db.get('parent')?.availableLanguages).toEqual(['21028'])
  })
})
