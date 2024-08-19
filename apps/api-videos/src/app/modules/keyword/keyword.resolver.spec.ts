import { Test, TestingModule } from '@nestjs/testing'

import { Keyword } from '.prisma/api-videos-client'

import { KeywordResolver } from './keyword.resolver'

describe('KeywordResolver', () => {
  let resolver: KeywordResolver

  const keyword: Keyword = {
    id: '1',
    value: 'keyword',
    languageId: '529'
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeywordResolver]
    }).compile()
    resolver = module.get<KeywordResolver>(KeywordResolver)
  })

  describe('language', () => {
    it('returns language', async () => {
      expect(await resolver.language(keyword)).toEqual({
        __typename: 'Language',
        id: '529'
      })
    })
  })
})
