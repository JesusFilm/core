import axios, { isAxiosError } from 'axios'

import { graphql } from '@core/shared/gql'

import { getClient } from '../../../test/client'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
const mockedIsAxiosError = isAxiosError as jest.MockedFunction<
  typeof isAxiosError
>

jest.mock('@apollo/client', () => ({
  ApolloClient: jest.fn().mockImplementation(() => ({
    query: jest.fn()
  })),
  InMemoryCache: jest.fn(),
  createHttpLink: jest.fn()
}))

describe('youtube', () => {
  const client = getClient()

  describe('entity', () => {
    const YOUTUBE = graphql(`
      query Youtube {
        _entities(
          representations: [
            { __typename: "Youtube", id: "testId", primaryLanguageId: null }
          ]
        ) {
          ... on Youtube {
            id
          }
        }
      }
    `)

    it('should return youtube video', async () => {
      const data = await client({
        document: YOUTUBE
      })
      expect(data).toHaveProperty('data._entities[0]', {
        id: 'testId'
      })
    })
  })

  describe('getYouTubeClosedCaptionLanguageIds', () => {
    const GET_YOUTUBE_CLOSED_CAPTION_LANGUAGE_IDS = graphql(`
      query GetYouTubeClosedCaptionLanguageIds($videoId: ID!) {
        getYouTubeClosedCaptionLanguageIds(videoId: $videoId) {
          id
          bcp47
          name {
            value
            primary
          }
        }
      }
    `)

    const originalEnv = {
      ...process.env
    }

    beforeEach(() => {
      jest.clearAllMocks()
      process.env.FIREBASE_API_KEY = 'test-api-key'
      process.env.GATEWAY_URL = 'http://test-gateway'
      process.env.INTEROP_TOKEN = 'test-token'
      process.env.SERVICE_VERSION = '1.0.0'
      process.env.NODE_ENV = 'test'
      mockedIsAxiosError.mockReturnValue(false)
    })

    afterEach(() => {
      Object.assign(process.env, originalEnv)
    })

    it('should return YouTube closed caption language IDs successfully', async () => {
      const mockYouTubeResponse = {
        data: {
          items: [
            {
              snippet: {
                language: 'en',
                trackKind: 'standard'
              }
            },
            {
              snippet: {
                language: 'es',
                trackKind: 'standard'
              }
            },
            {
              snippet: {
                language: 'fr',
                trackKind: 'asr'
              }
            }
          ]
        }
      }

      const mockGatewayResponse = {
        data: {
          languages: [
            {
              id: '529',
              bcp47: 'en',
              name: [
                {
                  value: 'English',
                  primary: true
                }
              ]
            },
            {
              id: '530',
              bcp47: 'es',
              name: [
                {
                  value: 'Spanish',
                  primary: true
                }
              ]
            }
          ]
        }
      }

      mockedAxios.get.mockResolvedValueOnce(mockYouTubeResponse)

      const mockApolloQuery = jest
        .fn()
        .mockResolvedValueOnce(mockGatewayResponse)
      const { ApolloClient } = require('@apollo/client')
      ApolloClient.mockImplementation(() => ({
        query: mockApolloQuery
      }))

      const data = await client({
        document: GET_YOUTUBE_CLOSED_CAPTION_LANGUAGE_IDS,
        variables: { videoId: 'test-video-id' }
      })

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.googleapis.com/youtube/v3/captions?part=snippet&key=test-api-key&videoId=test-video-id'
      )

      expect(mockApolloQuery).toHaveBeenCalledWith({
        query: expect.any(Object),
        variables: {
          where: {
            bcp47: ['en', 'es']
          }
        }
      })

      expect(data).toHaveProperty('data.getYouTubeClosedCaptionLanguageIds', [
        {
          id: '529',
          bcp47: 'en',
          name: [
            {
              value: 'English',
              primary: true
            }
          ]
        },
        {
          id: '530',
          bcp47: 'es',
          name: [
            {
              value: 'Spanish',
              primary: true
            }
          ]
        }
      ])
    })

    it('should return empty array when no standard captions are available', async () => {
      const mockYouTubeResponse = {
        data: {
          items: [
            {
              snippet: {
                language: 'en',
                trackKind: 'asr'
              }
            }
          ]
        }
      }

      mockedAxios.get.mockResolvedValueOnce(mockYouTubeResponse)

      const data = await client({
        document: GET_YOUTUBE_CLOSED_CAPTION_LANGUAGE_IDS,
        variables: { videoId: 'test-video-id' }
      })

      expect(data).toHaveProperty('data.getYouTubeClosedCaptionLanguageIds', [])
    })

    it('should return empty array when YouTube API returns no items', async () => {
      const mockYouTubeResponse = {
        data: {
          items: []
        }
      }

      mockedAxios.get.mockResolvedValueOnce(mockYouTubeResponse)

      const data = await client({
        document: GET_YOUTUBE_CLOSED_CAPTION_LANGUAGE_IDS,
        variables: { videoId: 'test-video-id' }
      })

      expect(data).toHaveProperty('data.getYouTubeClosedCaptionLanguageIds', [])
    })

    it('should throw error when api key is missing', async () => {
      // Clear the API key
      delete process.env.FIREBASE_API_KEY

      const data = await client({
        document: GET_YOUTUBE_CLOSED_CAPTION_LANGUAGE_IDS,
        variables: { videoId: 'test-video-id' }
      })

      expect(data).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'YouTube API key is not configured',
          extensions: {
            code: 'INTERNAL_SERVER_ERROR'
          }
        })
      ])
    })

    it('should return mock data when YouTube API quota is exceeded in non-production', async () => {
      const mockError = {
        response: {
          status: 403,
          data: {
            error: {
              errors: [
                {
                  reason: 'quotaExceeded'
                }
              ]
            }
          }
        }
      }

      mockedIsAxiosError.mockReturnValue(true)
      mockedAxios.get.mockRejectedValueOnce(mockError)

      const data = await client({
        document: GET_YOUTUBE_CLOSED_CAPTION_LANGUAGE_IDS,
        variables: { videoId: 'test-video-id' }
      })

      expect(data).toHaveProperty('data.getYouTubeClosedCaptionLanguageIds', [
        {
          id: '529',
          bcp47: 'en',
          name: [
            {
              value: 'English',
              primary: true
            }
          ]
        }
      ])
    })

    it('should throw GraphQLError when YouTube API quota is exceeded in production', async () => {
      process.env.NODE_ENV = 'production'

      const mockError = {
        response: {
          status: 403,
          data: {
            error: {
              errors: [
                {
                  reason: 'quotaExceeded'
                }
              ]
            }
          }
        }
      }

      mockedIsAxiosError.mockReturnValue(true)
      mockedAxios.get.mockRejectedValueOnce(mockError)

      const data = await client({
        document: GET_YOUTUBE_CLOSED_CAPTION_LANGUAGE_IDS,
        variables: { videoId: 'test-video-id' }
      })

      expect(data).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'YouTube API quota exceeded. Please try again later.',
          extensions: {
            code: 'QUOTA_EXCEEDED'
          }
        })
      ])
    })

    it('should throw GraphQLError when YouTube API returns general error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            error: {
              message: 'Bad Request'
            }
          }
        }
      }

      mockedIsAxiosError.mockReturnValue(true)
      mockedAxios.get.mockRejectedValueOnce(mockError)

      const data = await client({
        document: GET_YOUTUBE_CLOSED_CAPTION_LANGUAGE_IDS,
        variables: { videoId: 'test-video-id' }
      })

      expect(data).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Failed to fetch YouTube closed caption language IDs',
          extensions: {
            code: 'EXTERNAL_SERVICE_ERROR'
          }
        })
      ])
    })

    it('should throw GraphQLError when gateway API fails', async () => {
      const mockYouTubeResponse = {
        data: {
          items: [
            {
              snippet: {
                language: 'en',
                trackKind: 'standard'
              }
            }
          ]
        }
      }

      mockedAxios.get.mockResolvedValueOnce(mockYouTubeResponse)

      const mockApolloQuery = jest
        .fn()
        .mockRejectedValueOnce(new Error('Gateway error'))
      const { ApolloClient } = require('@apollo/client')
      ApolloClient.mockImplementation(() => ({
        query: mockApolloQuery
      }))

      const data = await client({
        document: GET_YOUTUBE_CLOSED_CAPTION_LANGUAGE_IDS,
        variables: { videoId: 'test-video-id' }
      })

      expect(data).toHaveProperty('errors', [
        expect.objectContaining({
          message: 'Failed to fetch languages from gateway',
          extensions: {
            code: 'INTERNAL_SERVER_ERROR'
          }
        })
      ])
    })
  })
})
