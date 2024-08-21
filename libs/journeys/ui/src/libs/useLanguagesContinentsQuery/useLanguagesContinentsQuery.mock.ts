import { MockedResponse } from '@apollo/client/testing'

import {
  GetLanguagesContinents,
  GetLanguagesContinents_languages,
  GetLanguagesContinents_languages_countryLanguages
} from './__generated__/GetLanguagesContinents'
import { GET_LANGUAGES_CONTINENTS } from './useLanguagesContinentsQuery'

const countryLanguages: GetLanguagesContinents_languages_countryLanguages[] = [
  {
    __typename: 'CountryLanguage',
    country: {
      __typename: 'Country',
      continent: {
        __typename: 'Continent',
        id: 'Europe'
      }
    }
  }
]

const languagesContinents: GetLanguagesContinents_languages[] = [
  {
    __typename: 'Language',
    id: '529',
    name: [
      {
        value: 'English',
        __typename: 'LanguageName'
      }
    ],
    countryLanguages
  },
  {
    id: '496',
    __typename: 'Language',
    name: [
      {
        value: 'Français',
        __typename: 'LanguageName'
      },
      {
        value: 'French',
        __typename: 'LanguageName'
      }
    ],
    countryLanguages
  },
  {
    id: '1106',
    __typename: 'Language',
    name: [
      {
        value: 'Deutsch',
        __typename: 'LanguageName'
      },
      {
        value: 'German, Standard',
        __typename: 'LanguageName'
      }
    ],
    countryLanguages
  }
]

export const getLanguagesContinentsMock: MockedResponse<GetLanguagesContinents> =
  {
    request: {
      query: GET_LANGUAGES_CONTINENTS
    },
    result: {
      data: {
        languages: languagesContinents
      }
    }
  }
