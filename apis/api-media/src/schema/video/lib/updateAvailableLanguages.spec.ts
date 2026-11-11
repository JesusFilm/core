import { vi } from 'vitest'

import { Prisma, Video } from '@core/prisma/media/client'

import { prismaMock } from '../../../../test/prismaMock'
import { videoCacheReset } from '../../../lib/videoCacheReset'
import { enqueueVideoAlgoliaSync } from '../../../workers/videoAlgoliaSync'

import {
  addLanguageToVideo,
  calculateAvailableLanguages,
  calculateAvailableLanguagesForVideos,
  findContainerParentIds,
  removeLanguageFromVideoIfUnused,
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
    label: true
    variants: { select: { languageId: true } }
    children: { select: { availableLanguages: true } }
  }
}>

type BatchedAvailableLanguagesVideoPayload = Prisma.VideoGetPayload<{
  select: {
    id: true
    label: true
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

function mockBatchedAvailableLanguagesQuery(
  videos: BatchedAvailableLanguagesVideoPayload[]
): void {
  prismaMock.video.findMany.mockResolvedValueOnce(videos as unknown as Video[])
}

const containerParents: ContainerParentPayload[] = [
  { id: 'parent-1' },
  { id: 'parent-2' }
]

describe('updateVideoAvailableLanguages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCalculateAvailableLanguagesQuery({
      label: 'series',
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

describe('removeLanguageFromVideoIfUnused', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof prismaMock) => Promise<unknown>) =>
        await callback(prismaMock)
    )
    prismaMock.video.update.mockResolvedValue({} as Video)
  })

  it('removes the language when the video has no published Variant of its own in it', async () => {
    prismaMock.video.findUnique.mockResolvedValue({
      availableLanguages: ['529', '19372', '21028']
    } as unknown as Video)
    prismaMock.videoVariant.count.mockResolvedValue(0)

    await removeLanguageFromVideoIfUnused('video-id', '19372')

    expect(prismaMock.videoVariant.count).toHaveBeenCalledWith({
      where: { videoId: 'video-id', languageId: '19372', published: true }
    })
    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: 'video-id' },
      data: { availableLanguages: { set: ['529', '21028'] } }
    })
  })

  it('keeps the language when the video has a published Variant of its own in it', async () => {
    // A dubbed feature film is playable in a language without any segment in
    // it, so it must keep listing that language.
    prismaMock.video.findUnique.mockResolvedValue({
      availableLanguages: ['529', '19372']
    } as unknown as Video)
    prismaMock.videoVariant.count.mockResolvedValue(1)

    await removeLanguageFromVideoIfUnused('video-id', '19372')

    expect(prismaMock.video.update).not.toHaveBeenCalled()
  })

  it('does nothing when the video does not exist', async () => {
    prismaMock.video.findUnique.mockResolvedValue(null)

    await removeLanguageFromVideoIfUnused('video-id', '19372')

    expect(prismaMock.videoVariant.count).not.toHaveBeenCalled()
    expect(prismaMock.video.update).not.toHaveBeenCalled()
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
  const videoOnlySyncScope = {
    syncVideoRecord: true,
    syncAllVariants: false,
    syncPublishedFlag: false,
    dirtyVariantIds: [],
    deletedVariantIds: []
  }

  // This path reads twice, in order: findContainerParentIds for the id
  // list, then the batched recompute. Queuing two `Once` values keeps each
  // call typed as a plain Video[] resolution rather than needing a
  // `mockImplementation` callback (whose return type Prisma's mock typing
  // demands be a PrismaPromise, not a plain Promise). None of these parents
  // contain each other here, so childIds is empty and every parent resolves
  // from the batched snapshot alone — see the dedicated diamond-dependency
  // test below for the case where childIds is non-empty.
  function mockParentCascadeQueries(parents: ContainerParentPayload[]): void {
    prismaMock.video.findMany.mockResolvedValueOnce(
      parents as unknown as Video[]
    )
    prismaMock.video.findMany.mockResolvedValueOnce(
      parents.map(({ id }) => ({
        id,
        label: 'collection',
        childIds: [],
        variants: [],
        children: [{ availableLanguages: ['529'] }]
      })) as unknown as Video[]
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.video.update.mockResolvedValue({} as unknown as Video)
    mockedVideoCacheReset.mockResolvedValue(undefined)
  })

  it('enqueues an Algolia sync for every parent found', async () => {
    mockParentCascadeQueries(containerParents)

    await updateParentCollectionLanguages('child-id')

    expect(mockedEnqueueVideoAlgoliaSync).toHaveBeenCalledWith(
      'parent-1',
      videoOnlySyncScope,
      expect.anything()
    )
    expect(mockedEnqueueVideoAlgoliaSync).toHaveBeenCalledWith(
      'parent-2',
      videoOnlySyncScope,
      expect.anything()
    )
  })

  it('writes each parent the languages the batched lookup resolved', async () => {
    mockParentCascadeQueries(containerParents)

    await updateParentCollectionLanguages('child-id')

    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: 'parent-1' },
      data: { availableLanguages: { set: ['529'] } }
    })
    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: 'parent-2' },
      data: { availableLanguages: { set: ['529'] } }
    })
  })

  it('issues a bounded number of read queries no matter how many parents', async () => {
    // A per-parent recompute made reads grow with the container count. The
    // batched lookup keeps them at two: the id scan and the recompute.
    const readsByParentCount = new Map<number, number>()

    for (const parentCount of [1, 5, 25]) {
      vi.clearAllMocks()
      mockParentCascadeQueries(
        Array.from({ length: parentCount }, (_, index) => ({
          id: `parent-${index}`
        }))
      )

      await updateParentCollectionLanguages('child-id')

      readsByParentCount.set(
        parentCount,
        prismaMock.video.findMany.mock.calls.length +
          prismaMock.video.findUnique.mock.calls.length
      )
      // the write side stays per-parent on purpose
      expect(prismaMock.video.update).toHaveBeenCalledTimes(parentCount)
    }

    expect([...readsByParentCount.values()]).toEqual([2, 2, 2])
    expect(prismaMock.video.findUnique).not.toHaveBeenCalled()
  })

  it('does not query for languages when the video has no container parents', async () => {
    mockParentCascadeQueries([])

    await updateParentCollectionLanguages('orphan-id')

    expect(prismaMock.video.findMany).toHaveBeenCalledTimes(1)
    expect(prismaMock.video.update).not.toHaveBeenCalled()
  })

  it('re-derives a parent that itself contains another parent in the same batch', async () => {
    // Diamond shape: child-id sits directly inside both parent-1 and
    // parent-2, and parent-2 also directly contains parent-1 (e.g. a clip
    // in both a series and the collection that contains that series). The
    // batched snapshot below freezes parent-1's pre-update languages
    // ('old-lang') into parent-2's children — if parent-2 just wrote that
    // snapshot value, it would silently keep a language parent-1 no longer
    // has. parent-2 must instead be written after parent-1 and re-derived
    // from a fresh read picking up parent-1's new value.
    prismaMock.video.findMany.mockResolvedValueOnce(
      containerParents as unknown as Video[]
    )
    prismaMock.video.findMany.mockResolvedValueOnce([
      {
        id: 'parent-1',
        label: 'collection',
        childIds: [],
        variants: [],
        children: [{ availableLanguages: ['529'] }]
      },
      {
        id: 'parent-2',
        label: 'collection',
        childIds: ['parent-1'],
        variants: [],
        children: [{ availableLanguages: ['old-lang'] }]
      }
    ] as unknown as Video[])
    // The fresh read for parent-2 happens after parent-1 is written, so it
    // reflects parent-1's new, not snapshot, languages.
    prismaMock.video.findUnique.mockResolvedValueOnce({
      label: 'collection',
      variants: [],
      children: [{ availableLanguages: ['529'] }]
    } as unknown as Video)

    await updateParentCollectionLanguages('child-id')

    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: 'parent-1' },
      data: { availableLanguages: { set: ['529'] } }
    })
    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: 'parent-2' },
      data: { availableLanguages: { set: ['529'] } }
    })

    const updateOrder = prismaMock.video.update.mock.calls.map(
      ([{ where }]) => where.id
    )
    expect(updateOrder).toEqual(['parent-1', 'parent-2'])
    expect(prismaMock.video.findUnique).toHaveBeenCalledTimes(1)
    expect(prismaMock.video.findUnique).toHaveBeenCalledWith({
      where: { id: 'parent-2' },
      select: expect.objectContaining({ variants: expect.anything() })
    })
  })
})

describe('calculateAvailableLanguagesForVideos', () => {
  // Rows the single-video and batched entry points must both reduce the
  // same way: a container deriving from a child, and a leaf deriving from
  // its own published variants.
  const rows: BatchedAvailableLanguagesVideoPayload[] = [
    {
      id: 'container',
      label: 'series',
      variants: [],
      children: [{ availableLanguages: ['529', '496'] }]
    },
    {
      id: 'leaf',
      label: 'episode',
      variants: [{ languageId: '496' }, { languageId: '21754' }],
      children: []
    }
  ]

  it('resolves the whole set with a single query', async () => {
    mockBatchedAvailableLanguagesQuery(rows)

    const result = await calculateAvailableLanguagesForVideos([
      'container',
      'leaf'
    ])

    expect(prismaMock.video.findMany).toHaveBeenCalledTimes(1)
    expect(prismaMock.video.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['container', 'leaf'] } }
      })
    )
    expect(result.get('container')).toEqual(['496', '529'])
    expect(result.get('leaf')).toEqual(['496', '21754'])
  })

  it('agrees with calculateAvailableLanguages for the same row', async () => {
    // Guards the one-code-path goal: if the two entry points ever diverge,
    // the batched seed and the per-video write paths would disagree.
    mockBatchedAvailableLanguagesQuery([rows[0]])
    mockCalculateAvailableLanguagesQuery(rows[0])

    const batched = await calculateAvailableLanguagesForVideos(['container'])

    expect(batched.get('container')).toEqual(
      await calculateAvailableLanguages('container')
    )
  })

  it('queries nothing for an empty id set', async () => {
    const result = await calculateAvailableLanguagesForVideos([])

    expect(result.size).toBe(0)
    expect(prismaMock.video.findMany).not.toHaveBeenCalled()
  })
})
