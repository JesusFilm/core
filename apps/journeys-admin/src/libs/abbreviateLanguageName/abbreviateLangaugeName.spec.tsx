import { abbreviateLanguageName } from './abbreviateLanguageName'

describe('abbreviateLanguageName', () => {
  it('should return the value with abbreviation if value has special character', () => {
    expect(abbreviateLanguageName('English, United States')).toBe(
      'English (US)'
    )
    expect(abbreviateLanguageName('English: United States')).toBe(
      'English (US)'
    )
    expect(abbreviateLanguageName('English (United States)')).toBe(
      'English (US)'
    )
  })

  it('should return the original string with abbreviation for inputs with multiple words after special character', () => {
    expect(abbreviateLanguageName('Kalagan, Tugukalu Kalua')).toBe(
      'Kalagan (TK)'
    )
    expect(abbreviateLanguageName('Kalagan: Tugukalu Kalua')).toBe(
      'Kalagan (TK)'
    )
    expect(abbreviateLanguageName('Kalagan (Tugukalu Kalua)')).toBe(
      'Kalagan (TK)'
    )
  })

  it('should return the original string without modification for inputs with no words after special character', () => {
    expect(abbreviateLanguageName('Kalagan Takalu')).toBe('Kalagan Takalu')
  })

  it('should return undefined for undefined inputs', () => {
    expect(abbreviateLanguageName(undefined)).toBeUndefined()
  })
})
