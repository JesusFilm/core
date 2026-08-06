import { vi } from 'vitest'

import { Prisma, Video } from '@core/prisma/media/client'

import { prismaMock } from '../../../../test/prismaMock'
import { videoCacheReset } from '../../../lib/videoCacheReset'
import { enqueueVideoAlgoliaSync } from '../../../workers/videoAlgoliaSync'

import {
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
