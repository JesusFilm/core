import { isAlgoliaVideoDownloadable } from './isAlgoliaVideoDownloadable'

const realMedia = {
  hls: 'https://example.com/v.m3u8',
  dash: '',
  downloadable: true,
  downloads: [{ quality: 'low' }]
}

describe('isAlgoliaVideoDownloadable', () => {
  describe.each(['collection', 'series'])('a %s', (label) => {
    it('is downloadable with playable media and downloads', () => {
      expect(isAlgoliaVideoDownloadable(label, realMedia)).toBe(true)
    })

    it('accepts a DASH-only stream', () => {
      expect(
        isAlgoliaVideoDownloadable(label, {
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
      ['a false flag', { downloadable: false }]
    ])('is not downloadable with %s', (_name, override) => {
      expect(
        isAlgoliaVideoDownloadable(label, { ...realMedia, ...override })
      ).toBe(false)
    })

    it('is not downloadable without a variant', () => {
      expect(isAlgoliaVideoDownloadable(label, undefined)).toBe(false)
    })
  })

  it.each(['featureFilm', 'episode', 'segment'])(
    'follows the variant flag for a %s',
    (label) => {
      expect(
        isAlgoliaVideoDownloadable(label, { hls: '', downloadable: true })
      ).toBe(true)
      expect(
        isAlgoliaVideoDownloadable(label, { ...realMedia, downloadable: false })
      ).toBe(false)
    }
  )
})
