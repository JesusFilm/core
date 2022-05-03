import { Test, TestingModule } from '@nestjs/testing'
import { VideoEventStateEnum } from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { VideoEventResolver } from './video.resolver'

describe('VideoEventResolver', () => {
  let resolver: VideoEventResolver

  const event = {
    id: '1',
    __typename: 'VideoEvent',
    blockId: '2',
    userId: '3',
    state: VideoEventStateEnum.PLAYING,
    position: 30
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn(() => event)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoEventResolver, eventService]
    }).compile()
    resolver = module.get<VideoEventResolver>(VideoEventResolver)
  })

  describe('videoEventCreate', () => {
    it('returns VideoEvent', async () => {
      expect(await resolver.videoEventCreate(event)).toEqual(event)
    })
  })
})
