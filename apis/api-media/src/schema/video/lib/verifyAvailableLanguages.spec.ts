import { prismaMock } from '../../../../test/prismaMock'

import { verifyAvailableLanguages } from './verifyAvailableLanguages'

interface FixtureVideo {
  availableLanguages: string[]
  variantLanguageIds: string[]
  childIds: string[]
}

// Installs a small in-memory catalog that the verifier's mocked Prisma calls
// read from (and, in fix mode, write into), so its bottom-up level-by-level
// traversal can be exercised against a realistic graph shape rather than a
// hand-sequenced list of mock call results.
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
      select?: { children?: unknown }
    }) => {
      const ids = args.where?.id?.in

      // The graph-shape query (no `where`) - fetch every video's live
      // children ids.
      if (ids == null) {
        return Array.from(db.entries()).map(([id, video]) => ({
          id,
          children: video.childIds
            .filter((childId) => db.has(childId))
            .map((childId) => ({ id: childId }))
        }))
      }

      // A per-level own-data query.
      return ids
        .filter((id) => db.has(id))
        .map((id) => {
          const video = db.get(id)!
          return {
            id,
            availableLanguages: video.availableLanguages,
            variants: video.variantLanguageIds.map((languageId) => ({
              languageId
            }))
          }
        })
    }
  )
  ;(prismaMock.video.update as any).mockImplementation(
    async (args: {
      where: { id: string }
      data: { availableLanguages?: { set: string[] } }
    }) => {
      const video = db.get(args.where.id)
      if (video != null && args.data.availableLanguages != null) {
        video.availableLanguages = args.data.availableLanguages.set
      }
      return {}
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
        // stored value is stale - it's missing the child's language
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
    expect(result.cycleVideoIds).toEqual([])
    // report-only mode must not write anything back
    expect(db.get('parent')?.availableLanguages).toEqual([])
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

  it('excludes videos on a cycle from the walk instead of hanging, and reports them separately', async () => {
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

    expect(result.cycleVideoIds.sort()).toEqual(['a', 'b'])
    expect(result.checked).toBe(1)
    expect(
      result.mismatches.find((mismatch) => mismatch.videoId === 'independent')
    ).toBeUndefined()
  })
})
