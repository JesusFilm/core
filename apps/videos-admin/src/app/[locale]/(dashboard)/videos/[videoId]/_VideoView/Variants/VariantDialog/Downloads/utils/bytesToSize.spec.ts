import { bytesToSize } from './bytesToSize'

describe('bytesToSize', () => {
  it('should return "n/a" for 0 bytes', () => {
    expect(bytesToSize(0)).toBe('n/a')
  })

  it('should return bytes correctly for values less than 1 KB', () => {
    expect(bytesToSize(512)).toBe('512 Bytes')
  })

  it('should return KB correctly for values in kilobytes', () => {
    expect(bytesToSize(1024)).toBe('1.0 KB')
    expect(bytesToSize(1536)).toBe('1.5 KB')
  })

  it('should return MB correctly for values in megabytes', () => {
    expect(bytesToSize(1024 * 1024)).toBe('1.0 MB')
    expect(bytesToSize(1048576 + 524288)).toBe('1.5 MB') // 1.5 MB
  })

  it('should return GB correctly for values in gigabytes', () => {
    expect(bytesToSize(1024 ** 3)).toBe('1.0 GB')
    expect(bytesToSize(1024 ** 3 * 1.5)).toBe('1.5 GB')
  })

  it('should return TB correctly for values in terabytes', () => {
    expect(bytesToSize(1024 ** 4)).toBe('1.0 TB')
    expect(bytesToSize(1024 ** 4 * 1.5)).toBe('1.5 TB')
  })

  it('should handle larger values', () => {
    expect(bytesToSize(1024 ** 5)).toBe('1024.0 TB')
  })
})
