import { buildDestination } from './destination'

describe('buildDestination', () => {
  it('returns the destination untouched when there is no incoming query', () => {
    expect(
      buildDestination(
        'https://www.jesusfilm.org/watch/jesus.html',
        new URLSearchParams('')
      )
    ).toBe('https://www.jesusfilm.org/watch/jesus.html')
  })

  it('appends incoming parameters after the destination’s own', () => {
    expect(
      buildDestination(
        'https://example.com/landing?keep=1',
        new URLSearchParams('utm_source=yt&utm_medium=desc')
      )
    ).toBe('https://example.com/landing?keep=1&utm_source=yt&utm_medium=desc')
  })

  it('appends duplicates rather than overwriting', () => {
    expect(
      buildDestination(
        'https://example.com/?utm_source=dest',
        new URLSearchParams('utm_source=incoming')
      )
    ).toBe('https://example.com/?utm_source=dest&utm_source=incoming')
  })

  it('strips qr and keeps everything else', () => {
    expect(
      buildDestination(
        'https://example.com/',
        new URLSearchParams('qr=1&utm_campaign=easter&qr=2')
      )
    ).toBe('https://example.com/?utm_campaign=easter')
  })

  it('preserves a hash fragment on the destination', () => {
    expect(
      buildDestination(
        'https://example.com/page#section',
        new URLSearchParams('utm_source=yt')
      )
    ).toBe('https://example.com/page?utm_source=yt#section')
  })

  it('encodes parameter values', () => {
    expect(
      buildDestination(
        'https://example.com/',
        new URLSearchParams({ utm_content: 'a b&c' })
      )
    ).toBe('https://example.com/?utm_content=a+b%26c')
  })

  it('throws on a relative destination', () => {
    expect(() =>
      buildDestination('/relative', new URLSearchParams(''))
    ).toThrow()
  })
})
