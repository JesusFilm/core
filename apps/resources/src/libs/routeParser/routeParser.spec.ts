import { routeParser } from './routeParser'

describe('routeParser', () => {
  it('should handle undefined', () => {
    expect(routeParser(undefined)).toEqual({
      routes: [],
      audioLanguage: 529,
      subtitleLanguage: 529
    })
  })

  it('should handle a string', () => {
    expect(routeParser('badinput')).toEqual({
      routes: [],
      audioLanguage: 529,
      subtitleLanguage: 529
    })
  })

  it('should parse a route request', () => {
    expect(
      routeParser(['seo-playlist', 'seo-video', 'al', '1', 'sl', '2'])
    ).toEqual({
      routes: ['seo-playlist', 'seo-video'],
      audioLanguage: 1,
      subtitleLanguage: 2
    })
  })

  it('should parse a reasonably malformed route request', () => {
    expect(
      routeParser([
        'seo-playlist',
        'al',
        'al',
        '1',
        'sl',
        'sl',
        '2',
        'seo-video'
      ])
    ).toEqual({
      routes: ['seo-playlist', 'seo-video'],
      audioLanguage: 1,
      subtitleLanguage: 2
    })
  })
})
