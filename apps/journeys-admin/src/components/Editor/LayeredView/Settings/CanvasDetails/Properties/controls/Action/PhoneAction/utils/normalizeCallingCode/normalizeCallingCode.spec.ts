import { normalizeCallingCode } from './normalizeCallingCode'

describe('normalizeCallingCode', () => {
  it('returns empty string when input is empty', () => {
    expect(normalizeCallingCode('')).toBe('')
  })

  it('returns the same value when input already starts with +', () => {
    expect(normalizeCallingCode('+1')).toBe('+1')
    expect(normalizeCallingCode('+44')).toBe('+44')
  })

  it('prefixes + when input does not start with +', () => {
    expect(normalizeCallingCode('1')).toBe('+1')
    expect(normalizeCallingCode('44')).toBe('+44')
    expect(normalizeCallingCode('123')).toBe('+123')
  })
})
