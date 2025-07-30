import { MockedResponse } from '@apollo/client/testing'

import { GetAllLanguages } from '../../../__generated__/GetAllLanguages'

import { GET_ALL_LANGUAGES } from './LanguageSwitchDialog'

export const getAllLanguagesMock: MockedResponse<GetAllLanguages> = {
  request: {
    query: GET_ALL_LANGUAGES
  },
  result: {
    data: {
      languages: [
        {
          __typename: 'Language',
          id: '529',
          bcp47: 'en',
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
          id: '496',
          bcp47: 'es',
          slug: 'spanish',
          name: [
            {
              value: 'Español',
              primary: true,
              __typename: 'LanguageName'
            },
            {
              value: 'Spanish',
              primary: false,
              __typename: 'LanguageName'
            }
          ]
        },
        {
          __typename: 'Language',
          id: '1106',
          bcp47: 'de',
          slug: 'german-standard',
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
        },
        {
          __typename: 'Language',
          id: '4415',
          bcp47: 'fr',
          slug: 'french',
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
          __typename: 'Language',
          id: '6464',
          bcp47: 'hi',
          slug: 'hindi',
          name: [
            {
              value: 'हिन्दी',
              primary: true,
              __typename: 'LanguageName'
            },
            {
              value: 'Hindi',
              primary: false,
              __typename: 'LanguageName'
            }
          ]
        },
        {
          __typename: 'Language',
          id: '7083',
          bcp47: 'ja',
          slug: 'japanese',
          name: [
            {
              value: '日本語',
              primary: true,
              __typename: 'LanguageName'
            },
            {
              value: 'Japanese',
              primary: false,
              __typename: 'LanguageName'
            }
          ]
        }
      ]
    }
  }
}
