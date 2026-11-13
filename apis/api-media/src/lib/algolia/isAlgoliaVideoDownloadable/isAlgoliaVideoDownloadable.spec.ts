import { isAlgoliaVideoDownloadable } from './isAlgoliaVideoDownloadable'

const downloadableVariant = {
  hls: 'https://example.com/v.m3u8',
  dash: null,
  downloadable: true
}

describe('isAlgoliaVideoDownloadable', () => {
  it('is downloadable with the flag and an HLS stream', () => {
    expect(isAlgoliaVideoDownloadable(downloadableVariant)).toBe(true)
  })

  it('accepts a DASH-only stream', () => {
    expect(
      isAlgoliaVideoDownloadable({
        ...downloadableVariant,
        hls: '',
        dash: 'https://example.com/v.mpd'
      })
    ).toBe(true)
  })

  it.each([
    ['empty hls and dash (generated parent variant)', { hls: '', dash: '' }],
    ['null hls and dash', { hls: null, dash: null }],
    ['missing hls and dash', { hls: undefined, dash: undefined }],
    ['a false flag', { downloadable: false }],
    ['a null flag', { downloadable: null }]
  ])('is not downloadable with %s', (_name, override) => {
    expect(
      isAlgoliaVideoDownloadable({ ...downloadableVariant, ...override })
    ).toBe(false)
  })

  it('is not downloadable without a variant', () => {
    expect(isAlgoliaVideoDownloadable(undefined)).toBe(false)
    expect(isAlgoliaVideoDownloadable(null)).toBe(false)
  })
})
