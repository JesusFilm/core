import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'

import { JourneyEventsFilter } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { VisitorService } from '../visitor/visitor.service'

import { EventService } from './event.service'

describe('EventService', () => {
  let service: EventService
  let prismaService: PrismaService
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
        {
          provide: PrismaService,
          useValue: {
            block: {
              findUnique: jest.fn((args) => {
                if (args.where.id === block.id) {
                  return block
                }
                return null
              })
            },
            event: {
              findMany: jest.fn(),
              create: jest.fn()
            }
          }
        },
        {
          provide: getQueueToken('api-journeys-events-email'),
          useValue: emailQueue
        }
      ]
    }).compile()

    service = module.get<EventService>(EventService)
    prismaService = module.get<PrismaService>(PrismaService)
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

  describe('generateWhere', () => {
    const journeyId = 'journey-id'

    it('should return where clause with journeyId only when filter is empty', () => {
      const filter: JourneyEventsFilter = {}
      const where = service.generateWhere(journeyId, filter)
      expect(where).toEqual({
        journeyId,
        createdAt: {
          gte: undefined,
          lte: undefined
        }
      })
    })

    it('should include typenames in where clause when provided', () => {
      const filter: JourneyEventsFilter = {
        typenames: ['TextResponseSubmissionEvent', 'ButtonClickEvent']
      }
      const where = service.generateWhere(journeyId, filter)
      expect(where).toEqual({
        journeyId,
        createdAt: {
          gte: undefined,
          lte: undefined
        },
        AND: [
          {
            typename: {
              in: ['TextResponseSubmissionEvent', 'ButtonClickEvent']
            }
          }
        ]
      })
    })

    it('should include date range in where clause when provided', () => {
      const filter: JourneyEventsFilter = {
        periodRangeStart: '2023-01-01',
        periodRangeEnd: '2023-01-31'
      }
      const where = service.generateWhere(journeyId, filter)
      expect(where).toEqual({
        journeyId,
        createdAt: {
          gte: '2023-01-01',
          lte: '2023-01-31'
        }
      })
    })

    it('should combine all filters when provided', () => {
      const filter: JourneyEventsFilter = {
        typenames: ['TextResponseSubmissionEvent'],
        periodRangeStart: '2023-01-01',
        periodRangeEnd: '2023-01-31'
      }
      const where = service.generateWhere(journeyId, filter)
      expect(where).toEqual({
        journeyId,
        createdAt: {
          gte: '2023-01-01',
          lte: '2023-01-31'
        },
        AND: [
          {
            typename: { in: ['TextResponseSubmissionEvent'] }
          }
        ]
      })
    })
  })

  describe('getJourneyEvents method', () => {
    const journeyId = 'journey-id'

    it('should transform events to connection format correctly', async () => {
      // Create mock for findMany that returns the data we expect
      const mockEvents = [
        {
          id: 'event-1',
          journeyId: 'journey-id',
          createdAt: new Date('2023-01-15T12:00:00Z'),
          typename: 'TextResponseSubmissionEvent',
          action: 'submit',
          label: 'Test Label',
          value: 'Test Value'
        },
        {
          id: 'event-2',
          journeyId: 'journey-id',
          createdAt: new Date('2023-01-16T12:00:00Z'),
          typename: 'ButtonClickEvent',
          action: null,
          label: null,
          value: null
        }
      ]

      // Use direct mocking of the findMany function
      prismaService.event.findMany = jest.fn().mockResolvedValue(mockEvents)

      const filter: JourneyEventsFilter = {
        typenames: ['TextResponseSubmissionEvent']
      }
      const result = await service.getJourneyEvents({
        journeyId,
        filter,
        first: 10
      })

      // Test the output
      expect(result.edges.length).toBe(2)
      expect(result.edges[0].cursor).toBe('event-1')
      expect(result.edges[0].node.id).toBe('event-1')
      expect(result.edges[0].node.journeyId).toBe('journey-id')
      expect(result.edges[0].node.createdAt).toBe('2023-01-15T12:00:00.000Z')

      // Check the mapping is done correctly
      const firstNode = result.edges[0].node as any
      expect(firstNode.buttonAction).toBe('submit')

      // Verify pagination info
      expect(result.pageInfo.hasNextPage).toBe(false)
      expect(result.pageInfo.startCursor).toBe('event-1')
      expect(result.pageInfo.endCursor).toBe('event-2')

      // Verify correct arguments were passed to findMany, including createdAt property
      expect(prismaService.event.findMany).toHaveBeenCalledWith({
        where: {
          journeyId,
          createdAt: {
            gte: undefined,
            lte: undefined
          },
          AND: [{ typename: { in: ['TextResponseSubmissionEvent'] } }]
        },
        orderBy: { createdAt: 'desc' },
        cursor: undefined,
        skip: 0,
        take: 11
      })
    })

    it('should handle empty results correctly', async () => {
      prismaService.event.findMany = jest.fn().mockResolvedValue([])

      const filter: JourneyEventsFilter = {}
      const result = await service.getJourneyEvents({
        journeyId,
        filter,
        first: 10
      })

      expect(result).toEqual({
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null
        }
      })
    })

    it('should handle hasNextPage correctly when more results exist', async () => {
      // Create more events than requested to test pagination
      const mockEvents = Array(3)
        .fill(null)
        .map((_, i) => ({
          id: `event-${i + 1}`,
          journeyId: 'journey-id',
          createdAt: new Date(`2023-01-${15 + i}T12:00:00Z`),
          typename:
            i === 2
              ? 'JourneyViewEvent'
              : i === 0
                ? 'TextResponseSubmissionEvent'
                : 'ButtonClickEvent',
          action: i === 0 ? 'submit' : null
        }))

      prismaService.event.findMany = jest.fn().mockResolvedValue(mockEvents)

      const filter: JourneyEventsFilter = {}
      const result = await service.getJourneyEvents({
        journeyId,
        filter,
        first: 2
      })

      expect(result.edges.length).toBe(2)
      expect(result.pageInfo.hasNextPage).toBe(true)
      expect(result.pageInfo.endCursor).toBe('event-2')
    })
  })
})
