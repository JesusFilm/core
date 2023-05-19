import { transformDuration } from '.'

describe('transformDuration', () => {
  const t = (str: string): string => str
  it('should return 0min for null', () => {
    const res = transformDuration(null, t)
    expect(res).toEqual('0 min')
  })

  it('should return seconds', () => {
    const res = transformDuration(59, t)
    expect(res).toEqual('59 sec')
  })

  it('should return minutes', () => {
    const res = transformDuration(65, t)
    expect(res).toEqual('1 min')
  })
})
