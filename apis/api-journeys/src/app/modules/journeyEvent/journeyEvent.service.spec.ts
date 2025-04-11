import { Test, TestingModule } from '@nestjs/testing'

import { Prisma } from '.prisma/api-journeys-client'

import {
  ButtonAction,
  JourneyEventsFilter,
  MessagePlatform,
  VideoBlockSource
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyEventService } from './journeyEvent.service'

describe('JourneyEventService', () => {
  let service: JourneyEventService
  let prismaService: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyEventService,
        {
          provide: PrismaService,
          useValue: {
            event: {
              findMany: jest.fn(),
              count: jest.fn()
            }
          }
        }
      ]
    }).compile()

    service = module.get<JourneyEventService>(JourneyEventService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('generateWhere', () => {
    it('includes all filter parameters in where clause', () => {
      const journeyId = 'journey-1'
      const filter: JourneyEventsFilter = {
        typenames: ['TextResponseSubmissionEvent'],
        periodRangeStart: '2023-01-01',
        periodRangeEnd: '2023-01-31'
      }
      const accessibleEvent: Prisma.EventWhereInput = {
        visitorId: 'visitor-1'
      }

      const result = service.generateWhere(journeyId, filter, accessibleEvent)

      expect(result).toEqual({
        journeyId: 'journey-1',
        createdAt: {
          gte: '2023-01-01',
          lte: '2023-01-31'
        },
        AND: [
          { visitorId: 'visitor-1' },
          { typename: { in: ['TextResponseSubmissionEvent'] } }
        ]
      })
    })

    it('accepts minimal parameters in where clause', () => {
      const journeyId = 'journey-1'
      const filter: JourneyEventsFilter = {}
      const accessibleEvent: Prisma.EventWhereInput = {}

      const result = service.generateWhere(journeyId, filter, accessibleEvent)

      expect(result).toEqual({
        journeyId: 'journey-1',
        createdAt: {
          gte: undefined,
          lte: undefined
        },
        AND: [{}]
      })
    })

    it('excludes null values from where clause', () => {
      const journeyId = 'journey-1'
      const filter: JourneyEventsFilter = {
        typenames: null,
        periodRangeStart: null,
        periodRangeEnd: null
      }
      const accessibleEvent: Prisma.EventWhereInput = {}

      const result = service.generateWhere(journeyId, filter, accessibleEvent)

      expect(result).toEqual({
        journeyId: 'journey-1',
        createdAt: {
          gte: undefined,
          lte: undefined
        },
        AND: [{}]
      })
    })
  })

  describe('getJourneyEvents', () => {
    it('returns correctly structured paginated events', async () => {
      const journeyId = 'journey-1'
      const filter: JourneyEventsFilter = {
        typenames: ['TextResponseSubmissionEvent']
      }
      const accessibleEvent: Prisma.EventWhereInput = {}
      const first = 2
      const after = 'event-1'

      const mockEvents = [
        {
          id: 'event-2',
          journeyId: 'journey-1',
          createdAt: new Date('2023-01-15T12:00:00Z'),
          updatedAt: new Date('2023-01-15T12:00:00Z'),
          typename: 'TextResponseSubmissionEvent',
          visitorId: 'visitor-1',
          label: 'Event 2',
          value: 'Value 2',
          action: ButtonAction.NavigateToBlockAction,
          actionValue: 'next',
          messagePlatform: MessagePlatform.facebook,
          email: 'test@example.com',
          blockId: 'block-1',
          stepId: null,
          nextStepId: null,
          previousStepId: null,
          userId: 'user-1',
          languageId: 'en',
          radioOptionBlockId: null,
          position: 30,
          source: VideoBlockSource.internal,
          progress: 0.5,
          journeyVisitorJourneyId: 'journey-1',
          journeyVisitorVisitorId: 'visitor-1',
          journey: {
            id: 'journey-1',
            slug: 'test-journey'
          },
          visitor: {
            id: 'visitor-1',
            name: 'Test Visitor',
            email: 'visitor@test.com',
            phone: '1234567890'
          }
        },
        {
          id: 'event-3',
          journeyId: 'journey-1',
          createdAt: new Date('2023-01-14T12:00:00Z'),
          updatedAt: new Date('2023-01-14T12:00:00Z'),
          typename: 'TextResponseSubmissionEvent',
          visitorId: 'visitor-1',
          label: 'Event 3',
          value: 'Value 3',
          action: null,
          actionValue: null,
          messagePlatform: null,
          email: null,
          blockId: null,
          stepId: null,
          nextStepId: null,
          previousStepId: null,
          userId: 'user-1',
          languageId: 'en',
          radioOptionBlockId: null,
          position: null,
          source: null,
          progress: null,
          journeyVisitorJourneyId: 'journey-1',
          journeyVisitorVisitorId: 'visitor-1',
          journey: {
            id: 'journey-1',
            slug: 'test-journey'
          },
          visitor: {
            id: 'visitor-1',
            name: 'Test Visitor',
            email: 'visitor@test.com',
            phone: '1234567890'
          }
        },
        {
          id: 'event-4',
          journeyId: 'journey-1',
          createdAt: new Date('2023-01-13T12:00:00Z'),
          updatedAt: new Date('2023-01-13T12:00:00Z'),
          typename: 'TextResponseSubmissionEvent',
          visitorId: 'visitor-1',
          label: 'Event 4',
          value: 'Value 4',
          action: null,
          actionValue: null,
          messagePlatform: null,
          email: null,
          blockId: null,
          stepId: null,
          nextStepId: null,
          previousStepId: null,
          userId: 'user-1',
          languageId: 'en',
          radioOptionBlockId: null,
          position: null,
          source: null,
          progress: null,
          journeyVisitorJourneyId: 'journey-1',
          journeyVisitorVisitorId: 'visitor-1',
          journey: {
            id: 'journey-1',
            slug: 'test-journey'
          },
          visitor: {
            id: 'visitor-1',
            name: 'Test Visitor',
            email: 'visitor@test.com',
            phone: '1234567890'
          }
        }
      ]

      jest.spyOn(prismaService.event, 'findMany').mockResolvedValue(mockEvents)

      const result = await service.getJourneyEvents({
        journeyId,
        accessibleEvent,
        filter,
        first,
        after
      })

      expect(prismaService.event.findMany).toHaveBeenCalledWith({
        where: {
          journeyId: 'journey-1',
          createdAt: {
            gte: undefined,
            lte: undefined
          },
          AND: [{}, { typename: { in: ['TextResponseSubmissionEvent'] } }]
        },
        select: {
          id: true,
          journeyId: true,
          createdAt: true,
          label: true,
          value: true,
          typename: true,
          visitorId: true,
          action: true,
          actionValue: true,
          messagePlatform: true,
          email: true,
          blockId: true,
          position: true,
          source: true,
          progress: true,
          journey: {
            select: {
              id: true,
              slug: true
            }
          },
          visitor: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        cursor: { id: 'event-1' },
        skip: 1,
        take: 3
      })

      expect(result).toEqual({
        edges: [
          {
            node: {
              id: 'event-2',
              journeyId: 'journey-1',
              createdAt: '2023-01-15T12:00:00.000Z',
              updatedAt: new Date('2023-01-15T12:00:00Z'),
              label: 'Event 2',
              value: 'Value 2',
              typename: 'TextResponseSubmissionEvent',
              visitorId: 'visitor-1',
              action: ButtonAction.NavigateToBlockAction,
              actionValue: 'next',
              messagePlatform: MessagePlatform.facebook,
              email: 'test@example.com',
              blockId: 'block-1',
              stepId: null,
              nextStepId: null,
              previousStepId: null,
              userId: 'user-1',
              languageId: 'en',
              radioOptionBlockId: null,
              position: 30,
              source: VideoBlockSource.internal,
              progress: 0.5,
              journeyVisitorJourneyId: 'journey-1',
              journeyVisitorVisitorId: 'visitor-1',
              journeySlug: 'test-journey',
              visitorName: 'Test Visitor',
              visitorEmail: 'visitor@test.com',
              visitorPhone: '1234567890'
            },
            cursor: 'event-2'
          },
          {
            node: {
              id: 'event-3',
              journeyId: 'journey-1',
              createdAt: '2023-01-14T12:00:00.000Z',
              updatedAt: new Date('2023-01-14T12:00:00Z'),
              label: 'Event 3',
              value: 'Value 3',
              typename: 'TextResponseSubmissionEvent',
              visitorId: 'visitor-1',
              action: null,
              actionValue: null,
              messagePlatform: null,
              email: null,
              blockId: null,
              stepId: null,
              nextStepId: null,
              previousStepId: null,
              userId: 'user-1',
              languageId: 'en',
              radioOptionBlockId: null,
              position: null,
              source: null,
              progress: null,
              journeyVisitorJourneyId: 'journey-1',
              journeyVisitorVisitorId: 'visitor-1',
              journeySlug: 'test-journey',
              visitorName: 'Test Visitor',
              visitorEmail: 'visitor@test.com',
              visitorPhone: '1234567890'
            },
            cursor: 'event-3'
          }
        ],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: 'event-2',
          endCursor: 'event-3'
        }
      })
    })

    it('returns empty edges for no results', async () => {
      const journeyId = 'journey-1'
      const filter: JourneyEventsFilter = {
        typenames: ['TextResponseSubmissionEvent']
      }
      const accessibleEvent: Prisma.EventWhereInput = {}
      const first = 10

      jest.spyOn(prismaService.event, 'findMany').mockResolvedValue([])

      const result = await service.getJourneyEvents({
        journeyId,
        accessibleEvent,
        filter,
        first
      })

      expect(prismaService.event.findMany).toHaveBeenCalledWith({
        where: {
          journeyId: 'journey-1',
          createdAt: {
            gte: undefined,
            lte: undefined
          },
          AND: [{}, { typename: { in: ['TextResponseSubmissionEvent'] } }]
        },
        select: {
          id: true,
          journeyId: true,
          createdAt: true,
          label: true,
          value: true,
          typename: true,
          visitorId: true,
          action: true,
          actionValue: true,
          messagePlatform: true,
          email: true,
          blockId: true,
          position: true,
          source: true,
          progress: true,
          journey: {
            select: {
              id: true,
              slug: true
            }
          },
          visitor: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        cursor: undefined,
        skip: 0,
        take: 11
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

    it('handles exact size result set', async () => {
      const journeyId = 'journey-1'
      const filter: JourneyEventsFilter = {
        typenames: ['TextResponseSubmissionEvent']
      }
      const accessibleEvent: Prisma.EventWhereInput = {}
      const first = 2

      const mockEvents = [
        {
          id: 'event-1',
          journeyId: 'journey-1',
          createdAt: new Date('2023-01-15T12:00:00Z'),
          updatedAt: new Date('2023-01-15T12:00:00Z'),
          typename: 'TextResponseSubmissionEvent',
          visitorId: 'visitor-1',
          label: null,
          value: null,
          action: null,
          actionValue: null,
          messagePlatform: null,
          email: null,
          blockId: null,
          stepId: null,
          nextStepId: null,
          previousStepId: null,
          userId: 'user-1',
          languageId: 'en',
          radioOptionBlockId: null,
          position: null,
          source: null,
          progress: null,
          journeyVisitorJourneyId: 'journey-1',
          journeyVisitorVisitorId: 'visitor-1',
          journey: {
            id: 'journey-1',
            slug: 'test-journey'
          },
          visitor: {
            id: 'visitor-1',
            name: 'Test Visitor',
            email: 'visitor@test.com',
            phone: '1234567890'
          }
        },
        {
          id: 'event-2',
          journeyId: 'journey-1',
          createdAt: new Date('2023-01-14T12:00:00Z'),
          updatedAt: new Date('2023-01-14T12:00:00Z'),
          typename: 'TextResponseSubmissionEvent',
          visitorId: 'visitor-1',
          label: null,
          value: null,
          action: null,
          actionValue: null,
          messagePlatform: null,
          email: null,
          blockId: null,
          stepId: null,
          nextStepId: null,
          previousStepId: null,
          userId: 'user-1',
          languageId: 'en',
          radioOptionBlockId: null,
          position: null,
          source: null,
          progress: null,
          journeyVisitorJourneyId: 'journey-1',
          journeyVisitorVisitorId: 'visitor-1',
          journey: {
            id: 'journey-1',
            slug: 'test-journey'
          },
          visitor: {
            id: 'visitor-1',
            name: 'Test Visitor',
            email: 'visitor@test.com',
            phone: '1234567890'
          }
        }
      ]

      jest.spyOn(prismaService.event, 'findMany').mockResolvedValue(mockEvents)

      const result = await service.getJourneyEvents({
        journeyId,
        accessibleEvent,
        filter,
        first
      })

      expect(result.edges).toHaveLength(2)
      expect(result.pageInfo.hasNextPage).toBe(false)
      expect(result.pageInfo.startCursor).toBe('event-1')
      expect(result.pageInfo.endCursor).toBe('event-2')
    })
  })

  describe('getJourneyEventsCount', () => {
    it('returns the correct count of events', async () => {
      const journeyId = 'journey-1'
      const filter: JourneyEventsFilter = {
        typenames: ['TextResponseSubmissionEvent']
      }
      const accessibleEvent: Prisma.EventWhereInput = {}

      const mockEvents = [
        {
          id: 'event-2',
          journeyId: 'journey-1',
          createdAt: new Date('2023-01-15T12:00:00Z'),
          updatedAt: new Date('2023-01-15T12:00:00Z'),
          typename: 'TextResponseSubmissionEvent',
          visitorId: 'visitor-1',
          label: 'Event 2',
          value: 'Value 2',
          action: ButtonAction.NavigateToBlockAction,
          actionValue: 'next',
          messagePlatform: MessagePlatform.facebook,
          email: 'test@example.com',
          blockId: 'block-1',
          stepId: null,
          nextStepId: null,
          previousStepId: null,
          userId: 'user-1',
          languageId: 'en',
          radioOptionBlockId: null,
          position: 30,
          source: VideoBlockSource.internal,
          progress: 0.5,
          journeyVisitorJourneyId: 'journey-1',
          journeyVisitorVisitorId: 'visitor-1',
          journey: {
            id: 'journey-1',
            slug: 'test-journey'
          },
          visitor: {
            id: 'visitor-1',
            name: 'Test Visitor',
            email: 'visitor@test.com'
          }
        },
        {
          id: 'event-3',
          journeyId: 'journey-1',
          createdAt: new Date('2023-01-14T12:00:00Z'),
          updatedAt: new Date('2023-01-14T12:00:00Z'),
          typename: 'TextResponseSubmissionEvent',
          visitorId: 'visitor-1',
          label: 'Event 3',
          value: 'Value 3',
          action: null,
          actionValue: null,
          messagePlatform: null,
          email: null,
          blockId: null,
          stepId: null,
          nextStepId: null,
          previousStepId: null,
          userId: 'user-1',
          languageId: 'en',
          radioOptionBlockId: null,
          position: null,
          source: null,
          progress: null,
          journeyVisitorJourneyId: 'journey-1',
          journeyVisitorVisitorId: 'visitor-1',
          journey: {
            id: 'journey-1',
            slug: 'test-journey'
          },
          visitor: {
            id: 'visitor-1',
            name: 'Test Visitor',
            email: 'visitor@test.com'
          }
        },
        {
          id: 'event-4',
          journeyId: 'journey-1',
          createdAt: new Date('2023-01-13T12:00:00Z'),
          updatedAt: new Date('2023-01-13T12:00:00Z'),
          typename: 'TextResponseSubmissionEvent',
          visitorId: 'visitor-1',
          label: 'Event 4',
          value: 'Value 4',
          action: null,
          actionValue: null,
          messagePlatform: null,
          email: null,
          blockId: null,
          stepId: null,
          nextStepId: null,
          previousStepId: null,
          userId: 'user-1',
          languageId: 'en',
          radioOptionBlockId: null,
          position: null,
          source: null,
          progress: null,
          journeyVisitorJourneyId: 'journey-1',
          journeyVisitorVisitorId: 'visitor-1',
          journey: {
            id: 'journey-1',
            slug: 'test-journey'
          },
          visitor: {
            id: 'visitor-1',
            name: 'Test Visitor',
            email: 'visitor@test.com'
          }
        }
      ]

      jest
        .spyOn(prismaService.event, 'count')
        .mockResolvedValue(mockEvents.length)

      const result = await service.getJourneyEventsCount({
        journeyId,
        accessibleEvent,
        filter
      })

      expect(prismaService.event.count).toHaveBeenCalledWith({
        where: {
          journeyId: 'journey-1',
          createdAt: {
            gte: undefined,
            lte: undefined
          },
          AND: [{}, { typename: { in: ['TextResponseSubmissionEvent'] } }]
        }
      })

      expect(result).toEqual(mockEvents.length)
    })
  })
})
