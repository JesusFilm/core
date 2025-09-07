export const DEFAULT_LOCALE = 'en'

export type LocaleMapping = {
  // The locale used for string translations
  locale: string
  // Language audio translations for videos from languageSlugs
  // ordering is important for language selection - earlier values are prioritized
  languageSlugs: string[]
  // Language ID for the locale
  languageId: string
  // Language name for the locale
  localName: string
  // Native language name for the locale
  nativeName: string
}

export const LANGUAGE_MAPPINGS: Record<string, LocaleMapping> = {
  en: {
    locale: 'en',
    localName: 'English',
    nativeName: 'English',
    languageSlugs: ['english.html'],
    languageId: '529'
  },
  es: {
    locale: 'es',
    localName: 'Español',
    nativeName: 'Spanish',
    languageSlugs: ['spanish-latin-american.html', 'spanish-castilian.html'],
    languageId: '21028'
  },
  fr: {
    locale: 'fr',
    localName: 'Français',
    nativeName: 'French',
    languageSlugs: ['french.html', 'french-african.html'],
    languageId: '496'
  },
  id: {
    locale: 'id',
    localName: 'Bahasa Indonesia',
    nativeName: 'Indonesian',
    languageSlugs: ['indonesian-yesus.html', 'indonesian-isa.html'],
    languageId: '16639'
  },
  th: {
    locale: 'th',
    localName: 'ไทย',
    nativeName: 'Thai',
    languageSlugs: ['thai.html', 'thai-southern.html', 'thai-northern.html'],
    languageId: '13169'
  },
  ja: {
    locale: 'ja',
    localName: '日本語',
    nativeName: 'Japanese',
    languageSlugs: ['japanese.html', 'japanese-sign-language.html'],
    languageId: '7083'
  },
  ko: {
    locale: 'ko',
    localName: '한국어',
    nativeName: 'Korean',
    languageSlugs: [
      'korean.html',
      'korean-sign-language.html',
      'korean-north.html'
    ],
    languageId: '3804'
  },
  ru: {
    locale: 'ru',
    localName: 'Русский',
    nativeName: 'Russian',
    languageSlugs: [
      'russian.html',
      'central-asian-russian.html',
      'russian-sign-language.html'
    ],
    languageId: '3934'
  },
  tr: {
    locale: 'tr',
    localName: 'Türkçe',
    nativeName: 'Turkish',
    languageSlugs: ['turkish.html'],
    languageId: '1942'
  },
  zh: {
    locale: 'zh',
    localName: '繁體中文',
    nativeName: 'Traditional Chinese',
    languageSlugs: [
      'chinese-mandarin.html',
      'chinese-traditional.html',
      'chinese-hokkien-amoy.html'
    ],
    languageId: '20615'
  },
  'zh-Hans-CN': {
    locale: 'zh-Hans-CN',
    localName: '中文',
    nativeName: 'Simplified Chinese',
    languageSlugs: ['chinese-simplified.html'],
    languageId: '21754'
  }
}

export const SUPPORTED_LOCALES = Object.keys(LANGUAGE_MAPPINGS)
