import { videos } from '../Videos/testData'
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
            slug: 'jesus/english',
            language: {
              id: '529',
              __typename: 'Language',
              name: [
                {
                  value: 'English',
                  primary: true,
                  __typename: 'Translation'
                }
              ]
            }
          },
          {
            __typename: 'LanguageWithSlug',
            slug: 'jesus/french',
            language: {
              id: '496',
              __typename: 'Language',
              name: [
                {
                  value: 'Français',
                  primary: true,
                  __typename: 'Translation'
                },
                {
                  value: 'French',
                  primary: false,
                  __typename: 'Translation'
                }
              ]
            }
          },
          {
            __typename: 'LanguageWithSlug',
            slug: 'jesus/Deutsch',
            language: {
              id: '1106',
              __typename: 'Language',
              name: [
                {
                  value: 'Deutsch',
                  primary: true,
                  __typename: 'Translation'
                },
                {
                  value: 'German, Standard',
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
