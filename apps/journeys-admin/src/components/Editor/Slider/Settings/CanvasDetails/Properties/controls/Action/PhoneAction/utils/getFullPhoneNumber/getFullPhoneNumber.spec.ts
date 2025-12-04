import { getFullPhoneNumber } from './getFullPhoneNumber'

describe('getFullPhoneNumber', () => {
  it('returns empty string when both parts are empty', () => {
    expect(getFullPhoneNumber('', '')).toBe('')
  })

  it('returns sanitized E.164 when local already includes a leading plus', () => {
    expect(getFullPhoneNumber('+1', '+1 (234) 567')).toBe('+1234567')
    expect(getFullPhoneNumber('', '+44 20 7123 4567')).toBe('+442071234567')
  })

  it('combines calling code and local digits into E.164', () => {
    expect(getFullPhoneNumber('+44', '2071234567')).toBe('+442071234567')
    expect(getFullPhoneNumber('+1', '234567')).toBe('+1234567')
  })

  it('normalizes calling code without plus', () => {
    expect(getFullPhoneNumber('44', '207')).toBe('+44207')
  })

  it('strips non-digits from both parts', () => {
    expect(getFullPhoneNumber('+1-', '(234) 567-')).toBe('+1234567')
  })
})
