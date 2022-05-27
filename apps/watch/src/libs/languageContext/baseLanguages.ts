// these are pulled from languages api. Some main languages are missing. This is a temporary fix until the language api is swapped to bcp47 ids
export const languages = [
  {
    id: '529',
    name: [
      {
        value: 'English',
        primary: true
      }
    ],
    bcp47: 'en'
  },
  {
    id: '22658',
    name: [
      {
        value: ' اللغة العربية',
        primary: true
      },
      {
        value: 'Arabic, Modern Standard',
        primary: false
      }
    ],
    bcp47: 'ar'
  },
  {
    id: '1106',
    name: [
      {
        value: 'Deutsch',
        primary: true
      },
      {
        value: 'German, Standard',
        primary: false
      }
    ],
    bcp47: 'de'
  },
  {
    id: '6788',
    bcp47: 'fa',
    iso3: 'pes',
    name: [
      {
        value: 'فارسی',
        primary: true
      },
      {
        value: 'Farsi, Western',
        primary: false
      }
    ]
  },
  {
    id: '496',
    name: [
      {
        value: 'Français',
        primary: true
      },
      {
        value: 'French',
        primary: false
      }
    ],
    bcp47: 'fr'
  },
  {
    id: '6930',
    name: [
      {
        value: 'עברית',
        primary: true
      },
      {
        value: 'Hebrew',
        primary: false
      }
    ],
    bcp47: 'he'
  },
  {
    id: '6464',
    name: [
      {
        value: 'हिन्दी',
        primary: true
      },
      {
        value: 'Hindi',
        primary: false
      }
    ],
    bcp47: 'hi'
  },
  {
    id: '16639',
    name: [
      {
        value: 'Bahasa Indonesia',
        primary: true
      },
      {
        value: 'Indonesian (Yesus)',
        primary: false
      }
    ],
    bcp47: 'id'
  },
  {
    id: '7083',
    name: [
      {
        value: '日本語',
        primary: true
      },
      {
        value: 'Japanese',
        primary: false
      }
    ],
    bcp47: 'ja'
  },
  {
    id: '3804',
    name: [
      {
        value: '한국어',
        primary: true
      },
      {
        value: 'Korean',
        primary: false
      }
    ],
    bcp47: 'ko'
  },
  {
    id: '584',
    bcp47: 'pt',
    iso3: 'por',
    name: [
      {
        value: 'Português',
        primary: true
      },
      {
        value: 'Portuguese, Brazil',
        primary: false
      }
    ]
  },
  {
    id: '3934',
    bcp47: 'ru',
    iso3: 'rus',
    name: [
      {
        value: 'Русский',
        primary: true
      },
      {
        value: 'Russian',
        primary: false
      }
    ]
  },
  {
    id: '1942',
    bcp47: 'tr',
    iso3: 'tur',
    name: [
      {
        value: 'Türkçe',
        primary: true
      },
      {
        value: 'Turkish',
        primary: false
      }
    ]
  },
  {
    id: '407',
    bcp47: 'ur',
    iso3: 'urd',
    name: [
      {
        value: 'اُردُو',
        primary: true
      },
      {
        value: 'Urdu',
        primary: false
      }
    ]
  },
  {
    id: '3887',
    bcp47: 'vi',
    iso3: 'vie',
    name: [
      {
        value: 'Tiếng Việt',
        primary: true
      },
      {
        value: 'Vietnamese',
        primary: false
      }
    ]
  }
]
