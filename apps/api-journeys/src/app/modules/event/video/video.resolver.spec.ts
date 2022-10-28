import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { VideoBlockSource } from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'
import {
  VideoStartEventResolver,
  VideoPlayEventResolver,
  VideoPuaseEventResolver,
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
  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event),
      getVisitorByUserIdAndJourneyId: jest.fn(() => visitorWithId),
      getParentStepBlockByBlockId: jest.fn(() => stepBlock)
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block)
    })
  }

  const block = {
    id: 'block.id',
    journeyId: 'journey.id',
    parentBlockId: 'parent.id',
    title: 'title',
    source: VideoBlockSource.internal,
    videoId: 'video.id',
    videoVariantLanguageId: '539'
  }

  const stepBlock = {
    __typename: 'StepBlock',
    id: 'stepBlock.id',
    parentBlockId: null,
    journeyId: 'journey.id',
    locked: false
  }

  const visitor = {
    _key: 'visitor.id'
  }

  const visitorWithId = keyAsId(visitor)

  describe('videoStartEventCreate', () => {
    let resolver: VideoStartEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoStartEventResolver, eventService, blockService]
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
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId,
        stepId: stepBlock.id,
        label: block.source,
        value: block.title,
        videoId: block.videoId,
        videoVariantLanguageId: block.videoVariantLanguageId
      })
    })
  })

  describe('videoPlayEventCreate', () => {
    let resolver: VideoPlayEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoPlayEventResolver, eventService, blockService]
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
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId,
        stepId: stepBlock.id,
        label: block.source,
        value: block.title,
        videoId: block.videoId,
        videoVariantLanguageId: block.videoVariantLanguageId
      })
    })
  })

  describe('videoPauseEventCreate', () => {
    let resolver: VideoPuaseEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoPuaseEventResolver, eventService, blockService]
      }).compile()
      resolver = module.get<VideoPuaseEventResolver>(VideoPuaseEventResolver)
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
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId,
        stepId: stepBlock.id,
        label: block.source,
        value: block.title,
        videoId: block.videoId,
        videoVariantLanguageId: block.videoVariantLanguageId
      })
    })
  })

  describe('videoCompleteEventCreate', () => {
    let resolver: VideoCompleteEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoCompleteEventResolver, eventService, blockService]
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
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId,
        stepId: stepBlock.id,
        label: block.source,
        value: block.title,
        videoId: block.videoId,
        videoVariantLanguageId: block.videoVariantLanguageId
      })
    })
  })

  describe('videoExpandEventCreate', () => {
    let resolver: VideoExpandEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoExpandEventResolver, eventService, blockService]
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
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId,
        stepId: stepBlock.id,
        label: block.source,
        value: block.title,
        videoId: block.videoId,
        videoVariantLanguageId: block.videoVariantLanguageId
      })
    })
  })

  describe('videoCollapseEventCreate', () => {
    let resolver: VideoCollapseEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoCollapseEventResolver, eventService, blockService]
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
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId,
        stepId: stepBlock.id,
        label: block.source,
        value: block.title,
        videoId: block.videoId,
        videoVariantLanguageId: block.videoVariantLanguageId
      })
    })
  })

  describe('videoProgressEventCreate', () => {
    let resolver: VideoProgressEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoProgressEventResolver, eventService, blockService]
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
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId,
        stepId: stepBlock.id,
        label: block.source,
        value: block.title,
        videoId: block.videoId,
        videoVariantLanguageId: block.videoVariantLanguageId
      })
    })
  })
})
