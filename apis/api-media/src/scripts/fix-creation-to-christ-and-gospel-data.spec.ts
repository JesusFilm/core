import { vi } from 'vitest'

import { prismaMock } from '../../test/prismaMock'
import { videoCacheReset, videoVariantCacheReset } from '../lib/videoCacheReset'
import { enqueueVideoAlgoliaSync } from '../workers/videoAlgoliaSync'

import {
  CREATION_TO_CHRIST_VIDEO_ID,
  GOSPEL_VIDEO_ID,
  buildPlan,
  run
} from './fix-creation-to-christ-and-gospel-data'

vi.mock('../lib/videoCacheReset', () => ({
  videoCacheReset: vi.fn().mockResolvedValue(undefined),
  videoVariantCacheReset: vi.fn().mockResolvedValue(undefined)
}))
vi.mock('../workers/videoAlgoliaSync', () => ({
  enqueueVideoAlgoliaSync: vi.fn().mockResolvedValue(undefined)
}))
vi.mock('../workers/videoAlgoliaSync/queue', () => ({
  queue: { close: vi.fn() }
}))

const okVariants = [{ id: '529_9_CreationtoChristFull', downloadable: false }]
const okGospel = { label: 'series', childIds: [], childCount: 0 }

describe('buildPlan', () => {
  it('plans both changes when the expected values are present', () => {
    expect(buildPlan(okVariants, okGospel)).toEqual({
      plan: {
        variant: {
          id: '529_9_CreationtoChristFull',
          before: false,
          after: true
        },
        gospel: { before: 'series', after: 'episode' }
      }
    })
  })

  it('refuses when the variant is already downloadable', () => {
    const result = buildPlan([{ id: 'v', downloadable: true }], okGospel) as {
      problems: string[]
    }
    expect(result.problems[0]).toContain('expected false')
  })

  it('refuses when there is not exactly one English variant', () => {
    expect(buildPlan([], okGospel)).toHaveProperty('problems')
    expect(
      buildPlan(
        [
          { id: 'a', downloadable: false },
          { id: 'b', downloadable: false }
        ],
        okGospel
      )
    ).toHaveProperty('problems')
  })

  it('refuses when the label is not series', () => {
    const result = buildPlan(okVariants, {
      ...okGospel,
      label: 'episode'
    }) as { problems: string[] }
    expect(result.problems[0]).toContain('expected series')
  })

  it.each([
    { childIds: ['x'], childCount: 0 },
    { childIds: [], childCount: 1 }
  ])('refuses when the video has children %o', (children) => {
    const result = buildPlan(okVariants, { ...okGospel, ...children }) as {
      problems: string[]
    }
    expect(result.problems[0]).toContain('has children')
  })

  it('refuses when the video is missing', () => {
    expect(buildPlan(okVariants, null)).toHaveProperty('problems')
  })
})

describe('run', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.videoVariant.findMany.mockResolvedValue(okVariants as never)
    prismaMock.video.findUnique.mockResolvedValue({
      label: 'series',
      childIds: [],
      _count: { children: 0 }
    } as never)
    prismaMock.$transaction.mockImplementation(
      async (fn: any) => await fn(prismaMock)
    )
    prismaMock.videoVariant.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.video.updateMany.mockResolvedValue({ count: 1 })
  })

  it('writes and syncs nothing in dry-run mode', async () => {
    await expect(run(false)).resolves.toBe(0)

    expect(prismaMock.$transaction).not.toHaveBeenCalled()
    expect(prismaMock.videoVariant.updateMany).not.toHaveBeenCalled()
    expect(prismaMock.video.updateMany).not.toHaveBeenCalled()
    expect(enqueueVideoAlgoliaSync).not.toHaveBeenCalled()
  })

  it('writes nothing when a precondition fails, even with --apply', async () => {
    prismaMock.video.findUnique.mockResolvedValue({
      label: 'series',
      childIds: ['child'],
      _count: { children: 1 }
    } as never)

    await expect(run(true)).resolves.toBe(1)

    expect(prismaMock.$transaction).not.toHaveBeenCalled()
    expect(enqueueVideoAlgoliaSync).not.toHaveBeenCalled()
  })

  it('applies guarded updates and triggers the Algolia and cache sync', async () => {
    await expect(run(true)).resolves.toBe(0)

    expect(prismaMock.videoVariant.updateMany).toHaveBeenCalledWith({
      where: { id: '529_9_CreationtoChristFull', downloadable: false },
      data: { downloadable: true }
    })
    expect(prismaMock.video.updateMany).toHaveBeenCalledWith({
      where: {
        id: GOSPEL_VIDEO_ID,
        label: 'series',
        childIds: { isEmpty: true },
        children: { none: {} }
      },
      data: { label: 'episode' }
    })
    expect(enqueueVideoAlgoliaSync).toHaveBeenCalledWith(
      CREATION_TO_CHRIST_VIDEO_ID,
      expect.objectContaining({
        syncVideoRecord: true,
        syncAllVariants: false,
        dirtyVariantIds: ['529_9_CreationtoChristFull']
      }),
      expect.anything()
    )
    expect(enqueueVideoAlgoliaSync).toHaveBeenCalledWith(
      GOSPEL_VIDEO_ID,
      expect.objectContaining({
        syncVideoRecord: true,
        syncAllVariants: true
      }),
      expect.anything()
    )
    expect(videoVariantCacheReset).toHaveBeenCalledWith(
      '529_9_CreationtoChristFull'
    )
    expect(videoCacheReset).toHaveBeenCalledWith(CREATION_TO_CHRIST_VIDEO_ID)
    expect(videoCacheReset).toHaveBeenCalledWith(GOSPEL_VIDEO_ID)
  })

  it('does not sync when the guarded write matches nothing', async () => {
    prismaMock.videoVariant.updateMany.mockResolvedValue({ count: 0 })

    await expect(run(true)).rejects.toThrow('nothing written')

    expect(enqueueVideoAlgoliaSync).not.toHaveBeenCalled()
  })
})
