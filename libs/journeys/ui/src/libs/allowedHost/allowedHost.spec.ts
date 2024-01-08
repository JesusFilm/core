import { allowedHost } from '.'

describe('allowedHost', () => {
  it('returns false when localhost:4200', () => {
    expect(allowedHost('localhost:4200')).toBe(false)
  })

  describe('custom tests', () => {
    it('returns true when localhost:4200', () => {
      expect(allowedHost('localhost:4200', ['localhost:4200'])).toBe(true)
    })
  })

  it('returns true when journeys-1943-jesusfilm.vercel.app', () => {
    expect(allowedHost('journeys-1943-jesusfilm.vercel.app')).toBe(true)
  })

  it('returns false when example.com', () => {
    expect(allowedHost('example.com')).toBe(false)
  })
})
