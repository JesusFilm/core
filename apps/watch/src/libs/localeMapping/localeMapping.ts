export const DEFAULT_LOCALE = 'en'

export type LocaleMapping = {
  // The locale used for string translations
  // /watch/next-i18next.config.js
  locale: string
  // Language audio translations for videos from languageSlugs
  // /apis/api-languages/src/__generated__/languageSlugs.ts
  // ordering is important for language selection - earlier values are prioritized
  languageSlugs: string[]
  // Geolocation codes for the locale
  // https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2a
  geoLocations: string[]
  // Language ID for the locale
  languageId: string
  // Language name for the locale
  nativeName: string
  // English language name for the locale
  englishName: string
}

export const LANGUAGE_MAPPINGS: Record<string, LocaleMapping> = {
  en: {
    locale: 'en',
    nativeName: 'English',
    englishName: 'English',
    languageSlugs: ['english.html'],
    geoLocations: [
      'US', // United States
      'GB', // United Kingdom
      'AU', // Australia
      'CA', // Canada
      'NZ', // New Zealand
      'IE', // Ireland
      'ZA', // South Africa
      'IN' // India
    ],
    languageId: '529'
  },
  es: {
    locale: 'es',
    nativeName: 'Español',
    englishName: 'Spanish, Latin American',
    languageSlugs: ['spanish-latin-american.html', 'spanish-castilian.html'],
    geoLocations: [
      'ES', // Spain
      'MX', // Mexico
      'AR', // Argentina
      'CO', // Colombia
      'PE', // Peru
      'CL', // Chile
      'VE', // Venezuela
      'EC', // Ecuador
      'GT', // Guatemala
      'CU', // Cuba
      'BO', // Bolivia
      'DO', // Dominican Republic
      'HN', // Honduras
      'PY', // Paraguay
      'SV', // El Salvador
      'NI', // Nicaragua
      'CR', // Costa Rica
      'PA', // Panama
      'UY', // Uruguay
      'PR', // Puerto Rico
      'GQ' // Equatorial Guinea
    ],
    languageId: '21028'
  },
  fr: {
    locale: 'fr',
    nativeName: 'Français',
    englishName: 'French',
    languageSlugs: ['french.html', 'french-african.html'],
    geoLocations: [
      'FR', // France
      'BE', // Belgium
      'CH', // Switzerland
      'LU', // Luxembourg
      'MC', // Monaco
      'CD', // Democratic Republic of the Congo
      'CI', // Côte d'Ivoire (Ivory Coast)
      'CM', // Cameroon
      'MG', // Madagascar
      'SN', // Senegal
      'BF', // Burkina Faso
      'BJ', // Benin
      'NE', // Niger
      'ML', // Mali
      'RW', // Rwanda
      'BI', // Burundi
      'GN', // Guinea
      'HT' // Haiti
    ],
    languageId: '496'
  },
  id: {
    locale: 'id',
    nativeName: 'Bahasa Indonesia',
    englishName: 'Indonesian',
    languageSlugs: ['indonesian-yesus.html', 'indonesian-isa.html'],
    geoLocations: [
      'ID', // Indonesia
      'TL' // Timor-Leste (East Timor)
    ],
    languageId: '16639'
  },
  th: {
    locale: 'th',
    nativeName: 'ไทย',
    englishName: 'Thai',
    languageSlugs: ['thai.html', 'thai-southern.html', 'thai-northern.html'],
    geoLocations: [
      'TH' // Thailand
    ],
    languageId: '13169'
  },
  ja: {
    locale: 'ja',
    nativeName: '日本語',
    englishName: 'Japanese',
    languageSlugs: ['japanese.html', 'japanese-sign-language.html'],
    geoLocations: [
      'JP' // Japan
    ],
    languageId: '7083'
  },
  ko: {
    locale: 'ko',
    nativeName: '한국어',
    englishName: 'Korean',
    languageSlugs: [
      'korean.html',
      'korean-sign-language.html',
      'korean-north.html'
    ],
    geoLocations: [
      'KR', // South Korea
      'KP' // North Korea
    ],
    languageId: '3804'
  },
  ru: {
    locale: 'ru',
    nativeName: 'Русский',
    englishName: 'Russian',
    languageSlugs: [
      'russian.html',
      'central-asian-russian.html',
      'russian-sign-language.html'
    ],
    geoLocations: [
      'RU', // Russia
      'BY', // Belarus
      'KZ', // Kazakhstan
      'KG', // Kyrgyzstan
      'MD', // Moldova
      'UA', // Ukraine
      'UZ', // Uzbekistan
      'TJ', // Tajikistan
      'TM' // Turkmenistan
    ],
    languageId: '3934'
  },
  tr: {
    locale: 'tr',
    nativeName: 'Türkçe',
    englishName: 'Turkish',
    languageSlugs: ['turkish.html'],
    geoLocations: [
      'TR', // Turkey
      'CY' // Cyprus
    ],
    languageId: '1942'
  },
  zh: {
    locale: 'zh',
    nativeName: '繁體中文',
    englishName: 'Traditional Chinese',
    languageSlugs: [
      'chinese-mandarin.html',
      'chinese-traditional.html',
      'chinese-hokkien-amoy.html'
    ],
    geoLocations: [
      'TW', // Taiwan
      'HK', // Hong Kong
      'MO' // Macau
    ],
    languageId: '20615'
  },
  'zh-Hans-CN': {
    locale: 'zh-Hans-CN',
    nativeName: '中文',
    englishName: 'Simplified Chinese',
    languageSlugs: ['chinese-simplified.html'],
    geoLocations: [
      'CN', // China
      'SG', // Singapore
      'MY' // Malaysia
    ],
    languageId: '21754'
  },
  'tl': {
    locale: 'tl',
    localName: 'Tagalog',
    nativeName: 'Filipino',
    languageSlugs: ['tagalog.html'],
    geoLocations: ['PH'],
    languageId: '12551'
  }
}

export const SUPPORTED_LOCALES = Object.keys(LANGUAGE_MAPPINGS)
