import { Test, TestingModule } from '@nestjs/testing'
import { EventService } from '../event.service'
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

  describe('videoStartEventCreate', () => {
    it('returns VideoStartEvent', async () => {
      const event = {
        id: '1',
        __typename: 'VideoStartEvent',
        blockId: '2',
        position: 30
      }

      expect(await resolver.videoStartEventCreate('userid', event)).toEqual({
        ...event,
        userId: 'userid'
      })
    })
  })

  describe('videoPlayEventCreate', () => {
    it('returns VideoPlayEvent', async () => {
      const event = {
        id: '1',
        __typename: 'VideoPlayEvent',
        blockId: '2',
        position: 30
      }

      expect(await resolver.videoPlayEventCreate('userid', event)).toEqual({
        ...event,
        userId: 'userid'
      })
    })
  })

  describe('videoPauseEventCreate', () => {
    it('returns VideoPauseEvent', async () => {
      const event = {
        id: '1',
        __typename: 'VideoPauseEvent',
        blockId: '2',
        position: 30
      }

      expect(await resolver.videoPauseEventCreate('userid', event)).toEqual({
        ...event,
        userId: 'userid'
      })
    })
  })

  describe('videoCompleteEventCreate', () => {
    it('returns VideoCompleteEvent', async () => {
      const event = {
        id: '1',
        __typename: 'VideoCompleteEvent',
        blockId: '2',
        position: 30
      }

      expect(await resolver.videoCompleteEventCreate('userid', event)).toEqual({
        ...event,
        userId: 'userid'
      })
    })
  })

  describe('videoExpandEventCreate', () => {
    it('returns VideoExpandEvent', async () => {
      const event = {
        id: '1',
        __typename: 'VideoExpandEvent',
        blockId: '2',
        position: 30
      }

      expect(await resolver.videoExpandEventCreate('userid', event)).toEqual({
        ...event,
        userId: 'userid'
      })
    })
  })

  describe('videoCollapseEventCreate', () => {
    it('returns VideoCollapseEvent', async () => {
      const event = {
        id: '1',
        __typename: 'VideoCollapseEvent',
        blockId: '2',
        position: 30
      }

      expect(await resolver.videoCollapseEventCreate('userid', event)).toEqual({
        ...event,
        userId: 'userid'
      })
    })
  })

  describe('videoProgressEventCreate', () => {
    it('returns VideoProgressEvent', async () => {
      const event = {
        id: '1',
        __typename: 'VideoProgressEvent',
        blockId: '2',
        position: 30,
        progress: 25
      }

      expect(await resolver.videoProgressEventCreate('userid', event)).toEqual({
        ...event,
        userId: 'userid'
      })
    })
  })
})
