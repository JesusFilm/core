import { MockedResponse } from '@apollo/client/testing'

import {
  GetLanguagesSlug,
  GetLanguagesSlugVariables
} from '../../../__generated__/GetLanguagesSlug'
import { videos } from '../../components/Videos/__generated__/testData'

import { GET_LANGUAGES_SLUG } from './useLanguagesSlugQuery'

export const getLanguagesSlugMock: MockedResponse<
  GetLanguagesSlug,
  GetLanguagesSlugVariables
> = {
  request: {
    query: GET_LANGUAGES_SLUG,
    variables: {
      id: videos[0].id
    }
  },
  result: {
    data: {
      video: {
        __typename: 'Video',
        variantLanguagesWithSlug: [
          {
            __typename: 'LanguageWithSlug',
            slug: 'jesus/auhelawa',
            language: {
              id: '529',
              slug: 'en',
              __typename: 'Language',
              name: [
                {
                  value: "'Auhelawa",
                  primary: true,
                  __typename: 'LanguageName'
                }
              ]
            }
          },
          {
            __typename: 'LanguageWithSlug',
            slug: 'jesus/a-hmao',
            language: {
              id: '496',
              slug: 'a-hmao',
              __typename: 'Language',
              name: [
                {
                  value: 'A-Hmao',
                  primary: true,
                  __typename: 'LanguageName'
                },
                {
                  value: 'A-Hmao',
                  primary: false,
                  __typename: 'LanguageName'
                }
              ]
            }
          },
          {
            __typename: 'LanguageWithSlug',
            slug: 'jesus/aari',
            language: {
              id: '1106',
              slug: 'aari',
              __typename: 'Language',
              name: [
                {
                  value: 'Aari',
                  primary: true,
                  __typename: 'LanguageName'
                },
                {
                  value: 'Aari',
                  primary: false,
                  __typename: 'LanguageName'
                }
              ]
            }
          }
        ]
      }
    }
  }
}
