import { Job } from 'bullmq'
import { Logger } from 'pino'
import { vi } from 'vitest'

import { Video, VideoVariant } from '@core/prisma/media/client'

import { prismaMock } from '../../../../test/prismaMock'
import {
  updateVideoInAlgolia,
  updateVideoPublishedStatus
} from '../../../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../../../lib/algolia/algoliaVideoVariantUpdate'
import { VideoAlgoliaSyncJobData } from '../types'

import { service } from './service'

vi.mock('../../../lib/algolia/algoliaVideoUpdate', () => ({
  updateVideoInAlgolia: vi.fn(),
  updateVideoPublishedStatus: vi.fn()
}))

vi.mock('../../../lib/algolia/algoliaVideoVariantUpdate', () => ({
  updateVideoVariantInAlgolia: vi.fn()
}))

const mockedUpdateVideoInAlgolia = vi.mocked(updateVideoInAlgolia)
const mockedUpdateVideoPublishedStatus = vi.mocked(updateVideoPublishedStatus)
const mockedUpdateVideoVariantInAlgolia = vi.mocked(updateVideoVariantInAlgolia)

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
} as unknown as Logger

function buildJob(
  scope: Partial<VideoAlgoliaSyncJobData['scope']>
): Job<VideoAlgoliaSyncJobData> {
  return {
    data: {
      videoId: 'video-id',
      scope: {
        syncVideoRecord: false,
        syncAllVariants: false,
        syncPublishedFlag: false,
        dirtyVariantIds: [],
        deletedVariantIds: [],
        ...scope
      }
    }
  } as Job<VideoAlgoliaSyncJobData>
}

describe('videoAlgoliaSync service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUpdateVideoInAlgolia.mockResolvedValue(undefined)
    mockedUpdateVideoPublishedStatus.mockResolvedValue(undefined)
    mockedUpdateVideoVariantInAlgolia.mockResolvedValue(true)
  })

  it('re-indexes the video record when syncVideoRecord is set', async () => {
    await service(buildJob({ syncVideoRecord: true }), mockLogger)

    expect(mockedUpdateVideoInAlgolia).toHaveBeenCalledWith(
      'video-id',
      mockLogger
    )
  })

  it('always processes deletedVariantIds regardless of other scope flags', async () => {
    prismaMock.videoVariant.findMany.mockResolvedValueOnce([])

    await service(
      buildJob({ syncAllVariants: true, deletedVariantIds: ['deleted-1'] }),
      mockLogger
    )

    expect(mockedUpdateVideoVariantInAlgolia).toHaveBeenCalledWith(
      'deleted-1',
      mockLogger
    )
  })

  it('re-indexes every current variant when syncAllVariants is set, superseding narrower flags', async () => {
    prismaMock.videoVariant.findMany.mockResolvedValueOnce([
      { id: 'variant-1' },
      { id: 'variant-2' }
    ] as unknown as VideoVariant[])

    await service(
      buildJob({
        syncAllVariants: true,
        syncPublishedFlag: true,
        dirtyVariantIds: ['should-be-ignored']
      }),
      mockLogger
    )

    expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
      where: { videoId: 'video-id' },
      select: { id: true }
    })
    expect(mockedUpdateVideoVariantInAlgolia).toHaveBeenCalledWith(
      'variant-1',
      mockLogger
    )
    expect(mockedUpdateVideoVariantInAlgolia).toHaveBeenCalledWith(
      'variant-2',
      mockLogger
    )
    expect(mockedUpdateVideoVariantInAlgolia).not.toHaveBeenCalledWith(
      'should-be-ignored',
      mockLogger
    )
    // syncAllVariants supersedes the batched published-flag update
    expect(mockedUpdateVideoPublishedStatus).not.toHaveBeenCalled()
  })

  it('re-derives published status from the DB (not the job payload) for syncPublishedFlag', async () => {
    prismaMock.video.findUnique.mockResolvedValueOnce({
      published: true
    } as unknown as Video)

    await service(buildJob({ syncPublishedFlag: true }), mockLogger)

    expect(prismaMock.video.findUnique).toHaveBeenCalledWith({
      where: { id: 'video-id' },
      select: { published: true }
    })
    expect(mockedUpdateVideoPublishedStatus).toHaveBeenCalledWith(
      'video-id',
      true,
      mockLogger
    )
  })

  it('re-indexes dirtyVariantIds when syncAllVariants is not set', async () => {
    await service(
      buildJob({ dirtyVariantIds: ['dirty-1', 'dirty-2'] }),
      mockLogger
    )

    expect(mockedUpdateVideoVariantInAlgolia).toHaveBeenCalledWith(
      'dirty-1',
      mockLogger
    )
    expect(mockedUpdateVideoVariantInAlgolia).toHaveBeenCalledWith(
      'dirty-2',
      mockLogger
    )
  })

  it('propagates an Algolia failure so BullMQ retries the job', async () => {
    mockedUpdateVideoInAlgolia.mockRejectedValueOnce(
      new Error('Algolia unavailable')
    )

    await expect(
      service(buildJob({ syncVideoRecord: true }), mockLogger)
    ).rejects.toThrow('Algolia unavailable')
  })
})
