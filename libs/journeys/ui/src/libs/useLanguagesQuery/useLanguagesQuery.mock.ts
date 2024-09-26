import { MockedResponse } from '@apollo/client/testing'

import {
  GetLanguages,
  GetLanguagesVariables
} from './__generated__/GetLanguages'

import { GET_LANGUAGES } from '.'

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
      languages: [
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
        }
      ]
    }
  }
}
