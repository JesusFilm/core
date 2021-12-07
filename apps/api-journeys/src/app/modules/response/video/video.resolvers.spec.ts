import { Test, TestingModule } from '@nestjs/testing'
import { VideoResponseStateEnum } from '../../../graphql'
import { ResponseService } from '../response.service'
import { VideoResponseResolver } from './video.resolvers'

describe('VideoResponse', () => {
  let resolver: VideoResponseResolver

  const response = {
    _key: "1",
    type: 'VideoResponse',
    blockId: "2",
    userId: "3",
    state: VideoResponseStateEnum.PLAYING,
    position: 30
  }

  const responseresponse = {
    id: "1",
    type: 'VideoResponse',
    blockId: "2",
    userId: "3",
    state: VideoResponseStateEnum.PLAYING,
    position: 30
  }

  const responseservice = {
    provide: ResponseService,
    useFactory: () => ({
      save: jest.fn(() => response),      
    })
  }


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoResponseResolver, responseservice]
    }).compile()
    resolver = module.get<VideoResponseResolver>(VideoResponseResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })

  describe('VideoResponse', () => {
    it('returns VideoResponse', async () => {
      expect(resolver.videoResponseCreate(response)).resolves.toEqual(responseresponse)      
    })
  })
})
