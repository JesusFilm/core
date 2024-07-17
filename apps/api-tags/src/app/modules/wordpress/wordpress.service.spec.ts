import { Test, TestingModule } from '@nestjs/testing'
import axios from 'axios'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import clone from 'lodash/clone'

import { Service } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { WordPressService } from './wordpress.service'

jest.mock('axios', () => {
  const originalModule = jest.requireActual('axios')
  return {
    __esModule: true,
    ...originalModule,
    desfult: jest.fn()
  }
})

const mockAxios = axios as jest.MockedFunction<typeof axios>

describe('WordPressService', () => {
  let service: WordPressService, prismaService: DeepMockProxy<PrismaService>

  const originalEnv = clone(process.env)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WordPressService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<WordPressService>(WordPressService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    process.env = originalEnv
  })

  afterEach(() => {
    jest.clearAllMocks()
    process.env = originalEnv
  })

  const wordpressTags = [
    {
      id: 1,
      count: 0,
      description: '',
      link: 'example.com/blog/core-tags/tag/',
      name: 'Tag',
      slug: 'tag',
      taxonomy: 'core-tags',
      meta: [],
      acf: [],
      _links: {
        self: [
          {
            href: 'example.com/wp-json/wp/v2/core-tags/1'
          }
        ],
        collection: [
          {
            href: 'example.com/wp-json/wp/v2/core-tags'
          }
        ],
        about: [
          {
            href: 'example.com/wp-json/wp/v2/taxonomies/core-tags'
          }
        ],
        'wp:post_type': [
          {
            href: 'example.com/wp-json/wp/v2/mission-trip?core-tags=1'
          }
        ],
        curies: [
          {
            name: 'wp',
            href: 'https://api.w.org/{rel}',
            templated: true
          }
        ]
      }
    }
  ]

  describe('getWordPressCoreTags', () => {
    it('should get core tags from wordpress', async () => {
      process.env.WORDPRESS_USER = 'user'
      process.env.WORDPRESS_APPLICATION_PASSWORD = 'password'

      mockAxios.get = jest.fn().mockResolvedValueOnce({
        data: wordpressTags
      })
      const result = await service.getWordPressCoreTags()
      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://develop.jesusfilm.org/wp-json/wp/v2/core-tags?per_page=100',
        {
          auth: {
            username: 'user',
            password: 'password'
          }
        }
      )
      expect(result).toEqual(wordpressTags)
    })

    it('should throw error when getting core tags from wordpress', async () => {
      process.env.WORDPRESS_USER = 'user'
      process.env.WORDPRESS_APPLICATION_PASSWORD = 'password'
      mockAxios.get = jest.fn().mockRejectedValueOnce(new Error('error'))
      await expect(service.getWordPressCoreTags()).rejects.toThrow(
        new Error('error')
      )
    })
  })

  describe('createWordPressCoreTag', () => {
    it('should create a core tag in wordpress', async () => {
      process.env.WORDPRESS_USER = 'user'
      process.env.WORDPRESS_APPLICATION_PASSWORD = 'password'
      mockAxios.post = jest.fn().mockResolvedValueOnce({
        data: wordpressTags[0]
      })
      await service.createWordPressCoreTag('Tag')
      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://develop.jesusfilm.org/wp-json/wp/v2/core-tags',
        {
          name: 'Tag'
        },
        {
          auth: {
            username: 'user',
            password: 'password'
          }
        }
      )
    })

    it('should throw error when creating core tag in wordpress', async () => {
      process.env.WORDPRESS_USER = 'user'
      process.env.WORDPRESS_APPLICATION_PASSWORD = 'password'
      mockAxios.post = jest.fn().mockRejectedValueOnce(new Error('error'))
      await expect(service.createWordPressCoreTag('Tag')).rejects.toThrow(
        new Error('error')
      )
    })
  })

  describe('syncTagsToWordPress', () => {
    it('should sync tags to wordpress', async () => {
      process.env.WORDPRESS_USER = 'user'
      process.env.WORDPRESS_APPLICATION_PASSWORD = 'password'
      prismaService.tag.findMany.mockResolvedValueOnce([
        {
          id: 'd129a025-aed2-4993-abb1-d419836704b4',
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'Audience',
          service: Service.apiJourneys,
          nameTranslations: [
            {
              value: 'Audience',
              primary: true,
              language: {
                id: '529'
              }
            }
          ],
          parentId: null
        }
      ])
      mockAxios.get = jest.fn().mockResolvedValueOnce({
        data: wordpressTags
      })
      mockAxios.post = jest.fn().mockResolvedValueOnce({
        data: wordpressTags[0]
      })
      await service.syncTagsToWordPress()
      expect(prismaService.tag.findMany).toHaveBeenCalled()
      expect(mockAxios.get).toHaveBeenCalled()
      expect(mockAxios.post).toHaveBeenCalled()
    })
  })
})
