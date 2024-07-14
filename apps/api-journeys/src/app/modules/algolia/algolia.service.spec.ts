import { Test, TestingModule } from '@nestjs/testing'
import algoliasearch from 'algoliasearch'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Journey } from '.prisma/api-journeys-client'

import { PrismaService } from '../../lib/prisma.service'

import { ApolloClient, ApolloQueryResult } from '@apollo/client'
import { clone } from 'lodash'
import { GetLanguageQuery } from '../../../__generated__/graphql'
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

const tags = [
  {
    id: 'tagId1',
    parentId: 'parentId1',
    name: [
      {
        value: 'Tag 1',
        primary: true
      }
    ]
  },
  {
    id: 'tagId2',
    parentId: 'parentId1',
    name: [
      {
        value: 'Tag 2',
        primary: true
      }
    ]
  },
  {
    id: 'tagId3',
    parentId: 'parentId1',
    name: [
      {
        value: 'Tag 3',
        primary: true
      }
    ]
  },
  {
    id: 'parentId1',
    parentId: null,
    name: [
      {
        value: 'Parent Tag',
        primary: true
      }
    ]
  }
]

const journeyTags = [
  {
    id: 'id1',
    tagId: 'tagId1',
    journeyId: 'journeyId'
  },
  {
    id: 'id2',
    tagId: 'tagId2',
    journeyId: 'journeyId'
  },
  {
    id: 'id3',
    tagId: 'tagId3',
    journeyId: 'journeyId'
  }
]

const languages = [
  {
    id: '529',
    name: [
      {
        value: 'English',
        primary: true
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
    process.env.ALGOLIA_API_KEY = 'key'
    process.env.ALGOLIA_APPLICATION_ID = 'id'
    process.env.DOPPLER_ENVIRONMENT = 'dev'
    jest.clearAllMocks()
  })

  describe('syncJourneysToAlgolia', () => {
    it('show throw if no API key', async () => {
      process.env.ALGOLIA_API_KEY = undefined
      process.env.Algolia_APPLICATION_ID = undefined
      process.env.DOPPLER_ENVIRONMENT = undefined
      await expect(service.syncJourneysToAlgolia()).rejects.toThrow(
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
                tags
              }
            } as unknown as ApolloQueryResult<unknown>)
        )

      service.getTags()
      expect(mockApollo).toHaveBeenCalled()
    })

    it('should convert tags to map', () => {
      const tagsData = {
        tags
      }
      const result = service.processTags(tagsData, journeyTags)
      expect(result).toEqual({
        'Parent Tag': ['Tag 1', 'Tag 2', 'Tag 3']
      })
    })

    it('should get langauges', () => {
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

    it('should convert languages to map', () => {
      const languagesData: GetLanguageQuery = {
        languages
      }
      const result = service.processLanguages({ languages })
      expect(result).toEqual({
        '529': 'English'
      })
    })

    it('should sync journeys to Algolia', async () => {
      process.env.ALGOLIA_API_KEY = 'key'
      process.env.ALGOLIA_APPLICATION_ID = 'id'
      process.env.DOPPLER_ENVIRONMENT = 'dev'

      prismaService.journey.findMany
        .mockResolvedValueOnce([
          {
            id: 'journeyId',
            languageId: '529',
            template: true,
            title: 'title',
            description: 'description',
            createdAt: '2024-07-09T00:37:24.569Z',
            featuredAt: null,
            primaryImageBlock: {
              alt: 'journey image',
              src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public'
            },
            journeyTags
          } as unknown as Journey
        ])
        .mockResolvedValueOnce([])

      jest
        .spyOn(ApolloClient.prototype, 'query')
        .mockImplementationOnce(
          async () =>
            await Promise.resolve({
              data: {
                tags
              }
            } as unknown as ApolloQueryResult<unknown>)
        )
        .mockImplementationOnce(
          async () =>
            await Promise.resolve({
              data: {
                languages
              }
            } as unknown as ApolloQueryResult<unknown>)
        )

      await service.syncJourneysToAlgolia()
      expect(prismaService.journey.findMany).toHaveBeenCalledWith({
        take: 50,
        skip: 0,
        include: {
          primaryImageBlock: true,
          journeyTags: true
        },
        where: {
          template: true
        }
      })
      expect(mockAlgoliaSearch).toHaveBeenCalledWith('id', 'key')
      expect(initIndexSpy).toHaveBeenCalledWith('api-journeys-journeys-dev')
      expect(saveObjectsSpy).toHaveBeenCalledWith([
        {
          objectID: 'journeyId',
          date: '2024-07-09T00:37:24.569Z',
          description: 'description',
          featuredAt: null,
          image: {
            alt: 'journey image',
            src: 'https://imagedelivery.net/tMY86qEHFACTO8_0kAeRFA/e8692352-21c7-4f66-cb57-0298e86a3300/public'
          },
          language: 'English',
          tags: {
            'Parent Tag': ['Tag 1', 'Tag 2', 'Tag 3']
          },
          title: 'title'
        }
      ])
    })
  })
})
