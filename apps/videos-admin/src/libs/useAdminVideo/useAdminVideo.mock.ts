import { MockedResponse } from '@apollo/client/testing'

export const useAdminVideoMock: MockedResponse<any, any> = {
  request: {
    query: null // The actual GraphQL document would be included here in a real implementation
  },
  result: {
    data: {
      adminVideo: {
        id: '1_jf-0-0',
        title: [
          {
            id: 'bb35d6a2-682e-4909-9218-4fbf5f4cd5b8',
            value: 'JESUS',
            primary: true,
            language: {
              id: '529',
              name: {
                value: 'English'
              }
            }
          }
        ],
        description: [
          {
            id: '6aef078b-6fea-4577-b440-b002a0cdeb58',
            value: 'This is a test description',
            primary: true,
            language: {
              id: '529',
              name: {
                value: 'English'
              }
            }
          }
        ],
        snippet: [
          {
            id: '7bef078b-7fea-5677-c550-c003a0cdec69',
            value: 'This is a test snippet',
            primary: true,
            language: {
              id: '529',
              name: {
                value: 'English'
              }
            }
          }
        ],
        imageAlts: [
          {
            id: '8cef078b-8fea-6777-d660-d004a0cded70',
            value: 'This is a test image alt',
            primary: true,
            language: {
              id: '529',
              name: {
                value: 'English'
              }
            }
          }
        ],
        label: 'featureFilm',
        published: true,
        slug: 'jesus'
      }
    }
  }
}
