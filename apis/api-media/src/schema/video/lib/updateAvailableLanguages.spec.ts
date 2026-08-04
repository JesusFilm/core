import { vi } from 'vitest'

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

describe('updateVideoAvailableLanguages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.video.findUnique.mockResolvedValue({
      label: 'series',
      variants: [],
      children: []
    } as any)
    prismaMock.video.update.mockResolvedValue({} as any)
    mockedVideoCacheReset.mockResolvedValue(undefined)
  })

  it('enqueues a video-only Algolia sync by default', async () => {
    await updateVideoAvailableLanguages('video-id')

    expect(mockedEnqueueVideoAlgoliaSync).toHaveBeenCalledWith('video-id', {
      syncVideoRecord: true,
      syncAllVariants: false,
      syncPublishedFlag: false,
      dirtyVariantIds: [],
      deletedVariantIds: []
    })
  })

  it('does not enqueue an Algolia sync when skipAlgolia is set', async () => {
    await updateVideoAvailableLanguages('video-id', { skipAlgolia: true })

    expect(mockedEnqueueVideoAlgoliaSync).not.toHaveBeenCalled()
  })
})

describe('findContainerParentIds', () => {
  it('queries collection/series/featureFilm videos that list the child', async () => {
    prismaMock.video.findMany.mockResolvedValueOnce([
      { id: 'parent-1' },
      { id: 'parent-2' }
    ] as any)

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
    prismaMock.video.findMany.mockResolvedValueOnce([
      { id: 'parent-1' },
      { id: 'parent-2' }
    ] as any)

    await updateParentCollectionLanguages('child-id')

    expect(mockedEnqueueVideoAlgoliaSync).toHaveBeenCalledWith('parent-1', {
      syncVideoRecord: true,
      syncAllVariants: false,
      syncPublishedFlag: false,
      dirtyVariantIds: [],
      deletedVariantIds: []
    })
    expect(mockedEnqueueVideoAlgoliaSync).toHaveBeenCalledWith('parent-2', {
      syncVideoRecord: true,
      syncAllVariants: false,
      syncPublishedFlag: false,
      dirtyVariantIds: [],
      deletedVariantIds: []
    })
  })
})
