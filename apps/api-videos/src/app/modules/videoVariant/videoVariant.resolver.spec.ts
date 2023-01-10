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

  it('returns subtitle count', async () => {
    expect(
      resolver.subtitleCount({
        subtitle: [
          {
            id: '1'
          },
          {
            id: '2'
          }
        ]
      })
    ).toEqual(2)
  })
})
