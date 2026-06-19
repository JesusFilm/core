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
      languageId: '529',
      where: {
        hasVideos: true
      }
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
          __typename: 'Language',
          id: '528',
          slug: 'spanish',
          name: [
            {
              value: 'Spanish',
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
