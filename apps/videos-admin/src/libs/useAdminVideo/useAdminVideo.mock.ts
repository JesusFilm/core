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
        label: 'episode',
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
            value:
              "This film is a perfect introduction to Jesus through the Gospel of Luke. Jesus constantly surprises and confounds people, from His miraculous birth to His rise from the grave. Follow His life through excerpts from the Book of Luke, all the miracles, the teachings, and the passion. &#13;&#13;God creates everything and loves mankind. But mankind disobeys God. God and mankind are separated, but God loves mankind so much, He arranges redemption for mankind. He sends his Son Jesus to be a perfect sacrifice to make amends for us.&#13;&#13;Before Jesus arrives, God prepares mankind. Prophets speak of the birth, the life, and the death of Jesus.&#13;&#13;Jesus attracts attention. He teaches in parables no one really understands, gives sight to the blind, and helps those who no one sees as worth helping.&#13;&#13;He scares the Jewish leaders, they see him as a threat. So they arrange, through Judas the traitor and their Roman oppressors, for the crucifixion of Jesus. They think the matter is settled. But the women who serve Jesus discover an empty tomb. The disciples panic. When Jesus appears, they doubt He's real. But it's what He proclaimed all along: He is their perfect sacrifice, their Savior, victor over death. He ascends to heaven, telling His followers to tell others about Him and His teachings.",
            id: '41f0dad1-f2b4-4850-8ebe-c60e3ca1e64f'
          }
        ],
        label: 'featureFilm',
        variantLanguagesCount: 2150,
        published: true
      }
    }
  }
}
