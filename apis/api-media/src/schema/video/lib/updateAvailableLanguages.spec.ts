import { vi } from 'vitest'

import { Prisma, Video } from '@core/prisma/media/client'

import { prismaMock } from '../../../../test/prismaMock'
import { videoCacheReset } from '../../../lib/videoCacheReset'
import { enqueueVideoAlgoliaSync } from '../../../workers/videoAlgoliaSync'

import {
  addLanguageToVideo,
  calculateAvailableLanguages,
  findContainerParentIds,
  recalculateAvailableLanguagesCascade,
  updateParentCollectionLanguages,
  updateVideoAvailableLanguages
} from './updateAvailableLanguages'

vi.mock('../../../workers/videoAlgoliaSync', () => ({
  enqueueVideoAlgoliaSync: vi.fn(),
  videoOnlyScope: {
    syncVideoRecord: true,
    syncAllVariants: false,
    syncPublishedFlag: false,
    dirtyVariantIds: [],
    deletedVariantIds: []
  }
}))

vi.mock('../../../lib/videoCacheReset', () => ({
  videoCacheReset: vi.fn()
}))

const mockedEnqueueVideoAlgoliaSync = vi.mocked(enqueueVideoAlgoliaSync)
const mockedVideoCacheReset = vi.mocked(videoCacheReset)

type AvailableLanguagesVideoPayload = Prisma.VideoGetPayload<{
  select: {
    variants: { select: { languageId: true } }
    children: { select: { availableLanguages: true } }
  }
}>

type ContainerParentPayload = Prisma.VideoGetPayload<{
  select: { id: true }
}>

// prismaMock is typed against the full Video model, but every function under
// test reads only the columns its own `select` asked for. These helpers take
// the selected-payload type — so a fixture that drifts from the `select` in
// updateAvailableLanguages.ts is a compile error — and confine the widening
// the deep mock's signature forces to one place per query.
function mockCalculateAvailableLanguagesQuery(
  video: AvailableLanguagesVideoPayload
): void {
  prismaMock.video.findUnique.mockResolvedValue(video as unknown as Video)
}

function mockContainerParentQuery(parents: ContainerParentPayload[]): void {
  prismaMock.video.findMany.mockResolvedValueOnce(parents as unknown as Video[])
}

const containerParents: ContainerParentPayload[] = [
  { id: 'parent-1' },
  { id: 'parent-2' }
]

describe('updateVideoAvailableLanguages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCalculateAvailableLanguagesQuery({
      variants: [],
      children: []
    })
    // updateVideoAvailableLanguages ignores the update() result
    prismaMock.video.update.mockResolvedValue({} as unknown as Video)
    mockedVideoCacheReset.mockResolvedValue(undefined)
  })

  it('enqueues a video-only Algolia sync by default', async () => {
    await updateVideoAvailableLanguages('video-id')

    expect(mockedEnqueueVideoAlgoliaSync).toHaveBeenCalledWith(
      'video-id',
      {
        syncVideoRecord: true,
        syncAllVariants: false,
        syncPublishedFlag: false,
        dirtyVariantIds: [],
        deletedVariantIds: []
      },
      expect.anything()
    )
  })

  it('does not enqueue an Algolia sync when skipAlgolia is set', async () => {
    await updateVideoAvailableLanguages('video-id', { skipAlgolia: true })

    expect(mockedEnqueueVideoAlgoliaSync).not.toHaveBeenCalled()
  })
})

describe('addLanguageToVideo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.$executeRaw.mockResolvedValue(1)
  })

  it('issues a single atomic conditional UPDATE instead of a read-then-write', async () => {
    await addLanguageToVideo('video-id', 'lang-1')

    // Regression guard for the lost-update race: two concurrent published
    // uploads for the same video must not read the same availableLanguages
    // snapshot and clobber each other's language. There must be no
    // separate read before the write.
    expect(prismaMock.video.findUnique).not.toHaveBeenCalled()
    expect(prismaMock.video.update).not.toHaveBeenCalled()
    expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)

    const [sqlParts, ...values] = prismaMock.$executeRaw.mock.calls[0] as [
      readonly string[],
      ...unknown[]
    ]
    const sql = sqlParts.join(' ')
    expect(sql).toContain('array_append')
    expect(sql).toContain('ANY')
    expect(values).toEqual(['lang-1', 'video-id', 'lang-1'])
  })

  it('does not clobber a language added by a concurrent call for the same video', async () => {
    // Each call is an independent atomic statement handled entirely by
    // Postgres — there is no shared client-side array read between the two
    // calls that a "last write wins" bug could stomp on.
    await Promise.all([
      addLanguageToVideo('video-id', 'lang-en'),
      addLanguageToVideo('video-id', 'lang-fr')
    ])

    expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(2)
    const calledLanguages = prismaMock.$executeRaw.mock.calls.map(
      (call) => (call as [readonly string[], ...unknown[]])[1]
    )
    expect(calledLanguages.sort()).toEqual(['lang-en', 'lang-fr'])
  })
})

describe('findContainerParentIds', () => {
  it('queries collection/series/featureFilm videos that list the child', async () => {
    mockContainerParentQuery(containerParents)

    const parentIds = await findContainerParentIds('child-id')

    expect(prismaMock.video.findMany).toHaveBeenCalledWith({
      where: {
        children: { some: { id: 'child-id' } },
        label: { in: ['collection', 'series', 'featureFilm'] }
      },
      select: { id: true }
    })
    expect(parentIds).toEqual(['parent-1', 'parent-2'])
  })
})

// A small in-memory fixture graph that the mocked Prisma calls read from and
// write into, so a cascade test can express "a three-level-deep hierarchy"
// declaratively instead of hand-sequencing individual mockResolvedValueOnce
// calls per recursion depth.
interface FixtureVideo {
  label: string
  availableLanguages: string[]
  variantLanguageIds: string[]
  childIds: string[]
}

function installVideoGraph(
  videos: Record<string, FixtureVideo>
): Map<string, FixtureVideo> {
  const db = new Map(
    Object.entries(videos).map(([id, video]) => [id, { ...video }])
  )

  // Cast to `any`: these fixtures deliberately model only the columns each
  // query's own `select` asks for, which is narrower than prismaMock's deep
  // Video type.
  ;(prismaMock.video.findUnique as any).mockImplementation(
    async ({ where }: { where: { id?: string } }) => {
      const id = where.id
      if (id == null) return null
      const video = db.get(id)
      if (video == null) return null

      return {
        availableLanguages: video.availableLanguages,
        variants: video.variantLanguageIds.map((languageId) => ({
          languageId
        })),
        children: video.childIds
          .map((childId) => db.get(childId))
          .filter((child): child is FixtureVideo => child != null)
          .map((child) => ({ availableLanguages: child.availableLanguages }))
      }
    }
  )
  ;(prismaMock.video.update as any).mockImplementation(
    async ({
      where,
      data
    }: {
      where: { id?: string }
      data: { availableLanguages?: { set: string[] } }
    }) => {
      const id = where.id
      const video = id != null ? db.get(id) : undefined
      if (video != null && data.availableLanguages != null) {
        video.availableLanguages = data.availableLanguages.set
      }
      return {}
    }
  )
  ;(prismaMock.video.findMany as any).mockImplementation(
    async ({
      where
    }: {
      where?: { children?: { some?: { id?: string } } }
    }) => {
      const childId = where?.children?.some?.id
      if (childId == null) return []

      return Array.from(db.entries())
        .filter(
          ([, video]) =>
            video.childIds.includes(childId) &&
            ['collection', 'series', 'featureFilm'].includes(video.label)
        )
        .map(([id]) => ({ id }))
    }
  )

  return db
}

describe('updateParentCollectionLanguages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedVideoCacheReset.mockResolvedValue(undefined)
  })

  it('enqueues an Algolia sync for every direct parent found', async () => {
    installVideoGraph({
      child: {
        label: 'video',
        availableLanguages: ['529'],
        variantLanguageIds: ['529'],
        childIds: []
      },
      'parent-1': {
        label: 'series',
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['child']
      },
      'parent-2': {
        label: 'series',
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['child']
      }
    })

    await updateParentCollectionLanguages('child')

    expect(mockedEnqueueVideoAlgoliaSync).toHaveBeenCalledWith(
      'parent-1',
      expect.objectContaining({ syncVideoRecord: true }),
      expect.anything()
    )
    expect(mockedEnqueueVideoAlgoliaSync).toHaveBeenCalledWith(
      'parent-2',
      expect.objectContaining({ syncVideoRecord: true }),
      expect.anything()
    )
  })

  it('cascades a language change to a three-level-deep container hierarchy (featureFilm -> series -> video)', async () => {
    // This is the regression test for the depth bug: the old cascade only
    // ever updated `series`, leaving `featureFilm` stale even though it
    // structurally depends on `series`, which depends on `video`.
    const db = installVideoGraph({
      video: {
        label: 'video',
        availableLanguages: [],
        variantLanguageIds: ['21028'], // newly added language
        childIds: []
      },
      series: {
        label: 'series',
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['video']
      },
      featureFilm: {
        label: 'featureFilm',
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['series']
      }
    })

    // `video`'s own value must already be up to date before the cascade
    // walks upward from it (mirrors real call sites: the triggering video's
    // own recompute always happens before updateParentCollectionLanguages).
    db.get('video')!.availableLanguages = ['21028']

    await updateParentCollectionLanguages('video')

    expect(db.get('series')?.availableLanguages).toEqual(['21028'])
    expect(db.get('featureFilm')?.availableLanguages).toEqual(['21028'])
  })

  it('stops walking a branch once a parent recomputes to the same value it already had', async () => {
    const db = installVideoGraph({
      video: {
        label: 'video',
        availableLanguages: ['529'],
        variantLanguageIds: ['529'],
        childIds: []
      },
      series: {
        // series already has 529 from a sibling child - video's own value
        // isn't changing, so series' recomputed value won't change either.
        label: 'series',
        availableLanguages: ['529'],
        variantLanguageIds: [],
        childIds: ['video', 'other-child']
      },
      'other-child': {
        label: 'video',
        availableLanguages: ['529'],
        variantLanguageIds: ['529'],
        childIds: []
      },
      featureFilm: {
        label: 'featureFilm',
        availableLanguages: ['529'],
        variantLanguageIds: [],
        childIds: ['series']
      }
    })

    await updateParentCollectionLanguages('video')

    // series was still recomputed and written (self-correcting by
    // construction) ...
    expect(db.get('series')?.availableLanguages).toEqual(['529'])
    // ... but since it didn't change, featureFilm was never touched.
    expect(prismaMock.video.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'featureFilm' } })
    )
  })

  it('removal is symmetric with addition: dropping the only child that provided a language removes it from the parent', async () => {
    const db = installVideoGraph({
      'child-a': {
        label: 'video',
        availableLanguages: ['529'],
        variantLanguageIds: ['529'],
        childIds: []
      },
      'child-b': {
        label: 'video',
        availableLanguages: ['21028'],
        variantLanguageIds: ['21028'],
        childIds: []
      },
      parent: {
        label: 'series',
        availableLanguages: ['529', '21028'],
        variantLanguageIds: [],
        childIds: ['child-a', 'child-b']
      }
    })

    // child-b no longer provides 21028 (e.g. its variant was unpublished);
    // its own recompute already happened and is reflected here.
    db.get('child-b')!.availableLanguages = []

    await updateParentCollectionLanguages('child-b')

    expect(db.get('parent')?.availableLanguages).toEqual(['529'])
  })

  it('leaves a shared language in place when only one of two providing children is removed', async () => {
    const db = installVideoGraph({
      'child-a': {
        label: 'video',
        availableLanguages: ['529'],
        variantLanguageIds: ['529'],
        childIds: []
      },
      'child-b': {
        label: 'video',
        availableLanguages: ['529'],
        variantLanguageIds: ['529'],
        childIds: []
      },
      parent: {
        label: 'series',
        availableLanguages: ['529'],
        variantLanguageIds: [],
        childIds: ['child-a', 'child-b']
      }
    })

    // child-b stops providing 529, but child-a still does.
    db.get('child-b')!.availableLanguages = []

    await updateParentCollectionLanguages('child-b')

    expect(db.get('parent')?.availableLanguages).toEqual(['529'])
  })

  it('resolves cleanly for a cyclic children/parents graph (a -> b -> a)', async () => {
    installVideoGraph({
      a: {
        label: 'series',
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['b']
      },
      b: {
        label: 'series',
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['a']
      }
    })

    await expect(updateParentCollectionLanguages('a')).resolves.toBeUndefined()
  })

  it('refuses to revisit a video already on the current traversal path', async () => {
    // A deliberately adversarial fixture that exercises the explicit
    // visited-path guard in isolation: findContainerParentIds keeps
    // reporting a two-node cycle (a -> b -> a), and every recompute is
    // rigged to report as "changed" (a fresh, ever-growing array each
    // call), so it is *only* the visited-path check - not the "stop when
    // the value stops changing" shortcut that terminates a normal,
    // monotonically-converging cascade - that stops this from recursing
    // forever.
    let counter = 0
    ;(prismaMock.video.findUnique as any).mockImplementation(async () => {
      counter += 1
      return {
        availableLanguages: [`lang-${counter}`],
        variants: [],
        children: []
      }
    })
    prismaMock.video.update.mockResolvedValue({} as unknown as Video)
    ;(prismaMock.video.findMany as any).mockImplementation(
      async ({
        where
      }: {
        where?: { children?: { some?: { id?: string } } }
      }) => {
        const childId = where?.children?.some?.id
        const parentId =
          childId === 'a' ? 'b' : childId === 'b' ? 'a' : undefined
        return parentId != null ? [{ id: parentId }] : []
      }
    )

    await expect(updateParentCollectionLanguages('a')).resolves.toBeUndefined()
  })
})

describe('recalculateAvailableLanguagesCascade', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedVideoCacheReset.mockResolvedValue(undefined)
  })

  it('recomputes the given video and cascades to its ancestors when the value changed', async () => {
    const db = installVideoGraph({
      video: {
        label: 'video',
        availableLanguages: [],
        variantLanguageIds: ['529'],
        childIds: []
      },
      series: {
        label: 'series',
        availableLanguages: [],
        variantLanguageIds: [],
        childIds: ['video']
      }
    })

    const result = await recalculateAvailableLanguagesCascade('video')

    expect(result).toEqual(['529'])
    expect(db.get('video')?.availableLanguages).toEqual(['529'])
    expect(db.get('series')?.availableLanguages).toEqual(['529'])
  })

  it('does not cascade when the recomputed value is unchanged', async () => {
    installVideoGraph({
      video: {
        label: 'video',
        availableLanguages: ['529'],
        variantLanguageIds: ['529'],
        childIds: []
      },
      series: {
        label: 'series',
        availableLanguages: ['529'],
        variantLanguageIds: [],
        childIds: ['video']
      }
    })

    await recalculateAvailableLanguagesCascade('video')

    expect(prismaMock.video.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'series' } })
    )
  })
})

describe('calculateAvailableLanguages', () => {
  it('unions own published variant languages with live children availableLanguages', async () => {
    installVideoGraph({
      parent: {
        label: 'series',
        availableLanguages: [],
        variantLanguageIds: ['529'],
        childIds: ['child']
      },
      child: {
        label: 'video',
        availableLanguages: ['21028'],
        variantLanguageIds: ['21028'],
        childIds: []
      }
    })

    const languages = await calculateAvailableLanguages('parent')

    expect(languages).toEqual(['529', '21028'])
  })

  it('returns an empty array for a video that no longer exists', async () => {
    prismaMock.video.findUnique.mockResolvedValueOnce(null)

    const languages = await calculateAvailableLanguages('missing')

    expect(languages).toEqual([])
  })
})
