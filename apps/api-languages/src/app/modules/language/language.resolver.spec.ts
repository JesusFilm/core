import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Language } from '.prisma/api-languages-client'

import { LanguageIdType } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { LanguageResolver } from './language.resolver'

describe('LangaugeResolver', () => {
  let resolver: LanguageResolver, prismaService: DeepMockProxy<PrismaService>

  const language: Language = {
    id: '20615',
    bcp47: 'zh',
    iso3: 'zh',
    name: [
      {
        value: '普通話',
        primary: true,
        languageId: '20615'
      },
      {
        value: 'Chinese, Mandarin',
        primary: false,
        languageId: '529'
      }
    ],
    createdAt: new Date('2021-01-01T00:00:00.000Z'),
    updatedAt: new Date('2021-01-01T00:00:00.000Z')
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguageResolver,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<LanguageResolver>(LanguageResolver)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('languages', () => {
    it('returns Languages', async () => {
      prismaService.language.findMany.mockResolvedValue([language, language])
      expect(await resolver.languages(1, 2)).toEqual([language, language])
      expect(prismaService.language.findMany).toHaveBeenCalledWith({
        skip: 1,
        take: 2,
        where: {}
      })
    })

    it('filters by ids array', async () => {
      prismaService.language.findMany.mockResolvedValue([language, language])
      expect(
        await resolver.languages(1, 2, { ids: ['languageId1', 'languageId2'] })
      ).toEqual([language, language])
      expect(prismaService.language.findMany).toHaveBeenCalledWith({
        skip: 1,
        take: 2,
        where: {
          id: {
            in: ['languageId1', 'languageId2']
          }
        }
      })
    })
  })

  describe('language', () => {
    it('should return language', async () => {
      prismaService.language.findUnique.mockResolvedValue(language)
      expect(await resolver.language(language.id)).toEqual(language)
      expect(prismaService.language.findUnique).toHaveBeenCalledWith({
        where: { id: language.id }
      })
    })

    it('should return language by bcp47', async () => {
      prismaService.language.findFirst.mockResolvedValue(language)
      expect(
        await resolver.language(language.id, LanguageIdType.bcp47)
      ).toEqual(language)
      expect(prismaService.language.findFirst).toHaveBeenCalledWith({
        where: { bcp47: language.id }
      })
    })
  })

  describe('name', () => {
    it('should return translations', () => {
      expect(resolver.name(language)).toEqual(language.name)
    })

    it('should return translations filtered by languageId', () => {
      expect(resolver.name(language, '529')).toEqual([language.name[1]])
    })

    it('should return translations filtered by primary', () => {
      expect(resolver.name(language, undefined, true)).toEqual([
        language.name[0]
      ])
    })
  })

  describe('resolveReference', () => {
    it('should return language', async () => {
      prismaService.language.findUnique.mockResolvedValue(language)
      expect(
        await resolver.resolveReference({
          __typename: 'Language',
          id: language.id
        })
      ).toEqual(language)
    })
  })
})
