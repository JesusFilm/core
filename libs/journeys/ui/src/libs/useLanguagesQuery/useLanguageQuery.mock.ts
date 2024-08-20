import { MockedResponse } from '@apollo/client/testing'
import {
  GetLanguages,
  GetLanguagesVariables,
  GetLanguages_languages
} from './__generated__/GetLanguages'
import { GET_LANGUAGES } from './useLanguagesQuery'

export const languages: GetLanguages_languages[] = [
  {
    __typename: 'Language',
    id: '529',
    name: [
      {
        value: 'English',
        primary: true,
        __typename: 'LanguageName'
      }
    ]
  },
  {
    id: '496',
    __typename: 'Language',
    name: [
      {
        value: 'Français',
        primary: true,
        __typename: 'LanguageName'
      },
      {
        value: 'French',
        primary: false,
        __typename: 'LanguageName'
      }
    ]
  },
  {
    id: '1106',
    __typename: 'Language',
    name: [
      {
        value: 'Deutsch',
        primary: true,
        __typename: 'LanguageName'
      },
      {
        value: 'German, Standard',
        primary: false,
        __typename: 'LanguageName'
      }
    ]
  }
]

export const getLanguagesMock: MockedResponse<
  GetLanguages,
  GetLanguagesVariables
> = {
  request: {
    query: GET_LANGUAGES,
    variables: {
      languageId: '529'
    }
  },
  result: {
    data: {
      languages: languages
    }
  }
}
