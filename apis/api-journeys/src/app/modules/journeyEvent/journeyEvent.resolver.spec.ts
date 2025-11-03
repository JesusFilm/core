import { Reflector } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'

import { CaslFactory } from '@core/nest/common/CaslAuthModule'
import { Prisma } from '@core/prisma/journeys/client'

import {
  JourneyEventsConnection,
  JourneyEventsFilter
} from '../../__generated__/graphql'
import { AppCaslGuard } from '../../lib/casl/caslGuard'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyEventResolver } from './journeyEvent.resolver'
import { JourneyEventService } from './journeyEvent.service'

class MockCaslFactory extends CaslFactory {
  createAbility = jest.fn().mockResolvedValue({
    can: jest.fn().mockReturnValue(true)
  })
}

describe('JourneyEventResolver', () => {
  let resolver: JourneyEventResolver
  let journeyEventService: JourneyEventService

  const mockJourneyEventService = {
    getJourneyEvents: jest.fn(),
    getJourneyEventsCount: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyEventResolver,
        {
          provide: JourneyEventService,
          useValue: mockJourneyEventService
        },
        {
          provide: PrismaService,
          useValue: {
            journey: {
              findUnique: jest.fn()
            },
            visitor: {
              findUnique: jest.fn()
            },
            journeyVisitor: {
              findUnique: jest.fn()
            }
          }
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn().mockReturnValue([])
          }
        },
        {
          provide: CaslFactory,
          useClass: MockCaslFactory
        },
        {
          provide: AppCaslGuard,
          useValue: {
            canActivate: jest.fn().mockResolvedValue(true)
          }
        }
      ]
    }).compile()

    resolver = module.get<JourneyEventResolver>(JourneyEventResolver)
    journeyEventService = module.get<JourneyEventService>(JourneyEventService)
  })

  describe('journeyEventsConnection', () => {
    it('calls getJourneyEvents with correct parameters', async () => {
      const accessibleEvent: Prisma.EventWhereInput = {}
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
        .spyOn(journeyEventService, 'getJourneyEvents')
        .mockResolvedValue(mockResponse)

      const result = await resolver.journeyEventsConnection(
        accessibleEvent,
        journeyId,
        filter,
        first,
        after
      )

      expect(journeyEventService.getJourneyEvents).toHaveBeenCalledWith({
        journeyId,
        accessibleEvent,
        filter,
        first,
        after
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('journeyEventsCount', () => {
    it('calls getJourneyEventsCount with correct parameters', async () => {
      const accessibleEvent: Prisma.EventWhereInput = {}
      const journeyId = 'journey-id'
      const filter: JourneyEventsFilter = {
        typenames: ['TextResponseSubmissionEvent']
      }

      const mockResponse = 10

      jest
        .spyOn(journeyEventService, 'getJourneyEventsCount')
        .mockResolvedValue(mockResponse)

      const result = await resolver.journeyEventsCount(
        accessibleEvent,
        journeyId,
        filter
      )

      expect(journeyEventService.getJourneyEventsCount).toHaveBeenCalledWith({
        accessibleEvent,
        journeyId,
        filter
      })
      expect(result).toEqual(mockResponse)
    })
  })
})
