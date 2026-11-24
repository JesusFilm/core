import { transformDuration } from '.'

describe('transformDuration', () => {
  const t = (str: string): string => str

  it('should return a dash for null', () => {
    const res = transformDuration(t, null)
    expect(res).toBe('–')
  })

  it('should return a dash for undefined', () => {
    const res = transformDuration(t, undefined)
    expect(res).toBe('–')
  })

  it('should return a dash for 0', () => {
    const res = transformDuration(t, 0)
    expect(res).toBe('–')
  })

  it('should return seconds for 1', () => {
    const res = transformDuration(t, 1)
    expect(res).toBe('1 sec')
  })

  it('should return seconds', () => {
    const res = transformDuration(t, 59)
    expect(res).toBe('59 sec')
  })

  it('should return seconds for 60', () => {
    const res = transformDuration(t, 60)
    expect(res).toBe('60 sec')
  })

  it('should return minutes for 61', () => {
    const res = transformDuration(t, 61)
    expect(res).toBe('1 min')
  })

  it('should return minutes', () => {
    const res = transformDuration(t, 65)
    expect(res).toBe('1 min')
  })
})
