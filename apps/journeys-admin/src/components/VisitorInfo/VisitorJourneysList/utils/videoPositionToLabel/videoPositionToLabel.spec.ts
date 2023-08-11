import { videoPositionToLabel } from '.'

describe('videoPositionLabel', () => {
  it('should convert seconds to mm/ss format', () => {
    const result = videoPositionToLabel(260.4)
    expect(result).toBe('4:34')
  })

  it('should return 0:00 if less than a second', () => {
    const result = videoPositionToLabel(0.1)
    expect(result).toBe('0:00')
  })

  it('should return 0:00 if duration is not given', () => {
    const result = videoPositionToLabel(null)
    expect(result).toBe('0:00')
  })
})
