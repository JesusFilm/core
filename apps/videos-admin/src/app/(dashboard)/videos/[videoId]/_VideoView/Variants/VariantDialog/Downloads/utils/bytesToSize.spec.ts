import { bytesToSize } from './bytesToSize'

describe('bytesToSize', () => {
  describe('binary', () => {
    it('should handle 0 bytes', () => {
      expect(bytesToSize(0)).toBe('0 Bytes')
    })

    it('should return bytes correctly for values less than 1 KB', () => {
      expect(bytesToSize(512)).toBe('512 Bytes')
    })

    it('should return KB correctly for values in kilobytes', () => {
      expect(bytesToSize(1024)).toBe('1 KB')
      expect(bytesToSize(1536)).toBe('1.5 KB')
    })

    it('should return MB correctly for values in megabytes', () => {
      expect(bytesToSize(1024 * 1024)).toBe('1 MB')
      expect(bytesToSize(1048576 + 524288)).toBe('1.5 MB') // 1.5 MB
    })

    it('should return GB correctly for values in gigabytes', () => {
      expect(bytesToSize(1024 ** 3)).toBe('1 GB')
      expect(bytesToSize(1024 ** 3 * 1.5)).toBe('1.5 GB')
    })

    it('should return TB correctly for values in terabytes', () => {
      expect(bytesToSize(1024 ** 4)).toBe('1 TB')
      expect(bytesToSize(1024 ** 4 * 1.5)).toBe('1.5 TB')
    })
  })

  describe('decimal', () => {
    it('should handle 0 bytes', () => {
      expect(bytesToSize(0, false)).toBe('0 Bytes')
    })

    it('should return bytes correctly for values less than 1 KB', () => {
      expect(bytesToSize(512, false)).toBe('512 Bytes')
    })

    it('should return KB correctly for values in kilobytes', () => {
      expect(bytesToSize(1024, false)).toBe('1.02 KB')
      expect(bytesToSize(1536, false)).toBe('1.54 KB')
    })

    it('should return MB correctly for values in megabytes', () => {
      expect(bytesToSize(1024 * 1024, false)).toBe('1.05 MB')
      expect(bytesToSize(1048576 + 524288, false)).toBe('1.57 MB')
    })

    it('should return GB correctly for values in gigabytes', () => {
      expect(bytesToSize(1024 ** 3, false)).toBe('1.07 GB')
      expect(bytesToSize(1024 ** 3 * 1.5, false)).toBe('1.61 GB')
    })

    it('should return TB correctly for values in terabytes', () => {
      expect(bytesToSize(1024 ** 4, false)).toBe('1.1 TB')
      expect(bytesToSize(1024 ** 4 * 1.5, false)).toBe('1.65 TB')
    })
  })
})
