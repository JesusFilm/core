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
  it('should format TimeRanges object to string with no offset (startAt=0)', () => {
    const mockTimeRanges = {
      length: 2,
      start: (index: number) => (index === 0 ? 0 : 30),
      end: (index: number) => (index === 0 ? 10 : 60)
    } as TimeRanges

    expect(formatTimeRanges(mockTimeRanges, 0, 60)).toBe('0:00-0:10, 0:30-1:00')
  })

  it('should return "-" for null or undefined TimeRanges', () => {
    expect(formatTimeRanges(null, 0, 60)).toBe('-')
    expect(formatTimeRanges(undefined, 0, 60)).toBe('-')
  })

  it('should handle empty TimeRanges', () => {
    const mockEmptyTimeRanges = {
      length: 0,
      start: jest.fn(),
      end: jest.fn()
    } as unknown as TimeRanges

    expect(formatTimeRanges(mockEmptyTimeRanges, 0, 60)).toBe('-')
  })

  it('should adjust time ranges relative to startAt', () => {
    const mockTimeRanges = {
      length: 2,
      start: (index: number) => (index === 0 ? 10 : 40),
      end: (index: number) => (index === 0 ? 20 : 70)
    } as TimeRanges

    // With startAt=10, ranges should be adjusted by -10 seconds
    expect(formatTimeRanges(mockTimeRanges, 10, 70)).toBe(
      '0:00-0:10, 0:30-1:00'
    )
  })

  it('should clamp time ranges to endAt', () => {
    const mockTimeRanges = {
      length: 2,
      start: (index: number) => (index === 0 ? 0 : 30),
      end: (index: number) => (index === 0 ? 20 : 80)
    } as TimeRanges

    // With endAt=50, the second range should be clamped to end at 50-0=50 seconds
    expect(formatTimeRanges(mockTimeRanges, 0, 50)).toBe('0:00-0:20, 0:30-0:50')
  })

  it('should filter out ranges completely outside the specified section', () => {
    const mockTimeRanges = {
      length: 3,
      start: (index: number) => (index === 0 ? 0 : index === 1 ? 30 : 70),
      end: (index: number) => (index === 0 ? 10 : index === 1 ? 50 : 90)
    } as TimeRanges

    // With startAt=20 and endAt=60, the first range (0-10) and third range (70-90) should be filtered out
    expect(formatTimeRanges(mockTimeRanges, 20, 60)).toBe('0:10-0:30')
  })

  it('should handle ranges that partially overlap with the specified section', () => {
    const mockTimeRanges = {
      length: 2,
      start: (index: number) => (index === 0 ? 5 : 45),
      end: (index: number) => (index === 0 ? 25 : 65)
    } as TimeRanges

    // With startAt=15 and endAt=55, ranges should be adjusted and clamped
    // First range (5-25) becomes (0-10) after adjustment
    // Second range (45-65) becomes (30-40) after adjustment
    expect(formatTimeRanges(mockTimeRanges, 15, 55)).toBe(
      '0:00-0:10, 0:30-0:40'
    )
  })
})
