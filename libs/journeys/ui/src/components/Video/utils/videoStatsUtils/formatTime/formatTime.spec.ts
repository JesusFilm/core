import { formatTime } from './formatTime'

describe('formatTime', () => {
  it('should format seconds to MM:SS format', () => {
    expect(formatTime(65)).toBe('1:05')
    expect(formatTime(3661)).toBe('61:01')
    expect(formatTime(0)).toBe('0:00')
  })

  it('should handle decimal seconds', () => {
    expect(formatTime(65.5)).toBe('1:05')
    expect(formatTime(65.9)).toBe('1:05')
  })
})
