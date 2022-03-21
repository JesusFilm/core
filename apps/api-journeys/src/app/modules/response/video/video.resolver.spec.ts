import { Test, TestingModule } from '@nestjs/testing'
import { VideoResponseStateEnum } from '../../../__generated__/graphql'
import { ResponseService } from '../response.service'
import { VideoResponseResolver } from './video.resolver'

describe('VideoResponseResolver', () => {
  let resolver: VideoResponseResolver

  const response = {
    id: '1',
    __typename: 'VideoResponse',
    blockId: '2',
    userId: '3',
    state: VideoResponseStateEnum.PLAYING,
    position: 30
  }

  const responseService = {
    provide: ResponseService,
    useFactory: () => ({
      save: jest.fn(() => response)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoResponseResolver, responseService]
    }).compile()
    resolver = module.get<VideoResponseResolver>(VideoResponseResolver)
  })

  describe('videoResponseCreate', () => {
    it('returns VideoResponse', async () => {
      expect(await resolver.videoResponseCreate(response)).toEqual(response)
    })
  })
})
