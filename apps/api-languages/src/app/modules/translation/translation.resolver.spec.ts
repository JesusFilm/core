import { Test, TestingModule } from '@nestjs/testing'
import { LanguageService } from '../language/language.service'
import { TranslationResolver } from './translation.resolver'

describe('Translation Resolver', () => {
  let resolver: TranslationResolver

  const translation = [
    {
      value: 'Teke, Central',
      languageId: '529',
      primary: true
    }
  ]

  beforeEach(async () => {
    const languageService = {
      provide: LanguageService,
      useFactory: () => ({
        get: jest.fn(() => translation)
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [TranslationResolver, languageService]
    }).compile()
    resolver = module.get<TranslationResolver>(TranslationResolver)
  })

  it('should return the translation', async () => {
    expect(await resolver.language(translation)).toEqual(translation)
  })
})
