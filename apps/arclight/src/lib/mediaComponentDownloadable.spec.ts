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

  it.each(['low', 'high', 'sd', 'fhd', 'qhd', 'uhd', 'highest'])(
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

  // distro* rows are partner-specific alternates of low/sd/high, so they do
  // not count on their own.
  it.each(['distroLow', 'distroSd', 'distroHigh'])(
    'does not count a %s download row on its own',
    (quality) => {
      expect(
        isMediaComponentDownloadable({
          ...downloadableVariant,
          downloads: [{ quality }]
        })
      ).toBe(false)
    }
  )

  it('counts a standard row that sits beside distro* rows', () => {
    expect(
      isMediaComponentDownloadable({
        ...downloadableVariant,
        downloads: [{ quality: 'distroLow' }, { quality: 'fhd' }]
      })
    ).toBe(true)
  })

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
