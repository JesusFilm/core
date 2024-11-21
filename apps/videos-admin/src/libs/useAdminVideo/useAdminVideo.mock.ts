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
            title: [
              {
                id: '892b4bcc-471f-4323-9ef1-3e85c4e6ebde',
                value: 'The Beginning'
              }
            ],
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
        variants: [
          {
            id: '1_4334-jf-0-0',
            slug: 'jesus/munukutuba',
            downloads: [
              {
                id: '529a0228-67ce-4b08-bc78-cecf1b7ec358',
                quality: 'high',
                size: 2248469346,
                height: 360,
                width: 640,
                url: 'https://arc.gt/4d9ez'
              },
              {
                id: 'de3c0487-1ab5-488e-b4f0-03001e21579c',
                quality: 'low',
                size: 197621170,
                height: 180,
                width: 320,
                url: 'https://arc.gt/f4rc6'
              }
            ],
            language: {
              id: '4334',
              name: [
                {
                  value: 'Munukutuba'
                }
              ],
              slug: 'munukutuba'
            }
          },
          {
            id: '1_19558-jf-0-0',
            slug: 'jesus/kom',
            downloads: [
              {
                id: 'fe363739-adb1-4871-be5b-97d3e7871038',
                quality: 'high',
                size: 2248493878,
                height: 360,
                width: 640,
                url: 'https://arc.gt/rfjdj'
              },
              {
                id: 'd04e8895-e9db-4e80-8f40-f666028ba06f',
                quality: 'low',
                size: 197627995,
                height: 180,
                width: 320,
                url: 'https://arc.gt/v5okf'
              }
            ],
            language: {
              id: '19558',
              name: [
                {
                  value: 'Kom'
                }
              ],
              slug: 'kom'
            }
          }
        ],
        subtitles: [
          {
            id: '97c4bc0e-6a2d-4650-9b60-91b99293ba1b',
            edition: 'jltib',
            vttSrc:
              'https://d389zwyrhi20m0.cloudfront.net/529/1_jf-0-0/0-0-JLtib-529-31474.vtt',
            srtSrc:
              'https://d389zwyrhi20m0.cloudfront.net/529/1_jf-0-0/0-0-JLtib-529-31474.srt',
            value:
              'https://d389zwyrhi20m0.cloudfront.net/529/1_jf-0-0/0-0-JLtib-529-31474.vtt',
            language: {
              id: '529',
              name: [
                {
                  value: 'English'
                }
              ],
              slug: 'english'
            }
          },
          {
            id: 'ffc10f33-d24b-4011-85c3-f7e448323b52',
            edition: 'jlnoci',
            vttSrc:
              'https://d389zwyrhi20m0.cloudfront.net/529/1_jf-0-0/0-0-JLnoCI-529-31474.vtt',
            srtSrc:
              'https://d389zwyrhi20m0.cloudfront.net/529/1_jf-0-0/0-0-JLnoCI-529-31474.srt',
            value:
              'https://d389zwyrhi20m0.cloudfront.net/529/1_jf-0-0/0-0-JLnoCI-529-31474.vtt',
            language: {
              id: '529',
              name: [
                {
                  value: 'English'
                }
              ],
              slug: 'english'
            }
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
