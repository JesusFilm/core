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
        image:
          'https://d1wl257kev7hsz.cloudfront.net/cinematics/1_jf-0-0.mobileCinematicHigh.jpg',
        images: [
          {
            id: '1_jf-0-0.mobileCinematicHigh.jpg',
            mobileCinematicHigh:
              'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
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
        children: [
          {
            id: '1_jf6101-0-0',
            title: {
              id: '892b4bcc-471f-4323-9ef1-3e85c4e6ebde',
              value: 'The Beginning'
            },
            images: [
              {
                id: '1_jf6101-0-0.mobileCinematicHigh.jpg',
                mobileCinematicHigh:
                  'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6101-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
              }
            ],
            imageAlt: [
              {
                id: '383b93e5-f478-47e0-9711-e615d2316c50',
                value: 'The Beginning'
              }
            ]
          },
          {
            id: '1_jf6102-0-0',
            title: [
              {
                id: 'ccfd9ffe-710c-4f48-bb96-c539133bff5b',
                value: 'Birth of Jesus'
              }
            ],
            images: [
              {
                id: '1_jf6102-0-0.mobileCinematicHigh.jpg',
                mobileCinematicHigh:
                  'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6102-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
              }
            ],
            imageAlt: [
              {
                id: 'a24232ca-aefe-431e-a9f0-ad43316cb287',
                value: 'Birth of Jesus'
              }
            ]
          }
        ],
        studyQuestions: [
          {
            id: '2481b77c-7eff-4039-9173-d5383ebdd222',
            value: "How is the sacrifice of Jesus part of God's plan?"
          },
          {
            id: 'e22f7314-0d2f-4ef3-835f-155d41706a19',
            value:
              'How do the different groups of people respond to Jesus and His teachings?'
          },
          {
            id: '66c0d6a0-2861-4aaa-984d-47049d97292d',
            value:
              'What are some of the miracles Jesus performed? How do they affect those people?'
          },
          {
            id: '8c5cb753-a161-435e-8233-27b735d577ec',
            value: 'How do you respond to the life of Jesus?'
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
