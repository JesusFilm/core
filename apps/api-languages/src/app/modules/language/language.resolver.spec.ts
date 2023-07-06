import { Test, TestingModule } from '@nestjs/testing'
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
      providers: [LanguageResolver, PrismaService]
    }).compile()
    resolver = module.get<LanguageResolver>(LanguageResolver)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.language.findUnique = jest.fn().mockResolvedValue(language)
    prismaService.language.findMany = jest
      .fn()
      .mockResolvedValue([language, language])
  })

  describe('languages', () => {
    it('returns Languages', async () => {
      expect(await resolver.languages(1, 2)).toEqual([language, language])
      expect(prismaService.language.findMany).toHaveBeenCalledWith({
        skip: 1,
        take: 2
      })
    })
  })

  describe('language', () => {
    it('should return language', async () => {
      expect(await resolver.language(language.id)).toEqual(language)
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
    })
  })
})
