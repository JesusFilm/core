import { getLanguageIdFromLocale } from './getLanguageIdFromLocale'

describe('getLanguageIdFromLocale', () => {
  it('should return correct language ID for valid locale', () => {
    expect(getLanguageIdFromLocale('en')).toBe('529')
    expect(getLanguageIdFromLocale('es')).toBe('21028')
    expect(getLanguageIdFromLocale('fr')).toBe('496')
    expect(getLanguageIdFromLocale('id')).toBe('16639')
    expect(getLanguageIdFromLocale('th')).toBe('13169')
    expect(getLanguageIdFromLocale('ja')).toBe('7083')
    expect(getLanguageIdFromLocale('ko')).toBe('3804')
    expect(getLanguageIdFromLocale('ru')).toBe('3934')
    expect(getLanguageIdFromLocale('tr')).toBe('1942')
    expect(getLanguageIdFromLocale('zh')).toBe('20615')
    expect(getLanguageIdFromLocale('zh-Hans-CN')).toBe('21754')
  })

  it('should return English language ID (529) for undefined locale', () => {
    expect(getLanguageIdFromLocale(undefined)).toBe('529')
  })

  it('should return English language ID (529) for null locale', () => {
    expect(getLanguageIdFromLocale(null)).toBe('529')
  })

  it('should return English language ID (529) for unsupported locale', () => {
    expect(getLanguageIdFromLocale('unsupported')).toBe('529')
  })
})
