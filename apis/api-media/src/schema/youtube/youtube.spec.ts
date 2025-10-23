import axios, { isAxiosError } from 'axios'

import { graphql } from '@core/shared/gql'
import { createApolloClient } from '@core/yoga/apolloClient'

import { getClient } from '../../../test/client'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
const mockedIsAxiosError = isAxiosError as jest.MockedFunction<
  typeof isAxiosError
>

jest.mock('@core/yoga/apolloClient', () => ({
  createApolloClient: jest.fn()
}))

const mockedCreateApolloClient = createApolloClient as jest.MockedFunction<
  typeof createApolloClient
>

describe('youtube', () => {
  const client = getClient({
    headers: {
      authorization: 'token'
    }
  })

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

  describe('youtubeClosedCaptionLanguages', () => {
    const YOUTUBE_CLOSED_CAPTION_LANGUAGES = graphql(`
      query YoutubeClosedCaptionLanguages($videoId: ID!) {
        youtubeClosedCaptionLanguages(videoId: $videoId) {
          ... on QueryYoutubeClosedCaptionLanguagesSuccess {
            data {
              id
            }
          }
          ... on Error {
            message
          }
          ... on ZodError {
            message
            fieldErrors {
              message
              path
            }
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
      mockedCreateApolloClient.mockReturnValue({
        query: mockApolloQuery
      } as any)

      const data = await client({
        document: YOUTUBE_CLOSED_CAPTION_LANGUAGES,
        variables: { videoId: 'test-video-id' }
      })

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=test-video-id',
        {
          headers: {
            'X-Goog-Api-Key': 'test-api-key'
          }
        }
      )

      expect(mockedCreateApolloClient).toHaveBeenCalledWith('api-media')
      expect(mockApolloQuery).toHaveBeenCalledWith({
        query: expect.any(Object),
        variables: {
          select: {
            id: true
          },
          where: {
            bcp47: ['en', 'es']
          }
        }
      })

      expect(data).toHaveProperty('data.youtubeClosedCaptionLanguages.data', [
        {
          id: '529'
        },
        {
          id: '530'
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
        document: YOUTUBE_CLOSED_CAPTION_LANGUAGES,
        variables: { videoId: 'test-video-id' }
      })

      expect(data).toHaveProperty('data.youtubeClosedCaptionLanguages.data', [])
    })

    it('should return empty array when YouTube API returns no items', async () => {
      const mockYouTubeResponse = {
        data: {
          items: []
        }
      }

      mockedAxios.get.mockResolvedValueOnce(mockYouTubeResponse)

      const data = await client({
        document: YOUTUBE_CLOSED_CAPTION_LANGUAGES,
        variables: { videoId: 'test-video-id' }
      })

      expect(data).toHaveProperty('data.youtubeClosedCaptionLanguages.data', [])
    })

    it('should throw error when api key is missing', async () => {
      // Clear the API key
      delete process.env.FIREBASE_API_KEY

      const data = await client({
        document: YOUTUBE_CLOSED_CAPTION_LANGUAGES,
        variables: { videoId: 'test-video-id' }
      })

      expect(data).toHaveProperty(
        'data.youtubeClosedCaptionLanguages.message',
        'YouTube API key is not configured'
      )
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
        document: YOUTUBE_CLOSED_CAPTION_LANGUAGES,
        variables: { videoId: 'test-video-id' }
      })

      expect(data).toHaveProperty('data.youtubeClosedCaptionLanguages.data', [
        {
          id: '529'
        }
      ])
    })

    it('should throw Error when YouTube API returns general error', async () => {
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
        document: YOUTUBE_CLOSED_CAPTION_LANGUAGES,
        variables: { videoId: 'test-video-id' }
      })

      expect(data).toHaveProperty(
        'data.youtubeClosedCaptionLanguages.message',
        'Failed to fetch YouTube closed caption language IDs'
      )
    })

    it('should throw Error when gateway API fails', async () => {
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
      mockedCreateApolloClient.mockReturnValue({
        query: mockApolloQuery
      } as any)

      const data = await client({
        document: YOUTUBE_CLOSED_CAPTION_LANGUAGES,
        variables: { videoId: 'test-video-id' }
      })

      expect(data).toHaveProperty(
        'data.youtubeClosedCaptionLanguages.message',
        'Failed to fetch languages from gateway'
      )
    })

    it('should throw error if response does not match validation schema', async () => {
      const invalidYouTubeResponse = {
        data: {
          items: [
            {
              // Missing required 'snippet' property
              id: 'invalid-item'
            },
            {
              snippet: {
                // Missing required 'language' property
                trackKind: 'standard'
              }
            },
            {
              snippet: {
                language: 'en',
                // Invalid trackKind value
                trackKind: 'invalid-track-kind'
              }
            }
          ]
        }
      }

      mockedAxios.get.mockResolvedValueOnce(invalidYouTubeResponse)

      const data = await client({
        document: YOUTUBE_CLOSED_CAPTION_LANGUAGES,
        variables: { videoId: 'test-video-id' }
      })

      expect(data).toHaveProperty(
        'data.youtubeClosedCaptionLanguages.message',
        'Invalid YouTube API response format'
      )
    })
  })
})
