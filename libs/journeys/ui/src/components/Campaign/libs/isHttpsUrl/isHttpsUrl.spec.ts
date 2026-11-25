import { isHttpsUrl } from './isHttpsUrl'

describe('isHttpsUrl', () => {
  it('accepts an absolute https URL from any host', () => {
    expect(isHttpsUrl('https://imagedelivery.net/abc/public')).toBe(true)
    expect(isHttpsUrl('https://images.example.org/cover.jpg')).toBe(true)
  })

  it('rejects other schemes', () => {
    expect(isHttpsUrl('http://images.example.org/cover.jpg')).toBe(false)
    expect(isHttpsUrl('javascript:alert(1)')).toBe(false)
    expect(isHttpsUrl('data:image/png;base64,AAAA')).toBe(false)
  })

  it('rejects relative, scheme-less and blank URLs', () => {
    expect(isHttpsUrl('/cover.jpg')).toBe(false)
    expect(isHttpsUrl('//images.example.org/cover.jpg')).toBe(false)
    expect(isHttpsUrl('images.example.org/cover.jpg')).toBe(false)
    expect(isHttpsUrl('')).toBe(false)
  })
})
