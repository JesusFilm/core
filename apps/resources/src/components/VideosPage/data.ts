import { GetLanguages_languages } from '../../../__generated__/GetLanguages'

export const languages: GetLanguages_languages[] = [
  {
    __typename: 'Language',
    slug: 'english',
    id: '529',
    name: [
      { __typename: 'LanguageName', value: 'English', primary: true },
      { __typename: 'LanguageName', value: 'English', primary: false }
    ]
  },
  {
    __typename: 'Language',
    id: '2',
    slug: 'french',
    name: [
      { __typename: 'LanguageName', value: 'French', primary: true },
      { __typename: 'LanguageName', value: 'Francais', primary: false }
    ]
  },
  {
    __typename: 'Language',
    id: '3',
    slug: 'chineese',
    name: [{ __typename: 'LanguageName', value: 'Chinese', primary: true }]
  },
  {
    __typename: 'Language',
    id: '4',
    slug: 'arabic',
    name: [{ __typename: 'LanguageName', value: 'Arabic', primary: true }]
  },
  {
    __typename: 'Language',
    id: '5',
    slug: 'german',
    name: [{ __typename: 'LanguageName', value: 'German', primary: true }]
  },
  {
    __typename: 'Language',
    id: '6',
    slug: 'hindi',
    name: [{ __typename: 'LanguageName', value: 'Hindi', primary: true }]
  },
  {
    __typename: 'Language',
    id: '7',
    slug: 'zulu',
    name: [{ __typename: 'LanguageName', value: 'Zulu', primary: true }]
  },
  {
    __typename: 'Language',
    id: '8',
    slug: 'sara',
    name: [{ __typename: 'LanguageName', value: 'Sara', primary: true }]
  },
  {
    __typename: 'Language',
    id: '9',
    slug: 'ngulu',
    name: [{ __typename: 'LanguageName', value: 'Ngulu', primary: true }]
  },
  {
    __typename: 'Language',
    id: '10',
    slug: 'vietnamese',
    name: [{ __typename: 'LanguageName', value: 'Vietnamese', primary: true }]
  },
  {
    __typename: 'Language',
    id: '11',
    slug: 'greek',
    name: [{ __typename: 'LanguageName', value: 'Greek', primary: true }]
  }
]
export const filter = {
  availableVariantLanguageIds: [
    languages[0].id,
    languages[1].id,
    languages[2].id
  ]
}

export const bigFilter = {
  availableVariantLanguageIds: languages.map(({ id }) => id)
}
