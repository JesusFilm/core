interface Translation {
  primary: boolean
  value: string
}

interface Language {
  bcp47: string
  id: string
  iso3: string
  locale: string
  crowdinId: string
  name: Translation[]
}

const languages = [
  {
    bcp47: 'am',
    id: '4791',
    iso3: 'amh',
    locale: 'am',
    crowdinId: 'am',
    name: [
      {
        primary: true,
        value: 'ኣማርኛ'
      },
      {
        primary: false,
        value: 'Amharic'
      }
    ]
  },
  {
    bcp47: 'ar',
    id: '22658',
    iso3: 'arb',
    locale: 'ar',
    crowdinId: 'ar',
    name: [
      {
        primary: true,
        value: ' اللغة العربية'
      },
      {
        primary: false,
        value: 'Arabic, Modern Standard'
      }
    ]
  },
  {
    bcp47: 'bn-BD',
    id: '139082',
    iso3: 'ben',
    locale: 'bn',
    crowdinId: 'bn',
    name: [
      {
        primary: true,
        value: 'বাংলা'
      },
      {
        primary: false,
        value: 'Bangla Muslim'
      }
    ]
  },
  {
    bcp47: 'en',
    id: '529',
    iso3: 'eng',
    locale: 'en',
    crowdinId: 'en',
    name: [
      {
        primary: true,
        value: 'English'
      }
    ]
  },
  {
    bcp47: 'es',
    id: '21028',
    iso3: 'spa',
    locale: 'es',
    crowdinId: 'es-ES',
    name: [
      {
        primary: true,
        value: 'Español'
      },
      {
        primary: false,
        value: 'Spanish, Latin American'
      }
    ]
  },
  {
    bcp47: 'fr',
    id: '496',
    iso3: 'fra',
    locale: 'fr',
    crowdinId: 'fr',
    name: [
      {
        primary: true,
        value: 'Français'
      },
      {
        primary: false,
        value: 'French'
      }
    ]
  },
  {
    bcp47: 'hi',
    id: '6464',
    iso3: 'hin',
    locale: 'hi',
    crowdinId: 'hi',
    name: [
      {
        primary: true,
        value: 'हिन्दी'
      },
      {
        primary: false,
        value: 'Hindi'
      }
    ]
  },
  {
    bcp47: 'id',
    id: '16639',
    iso3: 'ind',
    locale: 'id',
    crowdinId: 'id',
    name: [
      {
        primary: true,
        value: 'Bahasa Indonesia'
      },
      {
        primary: false,
        value: 'Indonesian (Yesus)'
      }
    ]
  },
  {
    bcp47: 'ja',
    id: '7083',
    iso3: 'jpn',
    locale: 'ja',
    crowdinId: 'ja',
    name: [
      {
        primary: true,
        value: '日本語'
      },
      {
        primary: false,
        value: 'Japanese'
      }
    ]
  },
  {
    bcp47: 'my',
    id: '1254',
    iso3: 'mya',
    locale: 'my',
    crowdinId: 'my',
    name: [
      {
        primary: true,
        value: 'မြန်မာစာ'
      },
      {
        primary: false,
        value: 'Burmese'
      }
    ]
  },
  {
    bcp47: 'ru',
    id: '3934',
    iso3: 'rus',
    locale: 'ru',
    crowdinId: 'ru',
    name: [
      {
        primary: true,
        value: 'Русский'
      },
      {
        primary: false,
        value: 'Russian'
      }
    ]
  },
  {
    bcp47: 'th',
    id: '13169',
    iso3: 'tha',
    locale: 'th',
    crowdinId: 'th',
    name: [
      {
        primary: true,
        value: 'ภาษาไทย'
      },
      {
        primary: false,
        value: 'Thai'
      }
    ]
  },
  {
    bcp47: 'fil',
    id: '12551',
    iso3: 'tgl',
    locale: 'tl',
    crowdinId: 'tl',
    name: [
      {
        primary: true,
        value: 'Wikang Tagalog'
      },
      {
        primary: false,
        value: 'Tagalog'
      }
    ]
  },
  {
    bcp47: 'tr',
    id: '1942',
    iso3: 'tur',
    locale: 'tr',
    crowdinId: 'tr',
    name: [
      {
        primary: true,
        value: 'Türkçe'
      },
      {
        primary: false,
        value: 'Turkish'
      }
    ]
  },
  {
    bcp47: 'ur',
    id: '407',
    iso3: 'urd',
    locale: 'ur',
    crowdinId: 'ur-PK',
    name: [
      {
        primary: true,
        value: 'اُردُو'
      },
      {
        primary: false,
        value: 'Urdu'
      }
    ]
  },
  {
    bcp47: 'vi',
    id: '3887',
    iso3: 'vie',
    locale: 'vi',
    crowdinId: 'vi',
    name: [
      {
        primary: true,
        value: 'Tiếng Việt'
      },
      {
        primary: false,
        value: 'Vietnamese'
      }
    ]
  },
  {
    bcp47: 'zh-hans',
    id: '21754',
    iso3: 'cmn',
    locale: 'zh-CN',
    crowdinId: 'zh-CN',
    name: [
      {
        primary: true,
        value: '中文'
      },
      {
        primary: false,
        value: 'Chinese, Simplified'
      }
    ]
  },
  {
    bcp47: 'zh-hant',
    id: '21753',
    iso3: 'cmn',
    locale: 'zh-TW',
    crowdinId: 'zh-TW',
    name: [
      {
        primary: true,
        value: '繁體中文'
      },
      {
        primary: false,
        value: 'Chinese, Traditional'
      }
    ]
  }
]

export function getLanguageById(id: string): Language | undefined {
  return languages.find((language) => language.id === id)
}

export function getLanguageByLocale(locale: string): Language | undefined {
  return languages.find((language) => language.locale === locale)
}
