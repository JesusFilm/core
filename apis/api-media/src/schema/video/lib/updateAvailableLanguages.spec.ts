import { vi } from 'vitest'

import { Prisma, Video } from '@core/prisma/media/client'

import { prismaMock } from '../../../../test/prismaMock'
import { videoCacheReset } from '../../../lib/videoCacheReset'
import { enqueueVideoAlgoliaSync } from '../../../workers/videoAlgoliaSync'
import { logger } from '../../logger'

import {
  addLanguageToVideo,
  findContainerParentIds,
  sameLanguageSet,
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

vi.mock('../../logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() }
}))

const mockedEnqueueVideoAlgoliaSync = vi.mocked(enqueueVideoAlgoliaSync)
const mockedVideoCacheReset = vi.mocked(videoCacheReset)
const mockedLoggerError = vi.mocked(logger.error)

type AvailableLanguagesVideoPayload = Prisma.VideoGetPayload<{
  select: {
    label: true
    availableLanguages: true
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

// A small in-memory video graph, wired up as the backing store for
// video.findUnique/findMany/update, so cascade tests can exercise the real
// multi-hop walker (not a single mocked response) across several videos at
// once. `childIds` models the container's live children relation;
// `availableLanguages` models the currently-stored value, and is mutated in
// place whenever the walker writes a video, so a later read in the same
// test sees the just-written value - exactly like calling through real
// Prisma against a real row.
interface FixtureVideo {
  variants: string[]
  childIds: string[]
  availableLanguages: string[]
}

function buildFixtureGraph(
  initial: Record<string, FixtureVideo>
): Record<string, FixtureVideo> {
  const store: Record<string, FixtureVideo> = structuredClone(initial)

  ;(prismaMock.video.findUnique as any).mockImplementation((args: any) => {
    const video = store[args.where.id]
    if (video == null) return Promise.resolve(null)

    // calculateAvailableLanguages' single query asks for variants/children
    // (to compute the new value) and availableLanguages (the stored
    // "before" value) together, in one findUnique.
    return Promise.resolve({
      label: 'series',
      availableLanguages: video.availableLanguages,
      variants: video.variants.map((languageId) => ({ languageId })),
      children: video.childIds
        .filter((childId) => store[childId] != null)
        .map((childId) => ({
          availableLanguages: store[childId].availableLanguages
        }))
    } as unknown as Video)
  })
  ;(prismaMock.video.findMany as any).mockImplementation((args: any) => {
    const childId = args.where.children.some.id
    const parentIds = Object.keys(store).filter((id) =>
      store[id].childIds.includes(childId)
    )
    return Promise.resolve(
      parentIds.map((id) => ({ id })) as unknown as Video[]
    )
  })
  ;(prismaMock.video.update as any).mockImplementation((args: any) => {
    const video = store[args.where.id]
    if (video != null) {
      video.availableLanguages = args.data.availableLanguages.set
    }
    return Promise.resolve({} as unknown as Video)
  })

  return store
}

describe('updateVideoAvailableLanguages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCalculateAvailableLanguagesQuery({
      label: 'series',
      availableLanguages: [],
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

describe('updateParentCollectionLanguages', () => {
  it('enqueues an Algolia sync for every parent found', async () => {
    mockContainerParentQuery(containerParents)

    await updateParentCollectionLanguages('child-id')

    expect(mockedEnqueueVideoAlgoliaSync).toHaveBeenCalledWith(
      'parent-1',
      {
        syncVideoRecord: true,
        syncAllVariants: false,
        syncPublishedFlag: false,
        dirtyVariantIds: [],
        deletedVariantIds: []
      },
      expect.anything()
    )
    expect(mockedEnqueueVideoAlgoliaSync).toHaveBeenCalledWith(
      'parent-2',
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
})

describe('sameLanguageSet', () => {
  it('treats equal sets as the same regardless of order', () => {
    expect(sameLanguageSet(['529', '496'], ['496', '529'])).toBe(true)
  })

  it('treats different-length arrays as different', () => {
    expect(sameLanguageSet(['529'], ['529', '496'])).toBe(false)
  })

  it('treats same-length arrays with different members as different', () => {
    expect(sameLanguageSet(['529', '496'], ['529', '21754'])).toBe(false)
  })

  it('treats arrays as different when a duplicate makes their raw lengths equal but their sets differ', () => {
    expect(sameLanguageSet(['529', '496'], ['529', '529'])).toBe(false)
  })
})

describe('cascading availableLanguages upward to the root', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('updates the outermost container, not just the immediate parent, when a leaf changes', async () => {
    // leaf -> mid-level container -> outer container, three levels deep.
    // leaf's own availableLanguages has already picked up a new published
    // variant ('496') that mid/outer don't know about yet.
    const store = buildFixtureGraph({
      leaf: {
        variants: ['529', '496'],
        childIds: [],
        availableLanguages: ['529', '496']
      },
      mid: { variants: [], childIds: ['leaf'], availableLanguages: ['529'] },
      outer: { variants: [], childIds: ['mid'], availableLanguages: ['529'] }
    })

    await updateParentCollectionLanguages('leaf')

    expect(store.mid.availableLanguages.slice().sort()).toEqual(['496', '529'])
    expect(store.outer.availableLanguages.slice().sort()).toEqual([
      '496',
      '529'
    ])
    // Every level on the path actually got recomputed and written, not
    // just the immediate parent.
    expect(prismaMock.video.update).toHaveBeenCalledTimes(2)
    expect(mockedEnqueueVideoAlgoliaSync).toHaveBeenCalledWith(
      'outer',
      expect.anything(),
      expect.anything()
    )
  })

  it('terminates instead of hanging when a container is its own ancestor', async () => {
    // leaf -> A -> B -> A: A and B form a cycle above the leaf. A and B's
    // stored values start stale so every hop recomputes to a changed value,
    // forcing the walk to keep climbing until it revisits A and the guard
    // fires.
    const store = buildFixtureGraph({
      leaf: { variants: ['529'], childIds: [], availableLanguages: ['529'] },
      A: { variants: [], childIds: ['leaf', 'B'], availableLanguages: [] },
      B: { variants: [], childIds: ['A'], availableLanguages: [] }
    })

    await expect(
      updateParentCollectionLanguages('leaf')
    ).resolves.toBeUndefined()

    expect(store.A.availableLanguages).toEqual(['529'])
    expect(store.B.availableLanguages).toEqual(['529'])
    // A and B were each written exactly once - the cycle back to A was
    // detected and abandoned rather than recomputing forever.
    expect(prismaMock.video.update).toHaveBeenCalledTimes(2)
    expect(mockedLoggerError).toHaveBeenCalledWith(
      expect.objectContaining({ videoId: 'A' }),
      expect.stringContaining('Cycle detected')
    )
  })

  it('stops walking upward once a level recomputes to the same value it already had', async () => {
    // mid is already correct for leaf's current state, so recomputing it
    // changes nothing - outer must never even be queried.
    buildFixtureGraph({
      leaf: { variants: ['529'], childIds: [], availableLanguages: ['529'] },
      mid: { variants: [], childIds: ['leaf'], availableLanguages: ['529'] },
      outer: { variants: [], childIds: ['mid'], availableLanguages: ['529'] }
    })

    await updateParentCollectionLanguages('leaf')

    // One findMany for leaf's own parents; mid's parents are never looked up.
    expect(prismaMock.video.findMany).toHaveBeenCalledTimes(1)
    // mid is still recomputed and written once (we don't know it's
    // unaffected until after computing it) but outer never is.
    expect(prismaMock.video.update).toHaveBeenCalledTimes(1)
    expect(mockedEnqueueVideoAlgoliaSync).not.toHaveBeenCalledWith(
      'outer',
      expect.anything(),
      expect.anything()
    )
  })

  it('walks two independent parent branches to completion, each to its own further ancestor', async () => {
    // leaf has two direct parents, A and B, each with its own further
    // ancestor beyond it (A -> A_parent, B -> B_parent). Both branches must
    // be walked all the way to their respective root independently of one
    // another.
    const store = buildFixtureGraph({
      leaf: {
        variants: ['529', '496'],
        childIds: [],
        availableLanguages: ['529', '496']
      },
      A: { variants: [], childIds: ['leaf'], availableLanguages: ['529'] },
      A_parent: {
        variants: [],
        childIds: ['A'],
        availableLanguages: ['529']
      },
      B: { variants: [], childIds: ['leaf'], availableLanguages: ['529'] },
      B_parent: {
        variants: [],
        childIds: ['B'],
        availableLanguages: ['529']
      }
    })

    await updateParentCollectionLanguages('leaf')

    expect(store.A.availableLanguages.slice().sort()).toEqual(['496', '529'])
    expect(store.A_parent.availableLanguages.slice().sort()).toEqual([
      '496',
      '529'
    ])
    expect(store.B.availableLanguages.slice().sort()).toEqual(['496', '529'])
    expect(store.B_parent.availableLanguages.slice().sort()).toEqual([
      '496',
      '529'
    ])
    // A, A_parent, B, B_parent - every level on both branches got written.
    expect(prismaMock.video.update).toHaveBeenCalledTimes(4)
  })

  it('isolates a failure in one sibling branch so the other sibling still completes', async () => {
    // Two sibling parents of leaf, A and B. A's update fails; B's branch
    // must still run to completion rather than being aborted by A's error.
    const store = buildFixtureGraph({
      leaf: {
        variants: ['529', '496'],
        childIds: [],
        availableLanguages: ['529', '496']
      },
      A: { variants: [], childIds: ['leaf'], availableLanguages: ['529'] },
      B: { variants: [], childIds: ['leaf'], availableLanguages: ['529'] }
    })

    const storeBackedUpdate = (
      prismaMock.video.update as unknown as { getMockImplementation: any }
    ).getMockImplementation()

    ;(prismaMock.video.update as any).mockImplementation((args: any) => {
      if (args.where.id === 'A') {
        return Promise.reject(new Error('simulated update failure for A'))
      }
      return storeBackedUpdate(args)
    })

    await expect(
      updateParentCollectionLanguages('leaf')
    ).resolves.toBeUndefined()

    // A's failure was caught and logged rather than thrown out of the cascade.
    expect(mockedLoggerError).toHaveBeenCalledWith(
      expect.objectContaining({ videoId: 'A' }),
      expect.any(String)
    )
    // A was never actually written, since its update rejected.
    expect(store.A.availableLanguages).toEqual(['529'])
    // B's sibling branch still ran to completion, unaffected by A's failure.
    expect(store.B.availableLanguages.slice().sort()).toEqual(['496', '529'])
  })

  it('produces a correct final value at a shared grandparent visited via two diamond branches', async () => {
    // leaf's two direct parents, A and B, both list a shared grandparent C
    // as their own parent. C is not a cycle - it's visited once per branch
    // (via A, then via B) - but the cascade must terminate and C's final
    // availableLanguages must reflect the correct union after both branches
    // have run.
    const store = buildFixtureGraph({
      leaf: {
        variants: ['529', '496'],
        childIds: [],
        availableLanguages: ['529', '496']
      },
      A: { variants: [], childIds: ['leaf'], availableLanguages: ['529'] },
      B: { variants: [], childIds: ['leaf'], availableLanguages: ['529'] },
      C: {
        variants: [],
        childIds: ['A', 'B'],
        availableLanguages: ['529']
      }
    })

    await expect(
      updateParentCollectionLanguages('leaf')
    ).resolves.toBeUndefined()

    expect(store.C.availableLanguages.slice().sort()).toEqual(['496', '529'])

    // C is recomputed once per incoming branch (via A, then via B).
    const cUpdateCalls = prismaMock.video.update.mock.calls.filter(
      (call) => (call[0] as any).where.id === 'C'
    )
    expect(cUpdateCalls).toHaveLength(2)
  })
})

describe('calculateAvailableLanguages via a container with overlapping-language children', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('drops a language when the child that uniquely provided it is removed', async () => {
    const store = buildFixtureGraph({
      container: {
        variants: [],
        childIds: ['childA', 'childB'],
        availableLanguages: ['496', '529']
      },
      childA: { variants: [], childIds: [], availableLanguages: ['529'] },
      childB: { variants: [], childIds: [], availableLanguages: ['496', '529'] }
    })

    // childB, the only source of '496', is removed from the container.
    store.container.childIds = ['childA']

    const result = await updateVideoAvailableLanguages('container')

    expect(result.after).toEqual(['529'])
  })

  it('keeps a language still provided by the sibling that remains', async () => {
    const store = buildFixtureGraph({
      container: {
        variants: [],
        childIds: ['childA', 'childB'],
        availableLanguages: ['496', '529']
      },
      childA: { variants: [], childIds: [], availableLanguages: ['529'] },
      childB: { variants: [], childIds: [], availableLanguages: ['496', '529'] }
    })

    // childA, redundant for '529', is removed - childB still provides both.
    store.container.childIds = ['childB']

    const result = await updateVideoAvailableLanguages('container')

    expect(result.after.slice().sort()).toEqual(['496', '529'])
  })
})
