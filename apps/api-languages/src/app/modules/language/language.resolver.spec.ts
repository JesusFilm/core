import { Test, TestingModule } from '@nestjs/testing'
import { LanguageResolver } from './language.resolver'
import { LanguageService } from './language.service'

describe('LangaugeResolver', () => {
  let resolver: LanguageResolver, service: LanguageService

  const language = {
    id: '1',
    bscp47: 'TEC',
    iso3: 'TEC',
    nameNative: 'Teke, Central',
    name: [
      {
        value: 'Teke, Central',
        languageId: '529',
        primary: true
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
    it('should return translation', () => {
      expect(resolver.name(language, '529')).toEqual([...language.name])
    })
  })
})
