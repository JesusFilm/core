import { Test, TestingModule } from '@nestjs/testing'
import { LanguageResolver } from './language.resolver'
import { LanguageService } from './language.service'

describe('LangaugeResolver', () => {
  let resolver: LanguageResolver, service: LanguageService

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
    ]
  }

  beforeEach(async () => {
    const languageService = {
      provide: LanguageService,
      useFactory: () => ({
        get: jest.fn(() => language),
        getAll: jest.fn(() => [language, language])
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [LanguageResolver, languageService]
    }).compile()
    resolver = module.get<LanguageResolver>(LanguageResolver)
    service = await module.resolve(LanguageService)
  })

  describe('languages', () => {
    it('returns Languages', async () => {
      expect(await resolver.languages(1, 2)).toEqual([language, language])
      expect(service.getAll).toHaveBeenCalledWith(1, 2)
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
})
