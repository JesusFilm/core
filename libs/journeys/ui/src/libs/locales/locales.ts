interface Locale {
  locale: string
  language: string
  region: string
}

interface SelectOption {
  value: string
  label: string
}

export const locales: { [key: string]: Locale } = {
  'en-US': {
    locale: 'en-US',
    language: 'English',
    region: 'US'
  },
  'en-NZ': {
    locale: 'en-NZ',
    language: 'English',
    region: 'NZ'
  }
}

export const getLocaleOptions = (): SelectOption[] =>
  Object.keys(locales).map((locale) => getLocaleOption(locale))

export const getLocaleOption = (locale: string): SelectOption => {
  const l = locales[locale] ?? locales['en-US']
  return { value: l.locale, label: getLocaleLabel(l) }
}

// This may vary for different languages in future
export const getLocaleLabel = (l: Locale): string => {
  return `${l.language} (${l.region})`
}
