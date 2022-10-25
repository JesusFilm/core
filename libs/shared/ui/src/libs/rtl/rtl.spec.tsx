import { getLocaleRTL } from '.'

describe('getLocaleRTL', () => {
  it('should return true for rtl locales', () => {
    expect(getLocaleRTL('ar')).toBe(true)
    expect(getLocaleRTL('ar-aao')).toBe(true)
    expect(getLocaleRTL('AR')).toBe(true)
    expect(getLocaleRTL('AR-AAO')).toBe(true)

    expect(getLocaleRTL('arc')).toBe(true)
    expect(getLocaleRTL('dv')).toBe(true)
    expect(getLocaleRTL('fa')).toBe(true)
    expect(getLocaleRTL('ha')).toBe(true)
    expect(getLocaleRTL('he')).toBe(true)
    expect(getLocaleRTL('ar')).toBe(true)
    expect(getLocaleRTL('khw')).toBe(true)
    expect(getLocaleRTL('ks')).toBe(true)
    expect(getLocaleRTL('ku')).toBe(true)
    expect(getLocaleRTL('ps')).toBe(true)
    expect(getLocaleRTL('ur')).toBe(true)
    expect(getLocaleRTL('yi')).toBe(true)
  })

  it('should return false by default', () => {
    expect(getLocaleRTL('en')).toBe(false)
    expect(getLocaleRTL('EN')).toBe(false)
    expect(getLocaleRTL('en-us')).toBe(false)
    expect(getLocaleRTL('123')).toBe(false)
    expect(getLocaleRTL('aao-ar')).toBe(false)
    expect(getLocaleRTL('ar_')).toBe(false)
    expect(getLocaleRTL('arr')).toBe(false)
    expect(getLocaleRTL('')).toBe(false)
  })
})
