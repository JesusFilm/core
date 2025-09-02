import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { VisitorService } from '../visitor/visitor.service'

import { EventService } from './event.service'

describe('EventService', () => {
  let service: EventService, prismaService: PrismaService
  let emailQueue

  const blockService = {
    provide: BlockService,
    useFactory: () => ({
      validateBlock: jest.fn((stepId) => {
        switch (stepId) {
          case step.id:
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
      getByUserIdAndJourneyId: jest.fn((userId) => {
        switch (userId) {
          case visitor.userId:
            return { visitor, journeyVisitor }
          default:
            return null
        }
      })
    })
  }

  const block = {
    id: 'block.id',
    journeyId: 'journey.id'
  }

  const step = {
    id: 'step.id',
    journeyId: 'journey.id'
  }

  const visitor = {
    id: 'visitor.id',
    userId: 'user.id'
  }

  const journeyVisitor = {
    journeyId: 'journey.id',
    visitorId: 'visitor.id'
  }

  beforeEach(async () => {
    emailQueue = {
      add: jest.fn(),
      getJob: jest.fn(),
      remove: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        blockService,
        visitorService,
        PrismaService,
        {
          provide: getQueueToken('api-journeys-events-email'),
          useValue: emailQueue
        }
      ]
    }).compile()

    service = module.get<EventService>(EventService)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.block.findUnique = jest.fn().mockImplementation((input) => {
      switch (input.where.id) {
        case block.id:
          return block
        default:
          return null
      }
    })
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  describe('ValidateBlockEvent', () => {
    it('should return the visitor id and journey id', async () => {
      expect(
        await service.validateBlockEvent('user.id', 'block.id', 'step.id')
      ).toEqual({
        visitor,
        journeyVisitor,
        journeyId: 'journey.id',
        block
      })
    })

    it('should throw user input error if block does not exist', async () => {
      await expect(
        async () =>
          await service.validateBlockEvent(
            'user.id',
            'anotherBlock.id',
            step.id
          )
      ).rejects.toThrow('Block does not exist')
    })

    it('should throw user input error if visitor does not exist', async () => {
      await expect(
        async () =>
          await service.validateBlockEvent('anotherUser.id', block.id, step.id)
      ).rejects.toThrow('Visitor does not exist')
    })

    it('should throw user input error if step block does not belong to the same journey as the block', async () => {
      await expect(
        async () =>
          await service.validateBlockEvent(
            'user.id',
            block.id,
            'anotherStep.id'
          )
      ).rejects.toThrow(
        'Step ID anotherStep.id does not exist on Journey with ID journey.id'
      )
    })
  })

  describe('sendEventsEmail', () => {
    const journeyId = 'journey-id'
    const visitorId = 'visitor-id'

    it('should send events email', async () => {
      await service.sendEventsEmail(journeyId, visitorId)
      expect(emailQueue.add).toHaveBeenCalledWith(
        'visitor-event',
        {
          journeyId,
          visitorId
        },
        {
          delay: 120000,
          jobId: 'visitor-event-journey-id-visitor-id',
          removeOnComplete: true,
          removeOnFail: { age: 86400, count: 50 }
        }
      )
    })

    it('should remove the job if it exists and send events email', async () => {
      emailQueue.getJob.mockResolvedValueOnce({})
      await service.sendEventsEmail(journeyId, visitorId)
      expect(emailQueue.remove).toHaveBeenCalled()
      expect(emailQueue.add).toHaveBeenCalledWith(
        'visitor-event',
        {
          journeyId,
          visitorId
        },
        {
          delay: 120000,
          jobId: 'visitor-event-journey-id-visitor-id',
          removeOnComplete: true,
          removeOnFail: { age: 86400, count: 50 }
        }
      )
    })
  })

  describe('resetEventsEmailDelay', () => {
    it('should reset events email delay', async () => {
      const changeDelay = jest.fn()
      emailQueue.getJob.mockResolvedValueOnce({
        changeDelay
      })
      const journeyId = 'journey-id'
      const visitorId = 'visitor-id'
      await service.resetEventsEmailDelay(journeyId, visitorId)
      await expect(changeDelay).toHaveBeenCalledWith(120000)
    })

    it('should adjust email delay based on custom input', async () => {
      const changeDelay = jest.fn()
      emailQueue.getJob.mockResolvedValueOnce({
        changeDelay
      })
      const journeyId = 'journey-id'
      const visitorId = 'visitor-id'
      await service.resetEventsEmailDelay(journeyId, visitorId, 180)
      await expect(changeDelay).toHaveBeenCalledWith(180000)
    })

    it('should use default delay if custom input is invalid', async () => {
      const changeDelay = jest.fn()
      emailQueue.getJob.mockResolvedValueOnce({
        changeDelay
      })
      const journeyId = 'journey-id'
      const visitorId = 'visitor-id'
      await service.resetEventsEmailDelay(journeyId, visitorId, -1)
      await expect(changeDelay).toHaveBeenCalledWith(120000)
    })
  })
})
