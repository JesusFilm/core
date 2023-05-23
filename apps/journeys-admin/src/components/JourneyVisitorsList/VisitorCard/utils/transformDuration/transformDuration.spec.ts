import { transformDuration } from '.'

describe('transformDuration', () => {
  const t = (str: string): string => str
  it('should return 0min for null', () => {
    const res = transformDuration(t, null)
    expect(res).toEqual('0 min')
  })

  it('should return seconds', () => {
    const res = transformDuration(t, 59)
    expect(res).toEqual('59 sec')
  })

  it('should return minutes', () => {
    const res = transformDuration(t, 65)
    expect(res).toEqual('1 min')
  })
})
