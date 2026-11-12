import { beforeEach, vi } from 'vitest'

import { prismaMock } from '../../../test/prismaMock'
import { updateVideoInAlgolia } from '../../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../../lib/algolia/algoliaVideoVariantUpdate'

import {
  isGeneratedParentVariant,
  reconcileGeneratedParentVariant
} from './reconcileReasonSpecificVariant'

vi.mock('../../lib/algolia/algoliaVideoUpdate', () => ({
  updateVideoInAlgolia: vi.fn()
}))
vi.mock('../../lib/algolia/algoliaVideoVariantUpdate', () => ({
  updateVideoVariantInAlgolia: vi.fn()
}))
vi.mock('../video/lib/updateAvailableLanguages', () => ({
  removeLanguageFromVideoIfUnused: vi.fn(),
  updateParentCollectionLanguages: vi.fn()
}))

describe('isGeneratedParentVariant', () => {
  const baseVariant = {
    id: 'variant-1',
    videoId: 'my-film',
    languageId: '529',
    published: true,
    muxVideo: null,
    hls: '',
    share: '',
    video: { label: 'featureFilm' }
  }

  it('recognises a media-less container Variant as a generated parent', () => {
    expect(
      isGeneratedParentVariant(baseVariant, 'video-relationship-change')
    ).toBe(true)
  })

  it.each([
    ['episode', { label: 'episode' }],
    ['shortFilm', { label: 'shortFilm' }]
  ])(
    'does not treat a media-less %s Variant as a generated parent',
    (_label, video) => {
      expect(
        isGeneratedParentVariant(
          { ...baseVariant, video },
          'video-relationship-change'
        )
      ).toBe(false)
    }
  )

  it('does not treat a Variant without a loaded Video as a generated parent', () => {
    expect(
      isGeneratedParentVariant(
        { ...baseVariant, video: null },
        'video-relationship-change'
      )
    ).toBe(false)
  })

  it('does not treat a Variant with a Mux video as a generated parent', () => {
    expect(
      isGeneratedParentVariant(
        { ...baseVariant, muxVideo: { readyToStream: false } },
        'video-relationship-change'
      )
    ).toBe(false)
  })

  it.each(['video-variant-create', 'process-video-upload'] as const)(
    'does not treat a media-less container Variant as a generated parent while its reason is the fresh upload %s',
    (reason) => {
      expect(isGeneratedParentVariant(baseVariant, reason)).toBe(false)
    }
  )

  it.each([
    ['dash', { dash: 'https://cdn.example.com/video.mpd' }],
    ['masterUrl', { masterUrl: 'https://cdn.example.com/master.mp4' }],
    ['assetId', { assetId: 'r2-asset-1' }],
    ['duration', { duration: 120 }]
  ])(
    'does not mistake a real Variant whose media lives in %s for a generated parent',
    (_field, mediaField) => {
      expect(
        isGeneratedParentVariant(
          { ...baseVariant, ...mediaField },
          'video-relationship-change'
        )
      ).toBe(false)
    }
  )
})

describe('reconcileGeneratedParentVariant', () => {
  const reconciliation = {
    reason: 'video-relationship-change' as const,
    videoId: 'series-1',
    languageId: '529',
    videoVariantId: 'variant-1',
    published: true,
    processingStages: {},
    createdAt: new Date('2026-01-01T00:00:00Z')
  }
  const variant = {
    id: 'variant-1',
    videoId: 'series-1',
    languageId: '529',
    published: false,
    muxVideo: null,
    hls: '',
    video: { label: 'series' }
  }
  const updateMany = vi.fn()
  const store = { videoVariantReconciliation: { updateMany } }

  function run(overrides: Partial<typeof variant> = {}) {
    return reconcileGeneratedParentVariant({
      reconciliationId: 'reconciliation-1',
      reconciliation,
      variant: { ...variant, ...overrides },
      store
    })
  }

  beforeEach(() => {
    vi.mocked(updateVideoInAlgolia).mockReset()
    vi.mocked(updateVideoVariantInAlgolia).mockReset()
    updateMany.mockReset()
  })

  // updateVideoInAlgolia only selects a published English Variant, so the
  // Video record has to be synced after the Variant is published, or the
  // record is indexed without it.
  it('syncs the Video record only after the Variant publish write', async () => {
    const result = await run()

    expect(result).toEqual({ publicationReady: true, status: 'complete' })
    expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
      where: { id: 'variant-1' },
      data: { published: true }
    })
    expect(updateVideoInAlgolia).toHaveBeenCalledWith('series-1')
    expect(
      vi.mocked(updateVideoInAlgolia).mock.invocationCallOrder[0]
    ).toBeGreaterThan(prismaMock.videoVariant.update.mock.invocationCallOrder[0])
    expect(
      vi.mocked(updateVideoInAlgolia).mock.invocationCallOrder[0]
    ).toBeGreaterThan(
      vi.mocked(updateVideoVariantInAlgolia).mock.invocationCallOrder[0]
    )
  })

  it('does not rewrite a Variant that is already published, and still syncs the Video record', async () => {
    const result = await run({ published: true })

    expect(result).toEqual({ publicationReady: true, status: 'complete' })
    expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
    expect(updateVideoInAlgolia).toHaveBeenCalledWith('series-1')
  })

  it('rolls the publish back and skips the Video record sync when the Variant sync fails', async () => {
    vi.mocked(updateVideoVariantInAlgolia).mockRejectedValue(
      new Error('algolia down')
    )

    const result = await run()

    expect(result).toMatchObject({
      publicationReady: false,
      status: 'degraded',
      failure: { stageName: 'algoliaVariant' }
    })
    expect(prismaMock.videoVariant.update).toHaveBeenLastCalledWith({
      where: { id: 'variant-1' },
      data: { published: false }
    })
    expect(updateVideoInAlgolia).not.toHaveBeenCalled()
  })

  it('leaves the reconciliation degraded when only the Video record sync fails', async () => {
    vi.mocked(updateVideoInAlgolia).mockRejectedValue(new Error('algolia down'))

    const result = await run()

    expect(result).toMatchObject({
      publicationReady: false,
      status: 'degraded',
      failure: { stageName: 'algoliaVideo' }
    })
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'degraded' })
      })
    )
  })
})
