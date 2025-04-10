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
        locked: false,
        images: [
          {
            id: '1_jf-0-0.mobileCinematicHigh.jpg',
            mobileCinematicHigh:
              'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95',
            url: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf-0-0.mobileCinematicHigh.jpg'
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
            id: '6aef078b-6fea-4577-b440-b002a0cdeb58',
            value:
              "This film is a perfect introduction to Jesus through the Gospel of Luke. Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion. &#13;&#13;God creates everything and loves mankind. But mankind disobeys God. God and mankind are separated, but God loves mankind so much, He arranges redemption for mankind. He sends his Son Jesus to be a perfect sacrifice to make amends for us.&#13;&#13;Before Jesus arrives, God prepares mankind. Prophets speak of the birth, the life, and the death of Jesus.&#13;&#13;Jesus attracts attention. He teaches in parables no one really understands, gives sight to the blind, and helps those who no one sees as worth helping.&#13;&#13;He scares the Jewish leaders, they see him as a threat. So they arrange, through Judas the traitor and their Roman oppressors, for the crucifixion of Jesus. They think the matter is settled. But the women who serve Jesus discover an empty tomb. The disciples panic. When Jesus appears, they doubt He's real. But it's what He proclaimed all along: He is their perfect sacrifice, their Savior, victor over death. He ascends to heaven, telling His followers to tell others about Him and His teachings."
          }
        ],
        snippet: [
          {
            id: 'e3645175-c05b-4760-a0ac-fdcb894655be',
            value:
              'Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion.'
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
          },
          {
            id: '1_jf6103-0-0',
            title: [
              {
                id: '0dea1010-9fc3-4680-b4c2-6f700c9a0fd6',
                value: 'Childhood of Jesus'
              }
            ],
            images: [
              {
                id: '1_jf6103-0-0.mobileCinematicHigh.jpg',
                mobileCinematicHigh:
                  'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/1_jf6103-0-0.mobileCinematicHigh.jpg/f=jpg,w=1280,h=600,q=95'
              }
            ],
            imageAlt: [
              {
                id: 'eb26c30e-c2f9-480d-8187-f00fcb3fe149',
                value: 'Childhood of Jesus'
              }
            ]
          }
        ],
        variants: [
          {
            id: '1_4334-jf-0-0',
            videoId: '1_jf-0-0',
            slug: 'jesus/munukutuba',
            videoEdition: {
              id: 'edition.id',
              name: 'base'
            },
            hls: 'https://arc.gt/hls/munukutuba/master.m3u8',
            downloads: [
              {
                id: 'download-id',
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
                  value: 'Munukutuba',
                  primary: true
                }
              ],
              slug: 'munukutuba'
            }
          },
          {
            id: '1_19558-jf-0-0',
            videoId: '1_jf-0-0',
            slug: 'jesus/kom',
            videoEdition: {
              id: 'edition.id',
              name: 'base'
            },
            hls: 'https://arc.gt/hls/kom/master.m3u8',
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
                  value: 'Kom',
                  primary: true
                }
              ],
              slug: 'kom'
            }
          },
          {
            id: '1_529-jf-0-0',
            videoId: '1_jf-0-0',
            slug: 'jesus/english',
            videoEdition: {
              id: 'edition.id',
              name: 'base'
            },
            hls: 'https://arc.gt/hls/english/master.m3u8',
            downloads: [
              {
                id: '5f6dae80-87eb-4db1-9af1-07ddf8d9ca63',
                quality: 'high',
                size: 2358523707,
                height: 720,
                width: 1280,
                url: 'https://arc.gt/7geui'
              },
              {
                id: '94c28c5c-21ec-4393-84a2-864fcb328a23',
                quality: 'low',
                size: 207141494,
                height: 240,
                width: 426,
                url: 'https://arc.gt/y1s23'
              }
            ],
            language: {
              id: '529',
              name: [
                {
                  value: 'English',
                  primary: true
                }
              ],
              slug: 'english'
            }
          }
        ],
        videoEditions: [
          {
            id: 'edition.id',
            name: 'base',
            videoSubtitles: [
              {
                id: 'subtitle1.id',
                vttSrc:
                  'https://d389zwyrhi20m0.cloudfront.net/529/1_jf-0-0/0-0-JLtib-529-31474.vtt',
                srtSrc:
                  'https://d389zwyrhi20m0.cloudfront.net/529/1_jf-0-0/0-0-JLtib-529-31474.srt',
                value:
                  'https://d389zwyrhi20m0.cloudfront.net/529/1_jf-0-0/0-0-JLtib-529-31474.vtt',
                vttAsset: { id: 'vtt-asset-id-1' },
                srtAsset: { id: 'srt-asset-id-1' },
                vttVersion: 1,
                srtVersion: 1,
                language: {
                  id: '529',
                  name: [
                    {
                      value: 'English',
                      primary: true
                    }
                  ],
                  slug: 'english'
                },
                primary: true
              },
              {
                id: 'subtitle2.id',
                vttSrc:
                  'https://d389zwyrhi20m0.cloudfront.net/496/1_jf-0-0/0-0-JL-496-31801.vtt',
                srtSrc:
                  'https://d389zwyrhi20m0.cloudfront.net/496/1_jf-0-0/0-0-JL-496-31801.srt',
                value:
                  'https://d389zwyrhi20m0.cloudfront.net/496/1_jf-0-0/0-0-JL-496-31801.vtt',
                vttAsset: { id: 'vtt-asset-id-1' },
                srtAsset: { id: 'srt-asset-id-1' },
                vttVersion: 1,
                srtVersion: 1,
                language: {
                  id: '496',
                  name: [
                    {
                      value: 'Français',
                      primary: true
                    },
                    {
                      value: 'French',
                      primary: false
                    }
                  ],
                  slug: 'french'
                },
                primary: false
              }
            ]
          },
          {
            id: 'edition.id2',
            name: 'base',
            videoSubtitles: [
              {
                id: 'subtitle2.id',
                vttSrc:
                  'https://d389zwyrhi20m0.cloudfront.net/496/1_jf-0-0/0-0-JL-496-31801.vtt',
                srtSrc:
                  'https://d389zwyrhi20m0.cloudfront.net/496/1_jf-0-0/0-0-JL-496-31801.srt',
                value:
                  'https://d389zwyrhi20m0.cloudfront.net/496/1_jf-0-0/0-0-JL-496-31801.vtt',
                vttAsset: { id: 'vtt-asset-id-2' },
                srtAsset: { id: 'srt-asset-id-2' },
                vttVersion: 1,
                srtVersion: 1,
                language: {
                  id: '496',
                  name: [
                    {
                      value: 'Français',
                      primary: true
                    },
                    {
                      value: 'French',
                      primary: false
                    }
                  ],
                  slug: 'french'
                },
                primary: false
              }
            ]
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
            vttAsset: { id: 'vtt-asset-id-1' },
            srtAsset: { id: 'srt-asset-id-1' },
            vttVersion: 1,
            srtVersion: 1,
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
            vttAsset: { id: 'vtt-asset-id-2' },
            srtAsset: { id: 'srt-asset-id-2' },
            vttVersion: 1,
            srtVersion: 1,
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
            id: 'f9817d7e-389f-44ef-8b29-12d75f1ef68f',
            edition: 'otwcc',
            vttSrc:
              'https://d389zwyrhi20m0.cloudfront.net/529/1_jf-0-0/0-0-OTwCC-529-31474.vtt',
            srtSrc:
              'https://d389zwyrhi20m0.cloudfront.net/529/1_jf-0-0/0-0-OTwCC-529-31474.srt',
            value:
              'https://d389zwyrhi20m0.cloudfront.net/529/1_jf-0-0/0-0-OTwCC-529-31474.vtt',
            vttAsset: { id: 'vtt-asset-id-3' },
            srtAsset: { id: 'srt-asset-id-3' },
            vttVersion: 1,
            srtVersion: 1,
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
