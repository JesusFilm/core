import { Mock, beforeEach, describe, expect, it, vi } from 'vitest'

import { prismaMock } from '../../test/prismaMock'
import { videoCacheReset, videoVariantCacheReset } from '../lib/videoCacheReset'

import { fixUnderscoreVideoSlugs } from './fix-underscore-video-slugs'

vi.mock('../lib/videoCacheReset', () => ({
  videoCacheReset: vi.fn(),
  videoVariantCacheReset: vi.fn()
}))

const mockedVideoCacheReset = videoCacheReset as unknown as Mock
const mockedVideoVariantCacheReset = videoVariantCacheReset as unknown as Mock

describe('fixUnderscoreVideoSlugs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renames every listed video and its variants that still carry the old slug prefix', async () => {
    prismaMock.video.findUnique.mockResolvedValue({
      slug: 'Know_God_1_Created',
      variants: [
        { id: '529_7_KnowGod0401', slug: 'Know_God_1_Created/english' },
        { id: '3934_7_KnowGod0401', slug: 'Know_God_1_Created/russian' }
      ]
    } as never)

    const results = await fixUnderscoreVideoSlugs()

    expect(results).toHaveLength(11)
    const knowGod1 = results.find((r) => r.videoId === '7_KnowGod0401')
    expect(knowGod1).toEqual({
      videoId: '7_KnowGod0401',
      videoUpdated: true,
      variantIdsUpdated: ['529_7_KnowGod0401', '3934_7_KnowGod0401']
    })
    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: '7_KnowGod0401' },
      data: { slug: 'know-god-episode-1-created' }
    })
    expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
      where: { id: '529_7_KnowGod0401' },
      data: { slug: 'know-god-episode-1-created/english' }
    })
    expect(mockedVideoCacheReset).toHaveBeenCalledWith('7_KnowGod0401')
    expect(mockedVideoVariantCacheReset).toHaveBeenCalledWith(
      '529_7_KnowGod0401'
    )
  })

  it('is a no-op for any video whose slug has already been fixed', async () => {
    prismaMock.video.findUnique.mockResolvedValue({
      slug: 'rescue',
      variants: [{ id: 'some-variant', slug: 'rescue/english' }]
    } as never)

    const results = await fixUnderscoreVideoSlugs()

    expect(results.every((r) => !r.videoUpdated)).toBe(true)
    expect(results.every((r) => r.variantIdsUpdated.length === 0)).toBe(true)
    expect(prismaMock.video.update).not.toHaveBeenCalled()
    expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
    expect(mockedVideoCacheReset).not.toHaveBeenCalled()
    expect(mockedVideoVariantCacheReset).not.toHaveBeenCalled()
  })

  it('does not touch a variant slug belonging to a different prefix', async () => {
    prismaMock.video.findUnique.mockResolvedValue({
      slug: 'Know_God_1_Created',
      variants: [
        { id: '529_7_KnowGod0401', slug: 'Know_God_1_Created/english' },
        { id: 'other-variant', slug: 'some-other-video/english' }
      ]
    } as never)

    const results = await fixUnderscoreVideoSlugs()

    const knowGod1 = results.find((r) => r.videoId === '7_KnowGod0401')
    expect(knowGod1?.variantIdsUpdated).toEqual(['529_7_KnowGod0401'])
  })

  it('skips a video that does not exist in this database instead of throwing', async () => {
    prismaMock.video.findUnique.mockResolvedValue(null)

    const results = await fixUnderscoreVideoSlugs()

    expect(results.every((r) => r.videoNotFound === true)).toBe(true)
    expect(results.every((r) => !r.videoUpdated)).toBe(true)
    expect(prismaMock.video.update).not.toHaveBeenCalled()
    expect(mockedVideoCacheReset).not.toHaveBeenCalled()
  })
})
