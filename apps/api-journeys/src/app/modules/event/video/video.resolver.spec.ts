import { Test, TestingModule } from '@nestjs/testing'
import { VideoResponseStateEnum } from '../../../__generated__/graphql' // change
import { EventService } from '../event.service'
import { VideoResponseResolver } from './video.resolver' // change

describe('VideoEventResolver', () => {
  let resolver: VideoResponseResolver

  const event = {
    id: '1',
    __typename: 'VideoEvent', // change
    blockId: '2',
    userId: '3',
    state: VideoResponseStateEnum.PLAYING,
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
      providers: [VideoResponseResolver, eventService]
    }).compile()
    resolver = module.get<VideoResponseResolver>(VideoResponseResolver)
  })

  describe('videoEventCreate', () => {
    it('returns VideoEvent', async () => {
      expect(await resolver.videoResponseCreate(event)).toEqual(event)
    })
  })
})
