import { beforeEach, describe, expect, it, vi } from 'vitest'

import { prismaMock } from '../../../test/prismaMock'
import { videoCacheReset } from '../../lib/videoCacheReset'
import {
  addLanguageToVideo,
  findContainerParentIds,
  updateParentCollectionLanguages
} from '../video/lib/updateAvailableLanguages'

import { publishParentVariants } from './reconcileParentVariants'

vi.mock('../../lib/videoCacheReset', () => ({
  videoCacheReset: vi.fn()
}))
vi.mock('../video/lib/updateAvailableLanguages', () => ({
  addLanguageToVideo: vi.fn(),
  updateParentCollectionLanguages: vi.fn(),
  findContainerParentIds: vi.fn()
}))

describe('publishParentVariants', () => {
  const variant = {
    id: 'variant-1',
    videoId: '1_jf6101-0-0',
    languageId: '19372',
    slug: 'jesus-chapter-1/19372'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not create a placeholder Variant for a feature film parent', async () => {
    vi.mocked(findContainerParentIds).mockResolvedValue(['1_jf-0-0'])
    prismaMock.video.findMany.mockResolvedValue([
      { id: '1_jf-0-0', slug: 'jesus', label: 'featureFilm' }
    ] as never)
    prismaMock.videoVariant.findFirst.mockResolvedValue(null)

    await publishParentVariants(variant)

    expect(prismaMock.videoVariant.create).not.toHaveBeenCalled()
    expect(prismaMock.videoVariantReconciliation.create).not.toHaveBeenCalled()
    // The feature film's availableLanguages still cascades even without a
    // placeholder Variant.
    expect(addLanguageToVideo).toHaveBeenCalledWith('1_jf-0-0', '19372')
    expect(updateParentCollectionLanguages).toHaveBeenCalledWith('1_jf-0-0')
    expect(videoCacheReset).toHaveBeenCalledWith('1_jf-0-0')
  })

  it('creates a placeholder Variant for a collection parent', async () => {
    vi.mocked(findContainerParentIds).mockResolvedValue(['jesus-chapters'])
    prismaMock.video.findMany.mockResolvedValue([
      { id: 'jesus-chapters', slug: 'jesus-chapters', label: 'collection' }
    ] as never)
    prismaMock.videoVariant.findFirst.mockResolvedValue(null)
    prismaMock.$transaction.mockImplementation(
      (async (callback: any) => await callback(prismaMock)) as any
    )

    await publishParentVariants(variant)

    expect(prismaMock.videoVariant.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: '19372_jesus-chapters',
        videoId: 'jesus-chapters',
        published: true
      })
    })
    expect(prismaMock.videoVariantReconciliation.create).toHaveBeenCalled()
  })
})
