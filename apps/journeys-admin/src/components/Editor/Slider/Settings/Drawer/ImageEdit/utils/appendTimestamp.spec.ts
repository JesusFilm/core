import { appendTimestamp } from './appendTimestamp'

describe('appendTimestamp', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => 1234567890)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should append timestamp to URL without query parameters', () => {
    const url = 'https://example.com/image.jpg'
    const result = appendTimestamp(url)
    expect(result).toBe('https://example.com/image.jpg?t=1234567890')
  })

  it('should append timestamp to URL with existing query parameters', () => {
    const url = 'https://example.com/image.jpg?width=100'
    const result = appendTimestamp(url)
    expect(result).toBe('https://example.com/image.jpg?width=100&t=1234567890')
  })

  it('should append timestamp to URL with multiple query parameters', () => {
    const url = 'https://example.com/image.jpg?width=100&height=200'
    const result = appendTimestamp(url)
    expect(result).toBe(
      'https://example.com/image.jpg?width=100&height=200&t=1234567890'
    )
  })

  it('should handle URLs with special characters', () => {
    const url = 'https://example.com/image with spaces.jpg'
    const result = appendTimestamp(url)
    expect(result).toBe(
      'https://example.com/image with spaces.jpg?t=1234567890'
    )
  })

  it('should handle URLs with empty query parameters', () => {
    const url = 'https://example.com/image.jpg?'
    const result = appendTimestamp(url)
    expect(result).toBe('https://example.com/image.jpg?t=1234567890')
  })
})
