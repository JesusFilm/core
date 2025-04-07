import { Reflector } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'

import { Journey, Prisma, Visitor } from '.prisma/api-journeys-client'
import { CaslFactory } from '@core/nest/common/CaslAuthModule'

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

  describe('__resolveType', () => {
    it('returns __typename when present', () => {
      const event = {
        __typename: 'TextResponseSubmissionEvent',
        typename: 'OtherType'
      }

      expect(resolver.__resolveType(event)).toBe('TextResponseSubmissionEvent')
    })

    it('falls back to typename when __typename is missing', () => {
      const event = {
        typename: 'TextResponseSubmissionEvent'
      }

      expect(resolver.__resolveType(event)).toBe('TextResponseSubmissionEvent')
    })
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

  describe('journey field resolver', () => {
    it('fetches journey by journeyId', async () => {
      const event = { journeyId: 'journey-1' }
      const mockJourney = {
        id: 'journey-1',
        title: 'Test Journey',
        languageId: 'en',
        description: null,
        slug: 'test-journey',
        archivedAt: null,
        createdAt: new Date(),
        deletedAt: null,
        publishedAt: null,
        trashedAt: null,
        featuredAt: null,
        seoTitle: null,
        seoDescription: null,
        status: 'draft',
        teamId: 'team-1',
        themeMode: 'light',
        themeName: 'base',
        updatedAt: new Date()
      } as Journey

      jest
        .spyOn(resolver['prismaService'].journey, 'findUnique')
        .mockResolvedValue(mockJourney)

      const result = await resolver.journey(event)

      expect(resolver['prismaService'].journey.findUnique).toHaveBeenCalledWith(
        {
          where: { id: 'journey-1' }
        }
      )
      expect(result).toEqual(mockJourney)
    })
  })

  describe('visitor field resolver', () => {
    it('fetches visitor by visitorId', async () => {
      const event = { visitorId: 'visitor-1' }
      const mockVisitor = {
        id: 'visitor-1',
        name: 'Test Visitor',
        createdAt: new Date(),
        status: null,
        teamId: 'team-1',
        updatedAt: new Date(),
        userId: 'user-1',
        countryCode: null,
        duration: 0,
        email: null,
        lastChatStartedAt: null,
        lastChatPlatform: null,
        lastStepViewedAt: null,
        lastLinkAction: null,
        lastTextResponse: null,
        lastRadioQuestion: null,
        lastRadioOptionSubmission: null,
        messagePlatform: null,
        notes: null,
        userAgent: null
      } as Visitor

      jest
        .spyOn(resolver['prismaService'].visitor, 'findUnique')
        .mockResolvedValue(mockVisitor)

      const result = await resolver.visitor(event)

      expect(resolver['prismaService'].visitor.findUnique).toHaveBeenCalledWith(
        {
          where: { id: 'visitor-1' }
        }
      )
      expect(result).toEqual(mockVisitor)
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
