interface Language {
  id: string
  locale: string
  twoLettersCode: string
}

const locales = [
  {
    id: '4791', // Amharic
    locale: 'am-ET',
    twoLettersCode: 'am'
  },
  {
    id: '22658', // Arabic
    locale: 'ar-SA',
    twoLettersCode: 'ar'
  },
  {
    id: '139082', // Bangla
    locale: 'bn-BD',
    twoLettersCode: 'bn'
  },
  {
    id: '529', // English
    locale: 'en',
    twoLettersCode: 'en'
  },
  {
    id: '21028', // Spanish
    locale: 'es-ES',
    twoLettersCode: 'es'
  },
  {
    id: '496', // French
    locale: 'fr-FR',
    twoLettersCode: 'fr'
  },
  {
    id: '6464', // Hindi
    locale: 'hi-IN',
    twoLettersCode: 'hi'
  },
  {
    id: '16639', // Indonesian
    locale: 'id-ID',
    twoLettersCode: 'id'
  },
  {
    id: '7083', // Japanese
    locale: 'ja-JP',
    twoLettersCode: 'ja'
  },
  {
    id: '1254', // Burmese
    locale: 'my-MM',
    twoLettersCode: 'my'
  },
  {
    id: '3934', // Russian
    locale: 'ru-RU',
    twoLettersCode: 'ru'
  },
  {
    id: '13169', // Thai
    locale: 'th-TH',
    twoLettersCode: 'th'
  },
  {
    id: '12551', // Tagalog
    locale: 'tl-PH',
    twoLettersCode: 'tl'
  },
  {
    id: '1942', // Turkish
    locale: 'tr-TR',
    twoLettersCode: 'tr'
  },
  {
    id: '407', // Urdu (Pakistan)
    locale: 'ur-PK',
    twoLettersCode: 'ur'
  },
  {
    id: '3887', // Vietnamese
    locale: 'vi-VN',
    twoLettersCode: 'vi'
  },
  {
    id: '21754', // Chinese, Simplified
    locale: 'zh-CN',
    twoLettersCode: 'zh-CN'
  },
  {
    id: '21753', // Chinese, Traditional
    locale: 'zh-TW',
    twoLettersCode: 'zh-TW'
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
      return locale.twoLettersCode === searchValue
    }
  })
}
