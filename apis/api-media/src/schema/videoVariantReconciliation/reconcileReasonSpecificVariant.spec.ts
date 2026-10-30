import { isGeneratedParentVariant } from './reconcileReasonSpecificVariant'

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
