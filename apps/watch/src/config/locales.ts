export const DEFAULT_LOCALE = 'en'

export type LocaleMapping = {
  // The locale used for string translations
  locale: string
  // Language audio translations for videos
  languageSlugs: string[]
  // Geolocation codes for the locale
  geoLocations: string[]
}

export const LANGUAGE_MAPPINGS: Record<string, LocaleMapping> = {
  en: {
    locale: 'en',
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
    ]
  },
  es: {
    locale: 'es',
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
    ]
  },
  fr: {
    locale: 'fr',
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
    ]
  },
  id: {
    locale: 'id',
    languageSlugs: ['indonesian-yesus.html', 'indonesian-isa.html'],
    geoLocations: [
      'ID', // Indonesia
      'TL' // Timor-Leste (East Timor)
    ]
  },
  th: {
    locale: 'th',
    languageSlugs: ['thai.html', 'thai-southern.html', 'thai-northern.html'],
    geoLocations: [
      'TH' // Thailand
    ]
  },
  ja: {
    locale: 'ja',
    languageSlugs: ['japanese.html', 'japanese-sign-language.html'],
    geoLocations: [
      'JP' // Japan
    ]
  },
  ko: {
    locale: 'ko',
    languageSlugs: [
      'korean.html',
      'korean-sign-language.html',
      'korean-north.html'
    ],
    geoLocations: [
      'KR', // South Korea
      'KP' // North Korea
    ]
  },
  ru: {
    locale: 'ru',
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
    ]
  },
  tr: {
    locale: 'tr',
    languageSlugs: ['turkish.html'],
    geoLocations: [
      'TR', // Turkey
      'CY' // Cyprus
    ]
  },
  zh: {
    locale: 'zh',
    languageSlugs: [
      'chinese-mandarin.html',
      'chinese-traditional.html',
      'chinese-hokkien-amoy.html'
    ],
    geoLocations: [
      'TW', // Taiwan
      'HK', // Hong Kong
      'MO' // Macau
    ]
  },
  'zh-Hans-CN': {
    locale: 'zh-Hans-CN',
    languageSlugs: ['chinese-simplified.html'],
    geoLocations: [
      'CN', // China
      'SG', // Singapore
      'MY' // Malaysia
    ]
  }
}

export const SUPPORTED_LOCALES = Object.keys(LANGUAGE_MAPPINGS)
