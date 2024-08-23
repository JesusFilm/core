import algoliasearch from 'algoliasearch'

import { VideoVariant } from '.prisma/api-videos-client'

import { prismaMock } from '../../../../test/prismaMock'

import { GET_LANGUAGES, apollo } from './service'

import { service } from '.'

const saveObjectsSpy = jest
  .fn()
  .mockReturnValue({ wait: jest.fn().mockResolvedValue({}) })

const initIndexSpy = jest.fn().mockReturnValue({
  saveObjects: saveObjectsSpy
})

jest.mock('@apollo/client', () => {
  const originalModule = jest.requireActual('@apollo/client')
  return {
    ...originalModule,
    __esModule: true,
    ApolloClient: jest.fn().mockImplementation(() => ({
      query: jest.fn().mockResolvedValue({
        data: {
          languages: [
            {
              id: '21754',
              name: [
                {
                  value: 'Chinese, Simplified',
                  primary: false,
                  language: {
                    id: '529'
                  }
                },
                {
                  value: '简体中文',
                  primary: true,
                  language: {
                    id: '21754'
                  }
                }
              ]
            }
          ]
        }
      })
    })),
    InMemoryCache: jest.fn()
  }
})

jest.mock('algoliasearch', () => {
  return jest.fn().mockImplementation(() => {
    return {
      initIndex: initIndexSpy
    }
  })
})

const mockAlgoliaSearch = algoliasearch as jest.MockedFunction<
  typeof algoliasearch
>

describe('algolia/service', () => {
  let originalEnv

  beforeEach(() => {
    originalEnv = process.env
    process.env = {
      ...originalEnv
    }
    jest.resetModules()
  })

  afterAll(() => {
    process.env = originalEnv
    jest.resetAllMocks()
  })

  describe('service', () => {
    it('should throw if no API key', async () => {
      await expect(service()).rejects.toThrow(
        'algolia environment variables not set'
      )
    })

    it('should sync videos to Algolia', async () => {
      process.env.ALGOLIA_API_KEY = 'key'
      process.env.ALGOLIA_APPLICATION_ID = 'id'
      process.env.ALGOLIA_INDEX = 'video-variants'
      prismaMock.videoVariant.findMany
        .mockResolvedValueOnce([
          {
            id: 'id',
            videoId: 'videoId',
            video: {
              title: [{ value: 'title' }],
              description: [{ value: 'description' }],
              label: 'label',
              image: 'image',
              imageAlt: [{ value: 'imageAlt', languageId: '529' }],
              childIds: ['childId']
            },
            duration: 100,
            languageId: '21754',
            subtitle: [{ languageId: 'subtitle' }],
            slug: 'slug'
          } as unknown as VideoVariant
        ])
        .mockResolvedValueOnce([])

      await service()
      expect(apollo.query).toHaveBeenCalledWith({ query: GET_LANGUAGES })
      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
        take: 1000,
        skip: 0,
        include: {
          video: {
            include: {
              title: true,
              description: true,
              imageAlt: true,
              snippet: true
            }
          },
          subtitle: true
        },
        where: {
          languageId: {
            in: [
              '529', // English
              '9999', // Tula
              '21046', // Spanish, Castilian
              '21028', // Spanish, Latin American
              '21753', // Chinese, Traditional
              '21754', // Chinese, Simplified
              '20615', // Chinese, Mandarin
              '20601' // Chinese, Cantonese
            ]
          }
        }
      })
      expect(mockAlgoliaSearch).toHaveBeenCalledWith('id', 'key')
      expect(initIndexSpy).toHaveBeenCalledWith('video-variants')
      expect(saveObjectsSpy).toHaveBeenCalledWith([
        {
          childrenCount: 1,
          description: ['description'],
          duration: 100,
          image: 'image',
          imageAlt: 'imageAlt',
          label: 'label',
          languageId: '21754',
          languageEnglishName: 'Chinese, Simplified',
          languagePrimaryName: '简体中文',
          objectID: 'id',
          slug: 'slug',
          subtitles: ['subtitle'],
          titles: ['title'],
          videoId: 'videoId',
          manualRanking: 1
        }
      ])
    })

    it('should sync all videos to Algolia when prd', async () => {
      process.env.ALGOLIA_API_KEY = 'key'
      process.env.ALGOLIA_APPLICATION_ID = 'id'
      process.env.ALGOLIA_INDEX = 'video-variants-prd'
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([])
      await service()
      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
        take: 1000,
        skip: 0,
        include: {
          video: {
            include: {
              title: true,
              description: true,
              imageAlt: true,
              snippet: true
            }
          },
          subtitle: true
        }
      })
    })
  })
})
