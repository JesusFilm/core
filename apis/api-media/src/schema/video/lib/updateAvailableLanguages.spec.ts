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

describe('updateVideoAvailableLanguages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.video.findUnique.mockResolvedValue({
      label: 'series',
      variants: [],
      children: []
    } as AvailableLanguagesVideoPayload as unknown as Video)
    prismaMock.video.update.mockResolvedValue({} as any)
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
    prismaMock.video.findMany.mockResolvedValueOnce([
      { id: 'parent-1' },
      { id: 'parent-2' }
    ] as ContainerParentPayload[] as unknown as Video[])

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
    ] as ContainerParentPayload[] as unknown as Video[])

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
