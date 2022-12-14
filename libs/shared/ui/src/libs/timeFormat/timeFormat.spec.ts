import { secondsToTimeFormat, timeFormatToSeconds } from '.'

describe('timeFormat', () => {
  describe('secondsToTimeFormat', () => {
    it('should convert seconds to time format', () => {
      expect(secondsToTimeFormat(0)).toEqual('00:00:00')
      expect(secondsToTimeFormat(1)).toEqual('00:00:01')
      expect(secondsToTimeFormat(60)).toEqual('00:01:00')
      expect(secondsToTimeFormat(3600)).toEqual('01:00:00')
      expect(secondsToTimeFormat(3661)).toEqual('01:01:01')
    })
  })
  describe('timeFormatToSeconds', () => {
    it('should convert time format to seconds', () => {
      expect(timeFormatToSeconds('00:00:00')).toEqual(0)
      expect(timeFormatToSeconds('00:00:01')).toEqual(1)
      expect(timeFormatToSeconds('00:01:00')).toEqual(60)
      expect(timeFormatToSeconds('01:00:00')).toEqual(3600)
      expect(timeFormatToSeconds('01:01:01')).toEqual(3661)
    })
  })

  it('should convert seconds to time format and trim it', () => {
    expect(secondsToTimeFormat(0, { trimSeconds: true })).toEqual('00:00')
    expect(secondsToTimeFormat(1, { trimSeconds: true })).toEqual('00:01')
    expect(secondsToTimeFormat(60, { trimSeconds: true })).toEqual('01:00')
    expect(secondsToTimeFormat(3600, { trimSeconds: true })).toEqual('01:00:00')
    expect(secondsToTimeFormat(3661, { trimSeconds: true })).toEqual('01:01:01')
  })
})
