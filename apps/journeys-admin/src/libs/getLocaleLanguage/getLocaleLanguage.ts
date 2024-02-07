interface Language {
  id: string
  locale: string
}

const locales = [
  {
    id: '4791', // Amharic
    locale: 'am-ET'
  },
  {
    id: '22658', // Arabic
    locale: 'ar-SA'
  },
  {
    id: '139082', // Bangla
    locale: 'bn-BD'
  },
  {
    id: '529', // English
    locale: 'en'
  },
  {
    id: '21028', // Spanish
    locale: 'es-ES'
  },
  {
    id: '496', // French
    locale: 'fr-FR'
  },
  {
    id: '6464', // Hindi
    locale: 'hi-IN'
  },
  {
    id: '16639', // Indonesian
    locale: 'id-ID'
  },
  {
    id: '7083', // Japanese
    locale: 'ja-JP'
  },
  {
    id: '1254', // Burmese
    locale: 'my-MM'
  },
  {
    id: '3934', // Russian
    locale: 'ru-RU'
  },
  {
    id: '13169', // Thai
    locale: 'th-TH'
  },
  {
    id: '12551', // Tagalog
    locale: 'tl-PH'
  },
  {
    id: '1942', // Turkish
    locale: 'tr-TR'
  },
  {
    id: '407', // Urdu (Pakistan)
    locale: 'ur-PK'
  },
  {
    id: '3887', // Vietnamese
    locale: 'vi-VN'
  },
  {
    id: '21754', // Chinese, Simplified
    locale: 'zh-CN'
  },
  {
    id: '21753', // Chinese, Traditional
    locale: 'zh-TW'
  }
]

export function getLocaleLanguage(
  type: 'id' | 'locale',
  searchValue: string
): Language | undefined {
  return locales.find((locale) => {
    if (type === 'id') {
      return locale.id === searchValue
    } else {
      return locale.locale === searchValue
    }
  })
}
