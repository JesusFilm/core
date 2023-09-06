import { Test, TestingModule } from '@nestjs/testing'

import { TranslationResolver } from './translation.resolver'

describe('TranslationResolver', () => {
  let resolver: TranslationResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TranslationResolver]
    }).compile()
    resolver = module.get<TranslationResolver>(TranslationResolver)
  })

  describe('language', () => {
    it('returns object for federation', async () => {
      expect(
        await resolver.language({
          languageId: 'languageId',
          value: 'English',
          primary: true
        })
      ).toEqual({
        __typename: 'Language',
        id: 'languageId'
      })
    })
  })
})
