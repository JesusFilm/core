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
    localName: 'Español',
    nativeName: 'Spanish',
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
    localName: 'Français',
    nativeName: 'French',
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
    localName: 'Bahasa Indonesia',
    nativeName: 'Indonesian',
    languageSlugs: ['indonesian-yesus.html', 'indonesian-isa.html'],
    geoLocations: [
      'ID', // Indonesia
      'TL' // Timor-Leste (East Timor)
    ],
    languageId: '16639'
  },
  th: {
    locale: 'th',
    localName: 'ไทย',
    nativeName: 'Thai',
    languageSlugs: ['thai.html', 'thai-southern.html', 'thai-northern.html'],
    geoLocations: [
      'TH' // Thailand
    ],
    languageId: '13169'
  },
  ja: {
    locale: 'ja',
    localName: '日本語',
    nativeName: 'Japanese',
    languageSlugs: ['japanese.html', 'japanese-sign-language.html'],
    geoLocations: [
      'JP' // Japan
    ],
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
    geoLocations: [
      'KR', // South Korea
      'KP' // North Korea
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
    localName: 'Türkçe',
    nativeName: 'Turkish',
    languageSlugs: ['turkish.html'],
    geoLocations: [
      'TR', // Turkey
      'CY' // Cyprus
    ],
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
    geoLocations: [
      'TW', // Taiwan
      'HK', // Hong Kong
      'MO' // Macau
    ],
    languageId: '20615'
  },
  'zh-Hans-CN': {
    locale: 'zh-Hans-CN',
    localName: '中文',
    nativeName: 'Simplified Chinese',
    languageSlugs: ['chinese-simplified.html'],
    geoLocations: [
      'CN', // China
      'SG', // Singapore
      'MY' // Malaysia
    ],
    languageId: '21754'
  }
}

export const SUPPORTED_LOCALES = Object.keys(LANGUAGE_MAPPINGS)
