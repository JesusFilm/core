import { VIEWER_RESERVED_SEGMENTS } from './viewerReservedSegments'

describe('VIEWER_RESERVED_SEGMENTS', () => {
  it('holds every route segment the viewer owns', () => {
    for (const segment of [
      'embed',
      'legal',
      'plausible',
      'campaign',
      'template-gallery',
      'api',
      '_next'
    ])
      expect(VIEWER_RESERVED_SEGMENTS.has(segment)).toBe(true)
  })

  it('holds every i18n locale segment Next strips from the path', () => {
    for (const locale of [
      'en',
      'es',
      'fr',
      'id',
      'th',
      'ja',
      'ko',
      'ru',
      'tr',
      'zh',
      'zh-hans-cn'
    ])
      expect(VIEWER_RESERVED_SEGMENTS.has(locale)).toBe(true)
  })

  it('holds nothing else', () => {
    expect(VIEWER_RESERVED_SEGMENTS.size).toBe(18)
  })
})
