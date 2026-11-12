import {
  hasAlgoliaPlayableMedia,
  isAlgoliaVideoDownloadable
} from './isAlgoliaVideoDownloadable'

const realMedia = {
  hls: 'https://example.com/v.m3u8',
  dash: '',
  downloadable: true,
  downloads: [{ quality: 'low' }]
}

describe('isAlgoliaVideoDownloadable', () => {
  it('is downloadable with the flag, playable media and downloads', () => {
    expect(isAlgoliaVideoDownloadable(realMedia)).toBe(true)
  })

  it.each(['low', 'high', 'sd', 'fhd', 'qhd', 'uhd', 'highest'])(
    'counts a %s download row',
    (quality) => {
      expect(
        isAlgoliaVideoDownloadable({ ...realMedia, downloads: [{ quality }] })
      ).toBe(true)
    }
  )

  // distro* rows are partner-specific alternates of low/sd/high, so they do
  // not count on their own.
  it.each(['distroLow', 'distroSd', 'distroHigh'])(
    'does not count a %s download row on its own',
    (quality) => {
      expect(
        isAlgoliaVideoDownloadable({ ...realMedia, downloads: [{ quality }] })
      ).toBe(false)
    }
  )

  it('does not count a Variant whose only rows are distro*', () => {
    expect(
      isAlgoliaVideoDownloadable({
        ...realMedia,
        downloads: [
          { quality: 'distroLow' },
          { quality: 'distroSd' },
          { quality: 'distroHigh' }
        ]
      })
    ).toBe(false)
  })

  it('counts a standard row that sits beside distro* rows', () => {
    expect(
      isAlgoliaVideoDownloadable({
        ...realMedia,
        downloads: [{ quality: 'distroLow' }, { quality: 'fhd' }]
      })
    ).toBe(true)
  })

  it('accepts a DASH-only stream', () => {
    expect(
      isAlgoliaVideoDownloadable({
        ...realMedia,
        hls: '',
        dash: 'https://example.com/v.mpd'
      })
    ).toBe(true)
  })

  it.each([
    ['empty hls and dash (generated parent variant)', { hls: '', dash: '' }],
    ['null hls and dash', { hls: null, dash: null }],
    ['no downloads', { downloads: [] }],
    ['downloads missing', { downloads: undefined }],
    ['downloads null', { downloads: null }],
    ['a false flag', { downloadable: false }],
    ['a null flag', { downloadable: null }]
  ])('is not downloadable with %s', (_name, override) => {
    expect(isAlgoliaVideoDownloadable({ ...realMedia, ...override })).toBe(
      false
    )
  })

  it('is not downloadable without a variant', () => {
    expect(isAlgoliaVideoDownloadable(undefined)).toBe(false)
    expect(isAlgoliaVideoDownloadable(null)).toBe(false)
  })
})

describe('hasAlgoliaPlayableMedia', () => {
  it('is true with an HLS URL', () => {
    expect(hasAlgoliaPlayableMedia({ hls: 'https://example.com/v.m3u8' })).toBe(
      true
    )
  })

  it('is true with a DASH-only URL', () => {
    expect(
      hasAlgoliaPlayableMedia({ hls: '', dash: 'https://example.com/v.mpd' })
    ).toBe(true)
  })

  it('is false with no media', () => {
    expect(hasAlgoliaPlayableMedia({ hls: '', dash: '' })).toBe(false)
    expect(hasAlgoliaPlayableMedia({ hls: null, dash: null })).toBe(false)
    expect(hasAlgoliaPlayableMedia(undefined)).toBe(false)
  })
})
