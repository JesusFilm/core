export const DEFAULT_LOCALE = 'en'

export type LocaleMapping = {
  locale: string
  files: string[]
  countries: string[]
}

export const LANGUAGE_MAPPINGS: Record<string, LocaleMapping> = {
  en: {
    locale: 'en',
    files: ['english.html', 'eng.html'],
    countries: ['US', 'GB', 'AU', 'CA']
  },
  es: {
    locale: 'es',
    files: ['spanish.html', 'español.html', 'espanol.html'],
    countries: ['ES', 'MX', 'AR', 'CO', 'PE']
  },
  fr: {
    locale: 'fr',
    files: ['french.html', 'français.html', 'francais.html'],
    countries: ['FR', 'BE']
  },
  id: {
    locale: 'id',
    files: ['indonesian.html'],
    countries: ['ID']
  },
  th: {
    locale: 'th',
    files: ['thai.html'],
    countries: ['TH']
  },
  ja: {
    locale: 'ja',
    files: ['japanese.html'],
    countries: ['JP', 'JA']
  },
  ko: {
    locale: 'ko',
    files: ['korean.html'],
    countries: ['KR', 'KO']
  },
  ru: {
    locale: 'ru',
    files: ['russian.html', 'русский.html'],
    countries: ['RU']
  },
  tr: {
    locale: 'tr',
    files: ['turkish.html'],
    countries: ['TR']
  },
  zh: {
    locale: 'zh',
    files: ['chinese.html', 'mandarin.html'],
    countries: ['CN', 'TW', 'HK']
  },
  'zh-Hans-CN': {
    locale: 'zh-Hans-CN',
    files: ['chinese-simplified.html'],
    countries: ['SG']
  }
}

export const SUPPORTED_LOCALES = Object.keys(LANGUAGE_MAPPINGS)
