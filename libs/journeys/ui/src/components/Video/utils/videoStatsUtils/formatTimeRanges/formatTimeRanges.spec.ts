import { formatTimeRanges } from './formatTimeRanges'

// Mock the formatTime function
jest.mock('../formatTime', () => ({
  formatTime: (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}))

describe('formatTimeRanges', () => {
  it('should format TimeRanges object to string', () => {
    const mockTimeRanges = {
      length: 2,
      start: (index: number) => (index === 0 ? 0 : 30),
      end: (index: number) => (index === 0 ? 10 : 60)
    } as TimeRanges

    expect(formatTimeRanges(mockTimeRanges)).toBe('0:00-0:10, 0:30-1:00')
  })

  it('should return "-" for null or undefined TimeRanges', () => {
    expect(formatTimeRanges(null)).toBe('-')
    expect(formatTimeRanges(undefined)).toBe('-')
  })

  it('should handle empty TimeRanges', () => {
    const mockEmptyTimeRanges = {
      length: 0,
      start: jest.fn(),
      end: jest.fn()
    } as unknown as TimeRanges

    expect(formatTimeRanges(mockEmptyTimeRanges)).toBe('-')
  })
})
