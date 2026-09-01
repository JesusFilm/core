import { Mock, beforeEach, describe, expect, it, vi } from 'vitest'

import { prismaMock } from '../../test/prismaMock'
import { videoCacheReset, videoVariantCacheReset } from '../lib/videoCacheReset'

import { fixKnowGodSlug } from './fix-know-god-slug'

vi.mock('../lib/videoCacheReset', () => ({
  videoCacheReset: vi.fn(),
  videoVariantCacheReset: vi.fn()
}))

const mockedVideoCacheReset = videoCacheReset as unknown as Mock
const mockedVideoVariantCacheReset = videoVariantCacheReset as unknown as Mock

describe('fixKnowGodSlug', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renames the video slug and every variant slug that still uses the old prefix', async () => {
    prismaMock.video.findUniqueOrThrow.mockResolvedValue({
      slug: 'Nua_Know_God',
      variants: [
        { id: '529_7_KnowGod', slug: 'Nua_Know_God/english' },
        { id: '3934_7_KnowGod', slug: 'Nua_Know_God/russian' }
      ]
    } as never)

    const result = await fixKnowGodSlug()

    expect(result).toEqual({
      videoUpdated: true,
      variantIdsUpdated: ['529_7_KnowGod', '3934_7_KnowGod']
    })
    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: '7_KnowGod' },
      data: { slug: 'know-god' }
    })
    expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
      where: { id: '529_7_KnowGod' },
      data: { slug: 'know-god/english' }
    })
    expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
      where: { id: '3934_7_KnowGod' },
      data: { slug: 'know-god/russian' }
    })
    expect(mockedVideoCacheReset).toHaveBeenCalledWith('7_KnowGod')
    expect(mockedVideoVariantCacheReset).toHaveBeenCalledWith('529_7_KnowGod')
    expect(mockedVideoVariantCacheReset).toHaveBeenCalledWith('3934_7_KnowGod')
  })

  it('is a no-op when the slug has already been fixed', async () => {
    prismaMock.video.findUniqueOrThrow.mockResolvedValue({
      slug: 'know-god',
      variants: [{ id: '529_7_KnowGod', slug: 'know-god/english' }]
    } as never)

    const result = await fixKnowGodSlug()

    expect(result).toEqual({ videoUpdated: false, variantIdsUpdated: [] })
    expect(prismaMock.video.update).not.toHaveBeenCalled()
    expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
    expect(mockedVideoCacheReset).not.toHaveBeenCalled()
    expect(mockedVideoVariantCacheReset).not.toHaveBeenCalled()
  })

  it('does not touch a variant slug belonging to a different video prefix', async () => {
    prismaMock.video.findUniqueOrThrow.mockResolvedValue({
      slug: 'Nua_Know_God',
      variants: [
        { id: '529_7_KnowGod', slug: 'Nua_Know_God/english' },
        { id: 'other-variant', slug: 'some-other-video/english' }
      ]
    } as never)

    const result = await fixKnowGodSlug()

    expect(result.variantIdsUpdated).toEqual(['529_7_KnowGod'])
    expect(prismaMock.videoVariant.update).toHaveBeenCalledTimes(1)
  })
})
