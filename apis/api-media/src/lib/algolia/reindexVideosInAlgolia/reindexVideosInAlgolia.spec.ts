import { prismaMock } from '../../../../test/prismaMock'
import {
  enqueueVideoAlgoliaSync,
  videoOnlyScope
} from '../../../workers/videoAlgoliaSync'

import {
  assertValidReindexBatchSize,
  reindexVideosInAlgolia
} from './reindexVideosInAlgolia'

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

const mockedEnqueue = vi.mocked(enqueueVideoAlgoliaSync)

function videos(...ids: string[]): Array<{ id: string }> {
  return ids.map((id) => ({ id }))
}

describe('reindexVideosInAlgolia', () => {
  beforeEach(() => {
    mockedEnqueue.mockReset()
  })

  it('enqueues a video-record sync for every video, in id order across batches', async () => {
    prismaMock.video.findMany
      .mockResolvedValueOnce(videos('a', 'b') as never)
      .mockResolvedValueOnce(videos('c') as never)

    const result = await reindexVideosInAlgolia({ apply: true, batchSize: 2 })

    expect(result).toEqual({ scanned: 3, enqueued: 3, lastVideoId: 'c' })
    expect(mockedEnqueue.mock.calls.map(([id]) => id)).toEqual(['a', 'b', 'c'])
    for (const [, scope] of mockedEnqueue.mock.calls)
      expect(scope).toBe(videoOnlyScope)
    expect(prismaMock.video.findMany).toHaveBeenNthCalledWith(1, {
      where: { id: {} },
      select: { id: true },
      orderBy: { id: 'asc' },
      take: 2
    })
    expect(prismaMock.video.findMany).toHaveBeenNthCalledWith(2, {
      where: { id: { gt: 'b' } },
      select: { id: true },
      orderBy: { id: 'asc' },
      take: 2
    })
  })

  it('does not enqueue anything without apply', async () => {
    prismaMock.video.findMany.mockResolvedValueOnce(videos('a', 'b') as never)

    const result = await reindexVideosInAlgolia({ apply: false })

    expect(result).toEqual({ scanned: 2, enqueued: 0, lastVideoId: 'b' })
    expect(mockedEnqueue).not.toHaveBeenCalled()
  })

  it('stops when the first batch is empty', async () => {
    prismaMock.video.findMany.mockResolvedValueOnce([])

    const result = await reindexVideosInAlgolia({ apply: true })

    expect(result).toEqual({ scanned: 0, enqueued: 0, lastVideoId: null })
    expect(prismaMock.video.findMany).toHaveBeenCalledTimes(1)
  })

  it('resumes after the given video id', async () => {
    prismaMock.video.findMany.mockResolvedValueOnce(videos('m') as never)

    await reindexVideosInAlgolia({ apply: true, afterVideoId: 'k' })

    expect(prismaMock.video.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: { gt: 'k' } } })
    )
  })

  it('keeps the id filter when resuming a run limited to given ids', async () => {
    prismaMock.video.findMany.mockResolvedValueOnce(videos('m') as never)

    await reindexVideosInAlgolia({
      apply: true,
      videoIds: ['m', 'z'],
      afterVideoId: 'k'
    })

    expect(prismaMock.video.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: { in: ['m', 'z'], gt: 'k' } }
      })
    )
  })
})

describe('assertValidReindexBatchSize', () => {
  it.each([1, 200, 1000])('accepts %i', (size) => {
    expect(assertValidReindexBatchSize(size)).toBe(size)
  })

  it.each([0, -1, 1001, 1.5, Number.NaN])('rejects %s', (size) => {
    expect(() => assertValidReindexBatchSize(size)).toThrow(
      'Invalid batch size'
    )
  })
})
