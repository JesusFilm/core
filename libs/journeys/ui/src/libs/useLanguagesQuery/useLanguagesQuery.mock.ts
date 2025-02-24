import { MockedResponse } from '@apollo/client/testing'

import {
  GetLanguagesQuery,
  GetLanguagesQueryVariables
} from './__generated__/useLanguagesQuery'

import { GET_LANGUAGES } from '.'

export const getLanguagesMock: MockedResponse<
  GetLanguagesQuery,
  GetLanguagesQueryVariables
> = {
  request: {
    query: GET_LANGUAGES,
    variables: {
      languageId: '529'
    }
  },
  result: {
    data: {
      languages: [
        {
          __typename: 'Language',
          id: '529',
          slug: 'english',
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
          slug: 'french',
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
        }
      ]
    }
  }
}
