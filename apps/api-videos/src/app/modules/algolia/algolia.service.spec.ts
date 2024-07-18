import { Test, TestingModule } from '@nestjs/testing'
import algoliasearch from 'algoliasearch'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import clone from 'lodash/clone'

import { VideoVariant } from '.prisma/api-videos-client'

import { PrismaService } from '../../lib/prisma.service'

import { ApolloClient, ApolloQueryResult } from '@apollo/client'
import { AlgoliaService } from './algolia.service'

const saveObjectsSpy = jest
  .fn()
  .mockReturnValue({ wait: jest.fn().mockResolvedValue({}) })

const initIndexSpy = jest.fn().mockReturnValue({
  saveObjects: saveObjectsSpy
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

const languages = [
  {
    id: 'languageId',
    name: [
      {
        value: 'English',
        primary: true
      }
    ],
    countries: [
      {
        continent: [
          {
            value: 'Europe',
            primary: true
          }
        ]
      }
    ]
  }
]

describe('AlgoliaService', () => {
  let service: AlgoliaService
  let prismaService: DeepMockProxy<PrismaService>

  const originalEnv = clone(process.env)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlgoliaService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<AlgoliaService>(AlgoliaService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    process.env = originalEnv
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe('syncVideosToAlgolia', () => {
    it('should throw if no API key', async () => {
      process.env.ALGOLIA_API_KEY = undefined
      process.env.ALGOLIA_APPLICATION_ID = undefined
      process.env.ALGOLIA_INDEX = undefined
      await expect(service.syncVideosToAlgolia()).rejects.toThrow(
        'algolia environment variables not set'
      )
    })

    it('should get tags', () => {
      const mockApollo = jest
        .spyOn(ApolloClient.prototype, 'query')
        .mockImplementationOnce(
          async () =>
            await Promise.resolve({
              data: {
                languages
              }
            } as unknown as ApolloQueryResult<unknown>)
        )

      service.getLanguages()
      expect(mockApollo).toHaveBeenCalled()
    })

    it('should sync videos english to Algolia', async () => {
      process.env.ALGOLIA_API_KEY = 'key'
      process.env.ALGOLIA_APPLICATION_ID = 'id'
      process.env.ALGOLIA_INDEX = 'video-variants'
      prismaService.videoVariant.findMany
        .mockResolvedValueOnce([
          {
            id: 'id',
            videoId: 'videoId',
            video: {
              title: [{ value: 'title' }],
              description: [{ value: 'description' }],
              label: 'label',
              image: 'image',
              imageAlt: [{ value: 'imageAlt' }],
              childIds: ['childId']
            },
            duration: 100,
            languageId: 'languageId',
            subtitle: [{ languageId: 'subtitle' }],
            slug: 'slug'
          } as unknown as VideoVariant
        ])
        .mockResolvedValueOnce([])

      jest.spyOn(ApolloClient.prototype, 'query').mockImplementationOnce(
        async () =>
          await Promise.resolve({
            data: {
              languages
            }
          } as unknown as ApolloQueryResult<unknown>)
      )

      await service.syncVideosToAlgolia()
      expect(prismaService.videoVariant.findMany).toHaveBeenCalledWith({
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
          languageId: '529'
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
          language: {
            localName: '',
            nativeName: 'English',
            continents: ['Europe']
          },
          objectID: 'id',
          slug: 'slug',
          subtitles: ['subtitle'],
          titles: ['title'],
          videoId: 'videoId'
        }
      ])
    })

    it('should sync all videos to Algolia when prd', async () => {
      process.env.ALGOLIA_API_KEY = 'key'
      process.env.ALGOLIA_APPLICATION_ID = 'id'
      process.env.ALGOLIA_INDEX = 'video-variants-prd'
      prismaService.videoVariant.findMany.mockResolvedValueOnce([])
      jest.spyOn(ApolloClient.prototype, 'query').mockImplementationOnce(
        async () =>
          await Promise.resolve({
            data: {
              languages
            }
          } as unknown as ApolloQueryResult<unknown>)
      )

      await service.syncVideosToAlgolia()
      expect(prismaService.videoVariant.findMany).toHaveBeenCalledWith({
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
