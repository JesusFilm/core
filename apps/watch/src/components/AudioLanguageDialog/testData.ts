import { videos } from '../Videos/__generated__/testData'

import { GET_LANGUAGES_SLUG } from './AudioLanguageDialog'

export const getLanguagesSlugMock = {
  request: {
    query: GET_LANGUAGES_SLUG,
    variables: {
      id: videos[0].id
    }
  },
  result: {
    data: {
      video: {
        variantLanguagesWithSlug: [
          {
            __typename: 'LanguageWithSlug',
            slug: 'jesus/auhelawa',
            language: {
              id: '529',
              __typename: 'Language',
              name: [
                {
                  value: "'Auhelawa",
                  primary: true,
                  __typename: 'Translation'
                }
              ]
            }
          },
          {
            __typename: 'LanguageWithSlug',
            slug: 'jesus/a-hmao',
            language: {
              id: '496',
              __typename: 'Language',
              name: [
                {
                  value: 'A-Hmao',
                  primary: true,
                  __typename: 'Translation'
                },
                {
                  value: 'A-Hmao',
                  primary: false,
                  __typename: 'Translation'
                }
              ]
            }
          },
          {
            __typename: 'LanguageWithSlug',
            slug: 'jesus/aari',
            language: {
              id: '1106',
              __typename: 'Language',
              name: [
                {
                  value: 'Aari',
                  primary: true,
                  __typename: 'Translation'
                },
                {
                  value: 'Aari',
                  primary: false,
                  __typename: 'Translation'
                }
              ]
            }
          }
        ]
      }
    }
  }
}
