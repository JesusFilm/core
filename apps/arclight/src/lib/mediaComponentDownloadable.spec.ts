import { isMediaComponentDownloadable } from './mediaComponentDownloadable'

const downloadableVariant = {
  hls: 'https://example.com/v.m3u8',
  dash: null,
  downloadable: true,
  downloads: [{ quality: 'low' }]
}

describe('isMediaComponentDownloadable', () => {
  it('is downloadable with the flag, playable media and a download row', () => {
    expect(isMediaComponentDownloadable(downloadableVariant)).toBe(true)
  })

  it('accepts a DASH-only stream', () => {
    expect(
      isMediaComponentDownloadable({
        ...downloadableVariant,
        hls: '',
        dash: 'https://example.com/v.mpd'
      })
    ).toBe(true)
  })

  it.each(['low', 'high', 'sd', 'fhd', 'distroLow'])(
    'counts a %s download row',
    (quality) => {
      expect(
        isMediaComponentDownloadable({
          ...downloadableVariant,
          downloads: [{ quality }]
        })
      ).toBe(true)
    }
  )

  it.each([
    ['empty hls and dash (generated parent variant)', { hls: '', dash: '' }],
    ['null hls and dash', { hls: null, dash: null }],
    ['no download rows', { downloads: [] }],
    ['downloads missing', { downloads: undefined }],
    ['downloads null', { downloads: null }],
    ['a false flag', { downloadable: false }],
    ['a null flag', { downloadable: null }]
  ])('is not downloadable with %s', (_name, override) => {
    expect(
      isMediaComponentDownloadable({ ...downloadableVariant, ...override })
    ).toBe(false)
  })

  it('is not downloadable without a variant', () => {
    expect(isMediaComponentDownloadable(undefined)).toBe(false)
    expect(isMediaComponentDownloadable(null)).toBe(false)
  })
})
