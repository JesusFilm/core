import { Test, TestingModule } from '@nestjs/testing'

import {
  JourneyEventsConnection,
  JourneyEventsFilter
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { EventResolver } from './event.resolver'
import { EventService } from './event.service'

describe('EventResolver', () => {
  let resolver: EventResolver
  let eventService: EventService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventResolver,
        {
          provide: EventService,
          useValue: {
            getJourneyEvents: jest.fn()
          }
        },
        PrismaService
      ]
    }).compile()

    resolver = module.get<EventResolver>(EventResolver)
    eventService = module.get<EventService>(EventService)
  })

  describe('__resolveType', () => {
    it('returns __typename', () => {
      const event = {
        __typename: 'TextResponseSubmissionEvent',
        typename: 'TextResponseSubmissionEvent'
      }

      expect(resolver.__resolveType(event)).toBe('TextResponseSubmissionEvent')
    })

    it('returns typename when __typename is missing', () => {
      const event = {
        typename: 'TextResponseSubmissionEvent'
      }

      expect(resolver.__resolveType(event)).toBe('TextResponseSubmissionEvent')
    })
  })

  describe('journeyEventsConnection', () => {
    it('calls getJourneyEvents and returns the result', async () => {
      const journeyId = 'journey-id'
      const filter: JourneyEventsFilter = {
        typenames: ['TextResponseSubmissionEvent'],
        periodRangeStart: '2023-01-01',
        periodRangeEnd: '2023-01-31'
      }
      const first = 10
      const after = 'cursor-id'

      const mockResponse: JourneyEventsConnection = {
        edges: [
          {
            cursor: 'event-1',
            node: {
              id: 'event-1',
              journeyId: 'journey-id',
              createdAt: '2023-01-15T12:00:00Z',
              label: null,
              value: null
            }
          }
        ],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: 'event-1',
          endCursor: 'event-1'
        }
      }

      jest
        .spyOn(eventService, 'getJourneyEvents')
        .mockResolvedValue(mockResponse)

      const result = await resolver.journeyEventsConnection(
        journeyId,
        filter,
        first,
        after
      )

      expect(eventService.getJourneyEvents).toHaveBeenCalledWith({
        journeyId,
        filter,
        first,
        after
      })
      expect(result).toEqual(mockResponse)
    })

    it('uses default values when not all parameters are provided', async () => {
      const journeyId = 'journey-id'
      const filter: JourneyEventsFilter = {
        typenames: ['TextResponseSubmissionEvent']
      }

      const mockResponse: JourneyEventsConnection = {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null
        }
      }

      jest
        .spyOn(eventService, 'getJourneyEvents')
        .mockResolvedValue(mockResponse)

      await resolver.journeyEventsConnection(journeyId, filter)

      expect(eventService.getJourneyEvents).toHaveBeenCalledWith({
        journeyId,
        filter,
        first: 50,
        after: undefined
      })
    })
  })
})
