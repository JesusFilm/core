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
