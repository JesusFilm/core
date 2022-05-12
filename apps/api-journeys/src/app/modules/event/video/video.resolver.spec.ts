import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
import { VideoPlayEventStateEnum } from '../../../__generated__/graphql'
import { VideoEventResolver } from './video.resolver'

describe('VideoPlayEventResolver', () => {
  let resolver: VideoEventResolver

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
      const event = {
        id: '1',
        __typename: 'VideoPlayEvent',
        blockId: '2',
        state: VideoPlayEventStateEnum.PLAYING,
        position: 30
      }

      expect(await resolver.videoPlayEventCreate('userid', event)).toEqual({
        ...event,
        userId: 'userid'
      })
    })
  })

  describe('videoMuteEventCreate', () => {
    it('returns VideoMuteEvent', async () => {
      const event = {
        id: '1',
        __typename: 'VideoMuteEvent',
        blockId: '2'
      }

      expect(await resolver.videoMuteEventCreate('userid', event)).toEqual({
        ...event,
        userId: 'userid'
      })
    })
  })

  describe('videoFullScreenEventCreate', () => {
    it('returns VideoFullScreenEvent', async () => {
      const event = {
        id: '1',
        __typename: 'VideoFullscreenEvent',
        blockId: '2'
      }

      expect(
        await resolver.videoFullscreenEventCreate('userid', event)
      ).toEqual({
        ...event,
        userId: 'userid'
      })
    })
  })

  describe.skip('videoViewEventCreate', () => {
    it('returns VideoViewEvent', async () => {
      const event = {
        id: '1',
        __typename: 'VideoViewEvent',
        videoId: 'video.id',
        languageId: 'language.id',
        blockId: '2'
      }

      expect(await resolver.videoViewEventCreate('userid', event)).toEqual({
        ...event,
        userId: 'userid'
      })
    })
  })
})
