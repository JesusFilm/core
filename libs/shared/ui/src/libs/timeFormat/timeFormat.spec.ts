import { secondsToTimeFormat, timeFormatToSeconds } from '.'

describe('timeFormat', () => {
  describe('secondsToTimeFormat', () => {
    it('should convert seconds to time format', () => {
      expect(secondsToTimeFormat(0)).toBe('00:00:00')
      expect(secondsToTimeFormat(1)).toBe('00:00:01')
      expect(secondsToTimeFormat(60)).toBe('00:01:00')
      expect(secondsToTimeFormat(3600)).toBe('01:00:00')
      expect(secondsToTimeFormat(3661)).toBe('01:01:01')
      expect(secondsToTimeFormat(NaN)).toBe('00:00:00')
    })

    it('should convert seconds to time format and trim it', () => {
      expect(secondsToTimeFormat(0, { trimZeroes: true })).toBe('0:00')
      expect(secondsToTimeFormat(1, { trimZeroes: true })).toBe('0:01')
      expect(secondsToTimeFormat(60, { trimZeroes: true })).toBe('1:00')
      expect(secondsToTimeFormat(3600, { trimZeroes: true })).toBe('1:00:00')
      expect(secondsToTimeFormat(3661, { trimZeroes: true })).toBe('1:01:01')
      expect(secondsToTimeFormat(NaN, { trimZeroes: true })).toBe('0:00')
    })
  })

  describe('timeFormatToSeconds', () => {
    it('should convert time format to seconds', () => {
      expect(timeFormatToSeconds('00:00:00')).toBe(0)
      expect(timeFormatToSeconds('00:00:01')).toBe(1)
      expect(timeFormatToSeconds('00:01:00')).toBe(60)
      expect(timeFormatToSeconds('01:00:00')).toBe(3600)
      expect(timeFormatToSeconds('01:01:01')).toBe(3661)
    })
  })
})
