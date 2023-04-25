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
  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event),
      validateBlockEvent: jest.fn(() => response)
    })
  }

  const response = {
    visitor: { id: 'visitor.id' },
    journeyId: 'journey.id'
  }
  const input = {
    id: '1',
    blockId: 'block.id',
    position: 30.1,
    stepId: 'step.id',
    label: 'Video title',
    value: VideoBlockSource.internal,
    visitorId: 'visitor.id',
    journeyId: 'journey.id'
  }

  describe('videoStartEventCreate', () => {
    let resolver: VideoStartEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoStartEventResolver, eventService]
      }).compile()
      resolver = module.get<VideoStartEventResolver>(VideoStartEventResolver)
    })

    it('returns VideoStartEvent', async () => {
      expect(await resolver.videoStartEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoStartEvent'
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

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoPlayEventResolver, eventService]
      }).compile()
      resolver = module.get<VideoPlayEventResolver>(VideoPlayEventResolver)
    })

    it('returns VideoPlayEvent', async () => {
      expect(await resolver.videoPlayEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoPlayEvent'
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

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoPauseEventResolver, eventService]
      }).compile()
      resolver = module.get<VideoPauseEventResolver>(VideoPauseEventResolver)
    })

    it('returns VideoPauseEvent', async () => {
      expect(await resolver.videoPauseEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoPauseEvent'
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

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoCompleteEventResolver, eventService]
      }).compile()
      resolver = module.get<VideoCompleteEventResolver>(
        VideoCompleteEventResolver
      )
    })

    it('returns VideoCompleteEvent', async () => {
      expect(await resolver.videoCompleteEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoCompleteEvent'
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

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoExpandEventResolver, eventService]
      }).compile()
      resolver = module.get<VideoExpandEventResolver>(VideoExpandEventResolver)
    })

    it('returns VideoExpandEvent', async () => {
      expect(await resolver.videoExpandEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoExpandEvent'
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

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoCollapseEventResolver, eventService]
      }).compile()
      resolver = module.get<VideoCollapseEventResolver>(
        VideoCollapseEventResolver
      )
    })

    it('returns VideoCollapseEvent', async () => {
      expect(await resolver.videoCollapseEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoCollapseEvent'
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

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoProgressEventResolver, eventService]
      }).compile()
      resolver = module.get<VideoProgressEventResolver>(
        VideoProgressEventResolver
      )
    })

    const progressInput = {
      ...input,
      progress: 25
    }

    it('returns VideoProgressEvent', async () => {
      expect(
        await resolver.videoProgressEventCreate('userid', progressInput)
      ).toEqual({
        ...progressInput,
        __typename: 'VideoProgressEvent'
      })
    })

    it('returns object for federation', () => {
      expect(resolver.source({ value: VideoBlockSource.youTube })).toEqual(
        VideoBlockSource.youTube
      )
    })
  })
})
