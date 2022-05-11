import { Test, TestingModule } from '@nestjs/testing'
import { VideoTagResolver } from './tag.resolver'
import { VideoTagService } from './tag.service'
import { tag } from './testData'

describe('VideoTagResolver', () => {
  let resolver: VideoTagResolver, service: VideoTagService

  beforeEach(async () => {
    const videoTagService = {
      provide: VideoTagService,
      useFactory: () => ({
        getAll: jest.fn(() => [tag, tag]),
        get: jest.fn(() => tag)
      })
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [videoTagService, VideoTagResolver]
    }).compile()
    resolver = module.get<VideoTagResolver>(VideoTagResolver)
    service = await module.resolve(VideoTagService)
  })

  it('returns a tag', async () => {
    expect(await resolver.videoTag('JFM1')).toEqual(tag)
    expect(service.get).toHaveBeenCalledWith('JFM1')
  })

  it('returns all tags', async () => {
    expect(await resolver.videoTags()).toEqual([tag, tag])
    expect(service.getAll).toHaveBeenCalledWith()
  })
})
