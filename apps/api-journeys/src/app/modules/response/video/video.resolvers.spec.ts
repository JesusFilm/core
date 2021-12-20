import { Test, TestingModule } from '@nestjs/testing'
import { VideoResponseStateEnum } from '../../../__generated__/graphql'
import { ResponseService } from '../response.service'
import { VideoResponseResolver } from './video.resolvers'

describe('VideoResponse', () => {
  let resolver: VideoResponseResolver

  const response = {
    _key: "1",
    __typename: 'VideoResponse',
    blockId: "2",
    userId: "3",
    state: VideoResponseStateEnum.PLAYING,
    position: 30
  }

  const responseresponse = {
    id: "1",
    __typename: 'VideoResponse',
    blockId: "2",
    userId: "3",
    state: VideoResponseStateEnum.PLAYING,
    position: 30
  }

  const responseService = {
    provide: ResponseService,
    useFactory: () => ({
      save: jest.fn(() => response),      
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
      expect(resolver.videoResponseCreate(response)).resolves.toEqual(responseresponse)      
    })
  })
})
