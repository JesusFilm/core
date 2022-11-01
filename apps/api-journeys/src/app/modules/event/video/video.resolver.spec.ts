import { Test, TestingModule } from '@nestjs/testing'
import { keyAsId } from '@core/nest/decorators/KeyAsId'
import { VideoBlockSource } from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { BlockService } from '../../block/block.service'
import { VisitorService } from '../../visitor/visitor.service'
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
      save: jest.fn((event) => event)
    })
  }

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      get: jest.fn(() => block),
      validateBlock: jest.fn((id) => {
        switch (id) {
          case 'step.id':
            return true
          default:
            return false
        }
      })
    })
  }

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      getByUserIdAndJourneyId: jest.fn(() => visitorWithId)
    })
  }

  const block = {
    id: 'block.id',
    journeyId: 'journey.id'
  }

  const visitor = {
    _key: 'visitor.id'
  }

  const visitorWithId = keyAsId(visitor)

  describe('videoStartEventCreate', () => {
    let resolver: VideoStartEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          VideoStartEventResolver,
          eventService,
          blockService,
          visitorService
        ]
      }).compile()
      resolver = module.get<VideoStartEventResolver>(VideoStartEventResolver)
    })

    const input = {
      id: '1',
      blockId: block.id,
      position: 30.1,
      stepId: 'step.id',
      label: VideoBlockSource.internal,
      value: 'Video title'
    }

    it('returns VideoStartEvent', async () => {
      expect(await resolver.videoStartEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoStartEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId
      })
    })

    it('should throw error when step id does not belong to the same journey as block id', async () => {
      const errorInput = {
        ...input,
        stepId: 'errorStep.id'
      }

      await expect(
        async () => await resolver.videoStartEventCreate('userId', errorInput)
      ).rejects.toThrow(
        `Step ID ${errorInput.stepId} does not exist on Journey with ID ${block.journeyId}`
      )
    })
  })

  describe('videoPlayEventCreate', () => {
    let resolver: VideoPlayEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          VideoPlayEventResolver,
          eventService,
          blockService,
          visitorService
        ]
      }).compile()
      resolver = module.get<VideoPlayEventResolver>(VideoPlayEventResolver)
    })

    const input = {
      id: '1',
      blockId: block.id,
      position: 30.1,
      stepId: 'step.id',
      label: VideoBlockSource.youTube,
      value: 'Video title'
    }

    it('returns VideoPlayEvent', async () => {
      expect(await resolver.videoPlayEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoPlayEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId
      })
    })

    it('should throw error when step id does not belong to the same journey as block id', async () => {
      const errorInput = {
        ...input,
        stepId: 'errorStep.id'
      }

      await expect(
        async () => await resolver.videoPlayEventCreate('userId', errorInput)
      ).rejects.toThrow(
        `Step ID ${errorInput.stepId} does not exist on Journey with ID ${block.journeyId}`
      )
    })
  })

  describe('videoPauseEventCreate', () => {
    let resolver: VideoPuaseEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          VideoPuaseEventResolver,
          eventService,
          blockService,
          visitorService
        ]
      }).compile()
      resolver = module.get<VideoPuaseEventResolver>(VideoPuaseEventResolver)
    })

    const input = {
      id: '1',
      blockId: block.id,
      position: 30.1,
      stepId: 'step.id',
      label: VideoBlockSource.internal,
      value: 'Video title'
    }

    it('returns VideoPauseEvent', async () => {
      expect(await resolver.videoPauseEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoPauseEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId
      })
    })

    it('should throw error when step id does not belong to the same journey as block id', async () => {
      const errorInput = {
        ...input,
        stepId: 'errorStep.id'
      }

      await expect(
        async () => await resolver.videoPauseEventCreate('userId', errorInput)
      ).rejects.toThrow(
        `Step ID ${errorInput.stepId} does not exist on Journey with ID ${block.journeyId}`
      )
    })
  })

  describe('videoCompleteEventCreate', () => {
    let resolver: VideoCompleteEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          VideoCompleteEventResolver,
          eventService,
          blockService,
          visitorService
        ]
      }).compile()
      resolver = module.get<VideoCompleteEventResolver>(
        VideoCompleteEventResolver
      )
    })

    const input = {
      id: '1',
      blockId: block.id,
      position: 30.1,
      stepId: 'step.id',
      label: VideoBlockSource.internal,
      value: 'Video title'
    }

    it('returns VideoCompleteEvent', async () => {
      expect(await resolver.videoCompleteEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoCompleteEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId
      })
    })

    it('should throw error when step id does not belong to the same journey as block id', async () => {
      const errorInput = {
        ...input,
        stepId: 'errorStep.id'
      }

      await expect(
        async () =>
          await resolver.videoCompleteEventCreate('userId', errorInput)
      ).rejects.toThrow(
        `Step ID ${errorInput.stepId} does not exist on Journey with ID ${block.journeyId}`
      )
    })
  })

  describe('videoExpandEventCreate', () => {
    let resolver: VideoExpandEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          VideoExpandEventResolver,
          eventService,
          blockService,
          visitorService
        ]
      }).compile()
      resolver = module.get<VideoExpandEventResolver>(VideoExpandEventResolver)
    })

    const input = {
      id: '1',
      blockId: block.id,
      position: 30.1,
      stepId: 'step.id',
      label: VideoBlockSource.internal,
      value: 'Video title'
    }

    it('returns VideoExpandEvent', async () => {
      expect(await resolver.videoExpandEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoExpandEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId
      })
    })

    it('should throw error when step id does not belong to the same journey as block id', async () => {
      const errorInput = {
        ...input,
        stepId: 'errorStep.id'
      }

      await expect(
        async () => await resolver.videoExpandEventCreate('userId', errorInput)
      ).rejects.toThrow(
        `Step ID ${errorInput.stepId} does not exist on Journey with ID ${block.journeyId}`
      )
    })
  })

  describe('videoCollapseEventCreate', () => {
    let resolver: VideoCollapseEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          VideoCollapseEventResolver,
          eventService,
          blockService,
          visitorService
        ]
      }).compile()
      resolver = module.get<VideoCollapseEventResolver>(
        VideoCollapseEventResolver
      )
    })

    const input = {
      id: '1',
      blockId: block.id,
      position: 30.1,
      stepId: 'step.id',
      label: VideoBlockSource.internal,
      value: 'Video title'
    }

    it('returns VideoCollapseEvent', async () => {
      expect(await resolver.videoCollapseEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoCollapseEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId
      })
    })

    it('should throw error when step id does not belong to the same journey as block id', async () => {
      const errorInput = {
        ...input,
        stepId: 'errorStep.id'
      }

      await expect(
        async () =>
          await resolver.videoCollapseEventCreate('userId', errorInput)
      ).rejects.toThrow(
        `Step ID ${errorInput.stepId} does not exist on Journey with ID ${block.journeyId}`
      )
    })
  })

  describe('videoProgressEventCreate', () => {
    let resolver: VideoProgressEventResolver

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          VideoProgressEventResolver,
          eventService,
          blockService,
          visitorService
        ]
      }).compile()
      resolver = module.get<VideoProgressEventResolver>(
        VideoProgressEventResolver
      )
    })

    const input = {
      id: '1',
      blockId: block.id,
      position: 30.1,
      progress: 25,
      stepId: 'step.id',
      label: VideoBlockSource.internal,
      value: 'Video title'
    }

    it('returns VideoProgressEvent', async () => {
      expect(await resolver.videoProgressEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoProgressEvent',
        visitorId: visitorWithId.id,
        createdAt: new Date().toISOString(),
        journeyId: block.journeyId
      })
    })

    it('should throw error when step id does not belong to the same journey as block id', async () => {
      const errorInput = {
        ...input,
        stepId: 'errorStep.id'
      }

      await expect(
        async () =>
          await resolver.videoProgressEventCreate('userId', errorInput)
      ).rejects.toThrow(
        `Step ID ${errorInput.stepId} does not exist on Journey with ID ${block.journeyId}`
      )
    })
  })
})
