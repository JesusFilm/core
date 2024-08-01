import { Test, TestingModule } from '@nestjs/testing'

import { KeywordResolver } from './keyword.resolver'
import { PrismaService } from '../../lib/prisma.service'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Keyword, Video } from '.prisma/api-videos-client'

describe('KeywordResolver', () => {
  let resolver: KeywordResolver, prismaService: DeepMockProxy<PrismaService>

  const video: Video = {
    id: '20615',
    slug: 'video-slug',
    label: 'featureFilm',
    primaryLanguageId: '529',
    image: '',
    noIndex: false,
    childIds: ['20615', '20615']
  }

  const keyword: Keyword = {
    id: '1',
    value: 'keyword',
    languageId: '529'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeywordResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<KeywordResolver>(KeywordResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('keywords', () => {
    it('returns keywords', async () => {
      prismaService.keyword.findMany.mockResolvedValue([keyword])
      prismaService.video.findMany.mockResolvedValue([video])
      expect(await resolver.keywords('529')).toEqual([keyword])
      expect(prismaService.keyword.findMany).toHaveBeenCalledWith({
        where: {
          languageId: '529'
        }
      })
    })
  })

  describe('language', () => {
    it('returns language', async () => {
      expect(await resolver.language(keyword)).toEqual({
        __typename: 'Language',
        id: '529'
      })
    })
  })

  describe('vides', () => {
    it('returns videos', async () => {
      prismaService.video.findMany.mockResolvedValue([video])
      expect(await resolver.videos(keyword)).toEqual([video])
      expect(prismaService.video.findMany).toHaveBeenCalledWith({
        where: {
          keywords: {
            some: {
              id: '1'
            }
          }
        }
      })
    })
  })
})
