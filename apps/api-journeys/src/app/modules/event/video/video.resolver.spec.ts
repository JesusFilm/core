import { Test, TestingModule } from '@nestjs/testing'
import { VideoBlockSource } from '../../../__generated__/graphql'
import { EventService } from '../event.service'
import { VisitorService } from '../../visitor/visitor.service'
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

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      save: jest.fn((event) => event),
      validateBlockEvent: jest.fn(() => response)
    })
  }

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      update: jest.fn(() => null)
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
    let resolver: VideoStartEventResolver, vService: VisitorService

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoStartEventResolver, eventService, visitorService]
      }).compile()
      resolver = module.get<VideoStartEventResolver>(VideoStartEventResolver)
      vService = module.get<VisitorService>(VisitorService)
    })

    it('returns VideoStartEvent', async () => {
      expect(await resolver.videoStartEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoStartEvent',
        createdAt: new Date().toISOString()
      })
    })

    it('returns object for federation', () => {
      expect(resolver.source({ value: VideoBlockSource.youTube })).toEqual(
        VideoBlockSource.youTube
      )
    })

    it('should update visitor last event at', async () => {
      await resolver.videoStartEventCreate('userid', input)

      expect(vService.update).toHaveBeenCalledWith('visitor.id', {
        lastEventAt: new Date().toISOString()
      })
    })
  })

  describe('videoPlayEventCreate', () => {
    let resolver: VideoPlayEventResolver, vService: VisitorService

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoPlayEventResolver, eventService, visitorService]
      }).compile()
      resolver = module.get<VideoPlayEventResolver>(VideoPlayEventResolver)
      vService = module.get<VisitorService>(VisitorService)
    })

    it('returns VideoPlayEvent', async () => {
      expect(await resolver.videoPlayEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoPlayEvent',
        createdAt: new Date().toISOString()
      })
    })

    it('returns object for federation', () => {
      expect(resolver.source({ value: VideoBlockSource.internal })).toEqual(
        VideoBlockSource.internal
      )
    })

    it('should update visitor last event at', async () => {
      await resolver.videoPlayEventCreate('userid', input)

      expect(vService.update).toHaveBeenCalledWith('visitor.id', {
        lastEventAt: new Date().toISOString()
      })
    })
  })

  describe('videoPauseEventCreate', () => {
    let resolver: VideoPauseEventResolver, vService: VisitorService

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoPauseEventResolver, eventService, visitorService]
      }).compile()
      resolver = module.get<VideoPauseEventResolver>(VideoPauseEventResolver)
      vService = module.get<VisitorService>(VisitorService)
    })

    it('returns VideoPauseEvent', async () => {
      expect(await resolver.videoPauseEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoPauseEvent',
        createdAt: new Date().toISOString()
      })
    })

    it('returns object for federation', () => {
      expect(resolver.source({ value: VideoBlockSource.youTube })).toEqual(
        VideoBlockSource.youTube
      )
    })

    it('should update visitor last event at', async () => {
      await resolver.videoPauseEventCreate('userid', input)

      expect(vService.update).toHaveBeenCalledWith('visitor.id', {
        lastEventAt: new Date().toISOString()
      })
    })
  })

  describe('videoCompleteEventCreate', () => {
    let resolver: VideoCompleteEventResolver, vService: VisitorService

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoCompleteEventResolver, eventService, visitorService]
      }).compile()
      resolver = module.get<VideoCompleteEventResolver>(
        VideoCompleteEventResolver
      )
      vService = module.get<VisitorService>(VisitorService)
    })

    it('returns VideoCompleteEvent', async () => {
      expect(await resolver.videoCompleteEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoCompleteEvent',
        createdAt: new Date().toISOString()
      })
    })

    it('returns object for federation', () => {
      expect(resolver.source({ value: VideoBlockSource.youTube })).toEqual(
        VideoBlockSource.youTube
      )
    })

    it('should update visitor last event at', async () => {
      await resolver.videoCompleteEventCreate('userid', input)

      expect(vService.update).toHaveBeenCalledWith('visitor.id', {
        lastEventAt: new Date().toISOString()
      })
    })
  })

  describe('videoExpandEventCreate', () => {
    let resolver: VideoExpandEventResolver, vService: VisitorService

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoExpandEventResolver, eventService, visitorService]
      }).compile()
      resolver = module.get<VideoExpandEventResolver>(VideoExpandEventResolver)
      vService = module.get<VisitorService>(VisitorService)
    })

    it('returns VideoExpandEvent', async () => {
      expect(await resolver.videoExpandEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoExpandEvent',
        createdAt: new Date().toISOString()
      })
    })

    it('returns object for federation', () => {
      expect(resolver.source({ value: VideoBlockSource.youTube })).toEqual(
        VideoBlockSource.youTube
      )
    })

    it('should update visitor last event at', async () => {
      await resolver.videoExpandEventCreate('userid', input)

      expect(vService.update).toHaveBeenCalledWith('visitor.id', {
        lastEventAt: new Date().toISOString()
      })
    })
  })

  describe('videoCollapseEventCreate', () => {
    let resolver: VideoCollapseEventResolver, vService: VisitorService

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoCollapseEventResolver, eventService, visitorService]
      }).compile()
      resolver = module.get<VideoCollapseEventResolver>(
        VideoCollapseEventResolver
      )
      vService = module.get<VisitorService>(VisitorService)
    })

    it('returns VideoCollapseEvent', async () => {
      expect(await resolver.videoCollapseEventCreate('userid', input)).toEqual({
        ...input,
        __typename: 'VideoCollapseEvent',
        createdAt: new Date().toISOString()
      })
    })

    it('returns object for federation', () => {
      expect(resolver.source({ value: VideoBlockSource.youTube })).toEqual(
        VideoBlockSource.youTube
      )
    })

    it('should update visitor last event at', async () => {
      await resolver.videoCollapseEventCreate('userid', input)

      expect(vService.update).toHaveBeenCalledWith('visitor.id', {
        lastEventAt: new Date().toISOString()
      })
    })
  })

  describe('videoProgressEventCreate', () => {
    let resolver: VideoProgressEventResolver, vService: VisitorService

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [VideoProgressEventResolver, eventService, visitorService]
      }).compile()
      resolver = module.get<VideoProgressEventResolver>(
        VideoProgressEventResolver
      )
      vService = module.get<VisitorService>(VisitorService)
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
        __typename: 'VideoProgressEvent',
        createdAt: new Date().toISOString()
      })
    })

    it('returns object for federation', () => {
      expect(resolver.source({ value: VideoBlockSource.youTube })).toEqual(
        VideoBlockSource.youTube
      )
    })

    it('should update visitor last event at', async () => {
      await resolver.videoProgressEventCreate('userid', progressInput)

      expect(vService.update).toHaveBeenCalledWith('visitor.id', {
        lastEventAt: new Date().toISOString()
      })
    })
  })
})
