import { Test, TestingModule } from '@nestjs/testing'
import { VideoBlockSource } from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import {
  VideoStartEventResolver,
  VideoPlayEventResolver,
  VideoPauseEventResolver,
  VideoCompleteEventResolver,
  VideoCollapseEventResolver,
  VideoExpandEventResolver,
  VideoProgressEventResolver
} from './video.resolver'

describe('VideoResolver', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })
  describe('videoStartEventCreate', () => {
    let resolver: VideoStartEventResolver

    const eventService = {
      provide: EventService,
      useFactory: () => ({
        save: jest.fn((input) => input)
      })
    }

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoStartEventResolver, eventService]
      }).compile()
      resolver = module.get<VideoStartEventResolver>(VideoStartEventResolver)
    })

    it('returns VideoStartEvent', async () => {
      const input = {
        id: '1',
        blockId: '2',
        position: 30.1
      }

      expect(await resolver.videoStartEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoStartEvent',
        userId: 'userid',
        createdAt: new Date().toISOString()
      })
    })

    it('returns object for federation', () => {
      expect(resolver.source({ value: VideoBlockSource.youTube })).toEqual(
        VideoBlockSource.youTube
      )
    })
  })

  describe('videoPlayEventCreate', () => {
    let resolver: VideoPlayEventResolver

    const eventService = {
      provide: EventService,
      useFactory: () => ({
        save: jest.fn((input) => input)
      })
    }

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoPlayEventResolver, eventService]
      }).compile()
      resolver = module.get<VideoPlayEventResolver>(VideoPlayEventResolver)
    })

    it('returns VideoPlayEvent', async () => {
      const input = {
        id: '1',
        blockId: '2',
        position: 30.1
      }

      expect(await resolver.videoPlayEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoPlayEvent',
        userId: 'userid',
        createdAt: new Date().toISOString()
      })
    })

    it('returns object for federation', () => {
      expect(resolver.source({ value: VideoBlockSource.internal })).toEqual(
        VideoBlockSource.internal
      )
    })
  })

  describe('videoPauseEventCreate', () => {
    let resolver: VideoPauseEventResolver

    const eventService = {
      provide: EventService,
      useFactory: () => ({
        save: jest.fn((input) => input)
      })
    }

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoPauseEventResolver, eventService]
      }).compile()
      resolver = module.get<VideoPauseEventResolver>(VideoPauseEventResolver)
    })

    it('returns VideoPauseEvent', async () => {
      const input = {
        id: '1',
        blockId: '2',
        position: 30.1
      }

      expect(await resolver.videoPauseEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoPauseEvent',
        userId: 'userid',
        createdAt: new Date().toISOString()
      })
    })

    it('returns object for federation', () => {
      expect(resolver.source({ value: VideoBlockSource.youTube })).toEqual(
        VideoBlockSource.youTube
      )
    })
  })

  describe('videoCompleteEventCreate', () => {
    let resolver: VideoCompleteEventResolver

    const eventService = {
      provide: EventService,
      useFactory: () => ({
        save: jest.fn((input) => input)
      })
    }

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoCompleteEventResolver, eventService]
      }).compile()
      resolver = module.get<VideoCompleteEventResolver>(
        VideoCompleteEventResolver
      )
    })

    it('returns VideoCompleteEvent', async () => {
      const input = {
        id: '1',
        blockId: '2',
        position: 30.1
      }

      expect(await resolver.videoCompleteEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoCompleteEvent',
        userId: 'userid',
        createdAt: new Date().toISOString()
      })
    })

    it('returns object for federation', () => {
      expect(resolver.source({ value: VideoBlockSource.youTube })).toEqual(
        VideoBlockSource.youTube
      )
    })
  })

  describe('videoExpandEventCreate', () => {
    let resolver: VideoExpandEventResolver

    const eventService = {
      provide: EventService,
      useFactory: () => ({
        save: jest.fn((input) => input)
      })
    }

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoExpandEventResolver, eventService]
      }).compile()
      resolver = module.get<VideoExpandEventResolver>(VideoExpandEventResolver)
    })

    it('returns VideoExpandEvent', async () => {
      const input = {
        id: '1',
        blockId: '2',
        position: 30.1
      }

      expect(await resolver.videoExpandEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoExpandEvent',
        userId: 'userid',
        createdAt: new Date().toISOString()
      })
    })

    it('returns object for federation', () => {
      expect(resolver.source({ value: VideoBlockSource.youTube })).toEqual(
        VideoBlockSource.youTube
      )
    })
  })

  describe('videoCollapseEventCreate', () => {
    let resolver: VideoCollapseEventResolver

    const eventService = {
      provide: EventService,
      useFactory: () => ({
        save: jest.fn((input) => input)
      })
    }

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoCollapseEventResolver, eventService]
      }).compile()
      resolver = module.get<VideoCollapseEventResolver>(
        VideoCollapseEventResolver
      )
    })

    it('returns VideoCollapseEvent', async () => {
      const input = {
        id: '1',
        blockId: '2',
        position: 30.1
      }

      expect(await resolver.videoCollapseEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoCollapseEvent',
        userId: 'userid',
        createdAt: new Date().toISOString()
      })
    })

    it('returns object for federation', () => {
      expect(resolver.source({ value: VideoBlockSource.youTube })).toEqual(
        VideoBlockSource.youTube
      )
    })
  })

  describe('videoProgressEventCreate', () => {
    let resolver: VideoProgressEventResolver

    const eventService = {
      provide: EventService,
      useFactory: () => ({
        save: jest.fn((input) => input)
      })
    }

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoProgressEventResolver, eventService]
      }).compile()
      resolver = module.get<VideoProgressEventResolver>(
        VideoProgressEventResolver
      )
    })

    it('returns VideoProgressEvent', async () => {
      const input = {
        id: '1',
        blockId: '2',
        position: 30.1,
        progress: 25
      }

      expect(await resolver.videoProgressEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoProgressEvent',
        userId: 'userid',
        createdAt: new Date().toISOString()
      })
    })

    it('returns object for federation', () => {
      expect(resolver.source({ value: VideoBlockSource.youTube })).toEqual(
        VideoBlockSource.youTube
      )
    })
  })
})
