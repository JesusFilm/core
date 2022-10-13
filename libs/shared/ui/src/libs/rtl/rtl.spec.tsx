import { isRtl } from '.'

describe('isRtl', () => {
  it('should return true for rtl locales', () => {
    expect(isRtl('ar')).toBe(true)
    expect(isRtl('ar-aao')).toBe(true)
    expect(isRtl('AR')).toBe(true)
    expect(isRtl('AR-AAO')).toBe(true)

    expect(isRtl('arc')).toBe(true)
    expect(isRtl('dv')).toBe(true)
    expect(isRtl('fa')).toBe(true)
    expect(isRtl('ha')).toBe(true)
    expect(isRtl('he')).toBe(true)
    expect(isRtl('ar')).toBe(true)
    expect(isRtl('khw')).toBe(true)
    expect(isRtl('ks')).toBe(true)
    expect(isRtl('ku')).toBe(true)
    expect(isRtl('ps')).toBe(true)
    expect(isRtl('ur')).toBe(true)
    expect(isRtl('yi')).toBe(true)
  })

  it('should return false by default', () => {
    expect(isRtl('en')).toBe(false)
    expect(isRtl('EN')).toBe(false)
    expect(isRtl('en-us')).toBe(false)
    expect(isRtl('123')).toBe(false)
    expect(isRtl('aao-ar')).toBe(false)
    expect(isRtl('ar_')).toBe(false)
    expect(isRtl('arr')).toBe(false)
    expect(isRtl('')).toBe(false)
  })
})
