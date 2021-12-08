import { localesData } from './localesData'

interface Locale {
  locale: string
  nativeName: string
  englishName: string
  region?: string
}

interface SelectOption {
  value: string
  label: string
}

export const locales: { [key: string]: Locale } = localesData

export const getLocaleOptions = (): SelectOption[] =>
  Object.keys(locales).map((locale) => getLocaleOption(locale))

export const getLocaleOption = (locale: string): SelectOption => {
  const l = locales[locale] ?? locales['en-US']
  return { value: l.locale, label: getEnglishLocaleLabel(l) }
}

// This may vary for different languages in future
export const getEnglishLocaleLabel = (l: Locale): string => {
  return `${l.englishName} (${l.locale.split('-')[1]})`
}
