import { GetLanguages_languages } from '../../../__generated__/GetLanguages'

export const languages: GetLanguages_languages[] = [
  {
    __typename: 'Language',
    id: '529',
    name: [
      { __typename: 'LanguageName', value: 'English', primary: true },
      { __typename: 'LanguageName', value: 'English', primary: false }
    ]
  },
  {
    __typename: 'Language',
    id: '2',
    name: [
      { __typename: 'LanguageName', value: 'French', primary: true },
      { __typename: 'LanguageName', value: 'Francais', primary: false }
    ]
  },
  {
    __typename: 'Language',
    id: '3',
    name: [{ __typename: 'LanguageName', value: 'Chinese', primary: true }]
  },
  {
    __typename: 'Language',
    id: '4',
    name: [{ __typename: 'LanguageName', value: 'Arabic', primary: true }]
  },
  {
    __typename: 'Language',
    id: '5',
    name: [{ __typename: 'LanguageName', value: 'German', primary: true }]
  },
  {
    __typename: 'Language',
    id: '6',
    name: [{ __typename: 'LanguageName', value: 'Hindi', primary: true }]
  },
  {
    __typename: 'Language',
    id: '7',
    name: [{ __typename: 'LanguageName', value: 'Zulu', primary: true }]
  },
  {
    __typename: 'Language',
    id: '8',
    name: [{ __typename: 'LanguageName', value: 'Sara', primary: true }]
  },
  {
    __typename: 'Language',
    id: '9',
    name: [{ __typename: 'LanguageName', value: 'Ngulu', primary: true }]
  },
  {
    __typename: 'Language',
    id: '10',
    name: [{ __typename: 'LanguageName', value: 'Vietnamese', primary: true }]
  },
  {
    __typename: 'Language',
    id: '11',
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
