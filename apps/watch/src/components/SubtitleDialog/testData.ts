import { videos } from '../Videos/__generated__/testData'

import { GET_SUBTITLES } from './SubtitleDialog'

export const getSubtitleMock = {
  request: {
    query: GET_SUBTITLES,
    variables: {
      id: videos[0].variant?.slug
    }
  },
  result: {
    data: {
      video: {
        variant: {
          subtitle: [
            {
              __typename: 'Translation',
              language: {
                __typename: 'Language',
                bcp47: 'ar',
                id: '22658',
                name: [
                  {
                    __typename: 'Translation',
                    value: ' اللغة العربية',
                    primary: true
                  },
                  {
                    __typename: 'Translation',
                    value: 'Arabic, Modern Standard',
                    primary: false
                  }
                ]
              },
              value:
                'https://d389zwyrhi20m0.cloudfront.net/22658/1_jf6119-0-0/0-0-OT6119-22658-32426.vtt'
            }
          ]
        }
      }
    }
  }
}
