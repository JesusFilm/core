import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { VideoPlayEventStateEnum } from '../../../__generated__/graphql'
import { VideoEventResolver } from './video.resolver'

describe('VideoPlayEventResolver', () => {
  let resolver: VideoEventResolver

  const event = {
    id: '1',
    __typename: 'VideoPlayEvent',
    blockId: '2',
    state: VideoPlayEventStateEnum.PLAYING,
    position: 30
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideoEventResolver, eventService]
    }).compile()
    resolver = module.get<VideoEventResolver>(VideoEventResolver)
  })

  describe('videoPlayEventCreate', () => {
    it('returns VideoPlayEvent', async () => {
      expect(await resolver.videoPlayEventCreate('userid', event)).toEqual({
        ...event,
        userId: 'userid'
      })
    })
  })
})
