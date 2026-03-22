import { safeDecodeRedirect } from './safeDecodeRedirect'

describe('safeDecodeRedirect', () => {
  it('returns already-decoded values unchanged', () => {
    expect(safeDecodeRedirect('/dashboard')).toBe('/dashboard')
  })

  it('decodes a single-encoded value', () => {
    expect(safeDecodeRedirect('%2Fdashboard')).toBe('/dashboard')
  })

  it('fully decodes a double-encoded value', () => {
    expect(safeDecodeRedirect('%252Fdashboard')).toBe('/dashboard')
  })

  it('fully decodes a triple-encoded value', () => {
    expect(safeDecodeRedirect('%25252Fdashboard')).toBe('/dashboard')
  })

  it('decodes a complex double-encoded redirect with query params', () => {
    const doubleEncoded =
      '%252Fusers%252Fverify%253Fredirect%253D%25252Fsome-page'
    expect(safeDecodeRedirect(doubleEncoded)).toBe(
      '/users/verify?redirect=/some-page'
    )
  })

  it('handles malformed URI sequences gracefully', () => {
    expect(safeDecodeRedirect('%E0%A4%A')).toBe('%E0%A4%A')
  })

  it('returns empty string for empty input', () => {
    expect(safeDecodeRedirect('')).toBe('')
  })
})
