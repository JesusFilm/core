import { CacheModule } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { LanguageIdType } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { LanguageResolver } from './language.resolver'

describe('LangaugeResolver', () => {
  let resolver: LanguageResolver, prismaService: PrismaService

  const language = {
    id: '20615',
    bcp47: 'zh',
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
      imports: [CacheModule.register()],
      providers: [LanguageResolver, PrismaService]
    }).compile()
    resolver = module.get<LanguageResolver>(LanguageResolver)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.language.findUnique = jest.fn().mockResolvedValue(language)
    prismaService.language.findMany = jest
      .fn()
      .mockResolvedValue([language, language])
    prismaService.language.findFirst = jest.fn().mockResolvedValue(language)
  })

  describe('languages', () => {
    it('returns Languages', async () => {
      expect(await resolver.languages(1, 2)).toEqual([language, language])
      expect(prismaService.language.findMany).toHaveBeenCalledWith({
        skip: 1,
        take: 2
      })
      // ensure cache
      expect(await resolver.languages(1, 2)).toEqual([language, language])
      expect(prismaService.language.findMany).toHaveBeenCalledTimes(1)
    })
  })

  describe('language', () => {
    it('should return language', async () => {
      expect(await resolver.language(language.id)).toEqual(language)
      expect(prismaService.language.findUnique).toHaveBeenCalledWith({
        where: { id: language.id }
      })
      // ensure cache
      expect(await resolver.language(language.id)).toEqual(language)
      expect(prismaService.language.findUnique).toHaveBeenCalledTimes(1)
    })

    it('should return language by bcp47', async () => {
      expect(
        await resolver.language(language.id, LanguageIdType.bcp47)
      ).toEqual(language)
      expect(prismaService.language.findFirst).toHaveBeenCalledWith({
        where: { bcp47: language.id }
      })
      // ensure cache
      expect(
        await resolver.language(language.id, LanguageIdType.bcp47)
      ).toEqual(language)
      expect(prismaService.language.findFirst).toHaveBeenCalledTimes(1)
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
      expect(
        await resolver.resolveReference({
          __typename: 'Language',
          id: language.id
        })
      ).toEqual(language)
      // ensure cache
      expect(
        await resolver.resolveReference({
          __typename: 'Language',
          id: language.id
        })
      ).toEqual(language)
      expect(prismaService.language.findUnique).toHaveBeenCalledTimes(1)
    })
  })
})
