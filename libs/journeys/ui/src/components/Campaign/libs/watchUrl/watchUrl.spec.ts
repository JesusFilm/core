import { watchUrl } from './watchUrl'

describe('watchUrl', () => {
  it('builds the Watch page from a variant slug', () => {
    expect(watchUrl('jesus/english')).toBe(
      'https://www.jesusfilm.org/watch/jesus.html/english.html'
    )
  })

  it('links a bare video slug to the Video', () => {
    expect(watchUrl('jesus')).toBe('https://www.jesusfilm.org/watch/jesus.html')
  })

  it('encodes each segment of the slug', () => {
    expect(watchUrl('la-natividad/español')).toBe(
      'https://www.jesusfilm.org/watch/la-natividad.html/espa%C3%B1ol.html'
    )
  })
})
