import { getPreferredLocaleFromLanguages, mapToSupportedLocale } from './usePreferredLocale'

describe('mapToSupportedLocale', () => {
  it('returns an exact supported locale match', () => {
    expect(mapToSupportedLocale('es')).toBe('es')
  })

  it('matches case insensitive locales', () => {
    expect(mapToSupportedLocale('ES')).toBe('es')
  })

  it('maps locales with underscores', () => {
    expect(mapToSupportedLocale('en_US')).toBe('en')
  })

  it('returns a locale based on geographic region', () => {
    expect(mapToSupportedLocale('zh-CN')).toBe('zh-Hans-CN')
    expect(mapToSupportedLocale('zh-TW')).toBe('zh')
  })

  it('falls back to base language when region is unsupported', () => {
    expect(mapToSupportedLocale('fr-CA')).toBe('fr')
  })

  it('returns undefined when locale cannot be mapped', () => {
    expect(mapToSupportedLocale('xx-YY')).toBeUndefined()
  })
})

describe('getPreferredLocaleFromLanguages', () => {
  it('returns the first supported locale', () => {
    expect(
      getPreferredLocaleFromLanguages(['de-DE', 'fr-FR', 'es-ES'])
    ).toBe('fr')
  })

  it('returns undefined when no languages can be mapped', () => {
    expect(getPreferredLocaleFromLanguages(['de-DE', 'it-IT'])).toBeUndefined()
  })

  it('prefers locales with available geo mappings', () => {
    expect(
      getPreferredLocaleFromLanguages(['zh-CN', 'zh-TW'])
    ).toBe('zh-Hans-CN')
  })
})
