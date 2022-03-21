import { Test, TestingModule } from '@nestjs/testing'
import { VideoVariantResolver } from './videoVariant.resolver'

describe('VideoVariantResolver', () => {
  let resolver: VideoVariantResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoVariantResolver]
    }).compile()
    resolver = module.get<VideoVariantResolver>(VideoVariantResolver)
  })

  describe('language', () => {
    it('returns object for federation', async () => {
      expect(await resolver.language({ languageId: 'languageId' })).toEqual({
        __typename: 'Language',
        id: 'languageId'
      })
    })
  })
})
