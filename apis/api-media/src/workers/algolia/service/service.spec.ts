import { algoliasearch } from 'algoliasearch'
import clone from 'lodash/clone'

import { VideoVariant } from '@core/prisma/media/client'

import { prismaMock } from '../../../../test/prismaMock'

import { LANGUAGES_TO_INCLUDE } from './languages'
import { GET_LANGUAGES } from './service'

import { service } from '.'

const saveObjectsSpy = jest
  .fn()
  .mockReturnValue({ wait: jest.fn().mockResolvedValue({}) })

const mockQuery = jest.fn().mockResolvedValue({
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

const mockClearStore = jest.fn().mockResolvedValue({})
const mockCacheReset = jest.fn().mockResolvedValue({})
const mockStop = jest.fn().mockResolvedValue({})

jest.mock('@apollo/client', () => {
  const originalModule = jest.requireActual('@apollo/client')
  return {
    ...originalModule,
    __esModule: true,
    ApolloClient: jest.fn().mockImplementation(() => ({
      query: mockQuery,
      clearStore: mockClearStore,
      cache: {
        reset: mockCacheReset
      },
      stop: mockStop
    })),
    InMemoryCache: jest.fn()
  }
})

jest.mock('algoliasearch', () => ({
  algoliasearch: jest.fn().mockImplementation(() => ({
    saveObjects: saveObjectsSpy,
    setSettings: jest.fn().mockResolvedValue({})
  }))
}))

const mockAlgoliaSearch = algoliasearch

describe('algolia/service', () => {
  const originalEnv = clone(process.env)

  beforeEach(() => {
    process.env = originalEnv
    jest.resetModules()
  })

  afterAll(() => {
    process.env = originalEnv
    jest.resetAllMocks()
  })

  describe('service', () => {
    it('should throw if no API key', async () => {
      process.env.ALGOLIA_API_KEY = undefined
      process.env.ALGOLIA_APPLICATION_ID = undefined
      process.env.ALGOLIA_INDEX_VIDEO_VARIANTS = undefined
      process.env.ALGOLIA_INDEX_VIDEOS = undefined
      await expect(service()).rejects.toThrow(
        'algolia environment variables not set'
      )
    })

    it('should sync videos to Algolia', async () => {
      process.env.ALGOLIA_API_KEY = 'key'
      process.env.ALGOLIA_APPLICATION_ID = 'id'
      process.env.ALGOLIA_INDEX_VIDEO_VARIANTS = 'video-variants'
      process.env.ALGOLIA_INDEX_VIDEOS = 'videos'
      prismaMock.videoVariant.findMany
        .mockResolvedValueOnce([
          {
            id: 'id',
            videoId: 'videoId',
            edition: 'edition',
            video: {
              title: [
                { value: 'title', languageId: '555' },
                { value: 'title2', languageId: '529' }
              ],
              description: [{ value: 'description' }],
              label: 'label',
              images: [
                { id: 'imageId', aspectRatio: 'banner' },
                { id: 'imageId2', aspectRatio: 'hd' }
              ],
              imageAlt: [{ value: 'imageAlt', languageId: '529' }],
              childIds: ['childId'],
              subtitles: [{ edition: 'edition', languageId: '21754' }]
            },
            duration: 100,
            languageId: '21754',
            slug: 'slug'
          } as unknown as VideoVariant
        ])
        .mockResolvedValueOnce([])

      prismaMock.video.count.mockResolvedValueOnce(0)
      prismaMock.video.findMany.mockResolvedValueOnce([])

      await service()
      expect(mockQuery).toHaveBeenCalledWith({
        query: GET_LANGUAGES,
        fetchPolicy: 'no-cache'
      })
      expect(prismaMock.videoVariant.findMany).toHaveBeenCalledWith({
        take: 1000,
        skip: 0,
        include: {
          video: {
            include: {
              title: true,
              description: true,
              imageAlt: true,
              snippet: true,
              subtitles: true,
              images: true
            }
          }
        },
        where: {
          languageId: {
            in: LANGUAGES_TO_INCLUDE
          }
        }
      })
      expect(mockAlgoliaSearch).toHaveBeenCalledWith('id', 'key')
      expect(saveObjectsSpy).toHaveBeenCalledWith({
        indexName: 'video-variants',
        objects: [
          {
            childrenCount: 1,
            description: ['description'],
            duration: 100,
            image: `https://imagedelivery.net/${
              process.env.CLOUDFLARE_IMAGE_ACCOUNT ?? 'testAccount'
            }/imageId/f=jpg,w=1280,h=600,q=95`,
            imageAlt: 'imageAlt',
            label: 'label',
            languageId: '21754',
            languageEnglishName: 'Chinese, Simplified',
            languagePrimaryName: '简体中文',
            objectID: 'id',
            slug: 'slug',
            subtitles: ['21754'],
            titles: ['title2', 'title'],
            titlesWithLanguages: [
              {
                value: 'title2',
                languageId: '529'
                // bcp47: ''
              },
              {
                value: 'title',
                languageId: '555'
                // bcp47: ''
              }
            ],
            videoId: 'videoId',
            manualRanking: 1
          }
        ],
        waitForTasks: true
      })
    })

    it('should sync all videos to Algolia when prd', async () => {
      process.env.ALGOLIA_API_KEY = 'key'
      process.env.ALGOLIA_APPLICATION_ID = 'id'
      process.env.ALGOLIA_INDEX_VIDEO_VARIANTS = 'video-variants-prd'
      process.env.ALGOLIA_INDEX_VIDEOS = 'videos'
      prismaMock.videoVariant.findMany.mockResolvedValueOnce([])
      prismaMock.video.count.mockResolvedValueOnce(0)
      prismaMock.video.findMany.mockResolvedValueOnce([])
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
              snippet: true,
              subtitles: true,
              images: true
            }
          }
        }
      })
    })
  })
})
