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

  // This path reads twice: findContainerParentIds for the id list, then the
  // batched recompute. Both arrive on video.findMany, told apart by whether
  // the select asked for variants.
  function mockParentCascadeQueries(parents: ContainerParentPayload[]): void {
    ;(prismaMock.video.findMany as any).mockImplementation(
      async ({ select }: { select?: Record<string, unknown> }) =>
        select?.variants == null
          ? (parents as unknown as Video[])
          : parents.map(({ id }) => ({
              id,
              label: 'collection',
              variants: [],
              children: [{ availableLanguages: ['529'] }]
            }))
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
})

describe('calculateAvailableLanguagesForVideos', () => {
  // Rows the single-video and batched entry points must both reduce the
  // same way: a container deriving from a child, and a leaf deriving from
  // its own published variants.
  const rows = [
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
    ;(prismaMock.video.findMany as any).mockResolvedValueOnce(rows)

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
    ;(prismaMock.video.findMany as any).mockResolvedValueOnce([rows[0]])
    ;(prismaMock.video.findUnique as any).mockResolvedValueOnce(rows[0])

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
