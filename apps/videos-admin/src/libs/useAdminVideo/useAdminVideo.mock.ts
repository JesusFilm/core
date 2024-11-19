import { MockedResponse } from '@apollo/client/testing'

import {
  GET_ADMIN_VIDEO,
  GetAdminVideo,
  GetAdminVideoVariables
} from './useAdminVideo'

export const useAdminVideoMock: MockedResponse<
  GetAdminVideo,
  GetAdminVideoVariables
> = {
  request: {
    query: GET_ADMIN_VIDEO,
    variables: { videoId: 'someId' }
  },
  result: {
    data: {
      adminVideo: {
        id: '1_jf-0-0',
        slug: 'jesus',
        images: [
          {
            mobileCinematicHigh:
              'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf-0-0.mobileCinematicHigh.jpg'
          }
        ],
        imageAlt: [
          {
            id: 'e53b7688-f286-4743-983d-e8dacce35ad9',
            value: 'JESUS'
          }
        ],
        title: [
          {
            id: 'bb35d6a2-682e-4909-9218-4fbf5f4cd5b8',
            value: 'JESUS'
          }
        ],
        description: [
          {
            id: 'c1afff2e-057e-4e4a-a48c-11f005ffbb06',
            value: 'Jesus description text'
          }
        ],
        snippet: [
          {
            id: 'f4634713-33c2-43b6-b2e1-47263037c871',
            value: 'Jesus snippet text'
          }
        ],
        label: 'featureFilm',
        variantLanguagesCount: 2150,
        published: true,
        noIndex: false
      }
    }
  }
}
