import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Event, JourneyVisitor, Visitor } from '.prisma/api-journeys-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import {
  JourneyVisitorSort,
  MessagePlatform
} from '../../__generated__/graphql'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyVisitorResolver } from './journeyVisitor.resolver'
import {
  JourneyVisitorService,
  JourneyVisitorsConnection
} from './journeyVisitor.service'

describe('JourneyVisitorResolver', () => {
  let resolver: JourneyVisitorResolver,
    vService: JourneyVisitorService,
    prismaService: DeepMockProxy<PrismaService>

  const jvConnection: JourneyVisitorsConnection = {
    edges: [],
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null
    }
  }

  const visitor: Visitor = {
    id: 'visitorId',
    countryCode: null,
    email: 'bob@example.com',
    lastChatStartedAt: null,
    messagePlatformId: '555-000000',
    messagePlatform: MessagePlatform.whatsApp,
    name: 'Bob Smith',
    notes: 'Bob called this afternoon to arrange a meet-up.',
    phone: '555-000000',
    status: 'star',
    teamId: 'teamId',
    userAgent: null,
    createdAt: new Date(),
    duration: 0,
    lastChatPlatform: null,
    lastStepViewedAt: null,
    lastLinkAction: null,
    lastTextResponse: null,
    lastRadioQuestion: null,
    lastRadioOptionSubmission: null,
    referrer: null,
    userId: 'visitorUserId',
    updatedAt: new Date()
  }

  const journeyVisitorService = {
    provide: JourneyVisitorService,
    useFactory: () => ({
      getJourneyVisitorList: jest.fn(() => jvConnection),
      generateWhere: jest.fn((filter) => filter)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        JourneyVisitorResolver,
        journeyVisitorService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<JourneyVisitorResolver>(JourneyVisitorResolver)
    vService = module.get<JourneyVisitorService>(JourneyVisitorService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('journeyVisitorsConnection', () => {
    it('returns connection', async () => {
      expect(
        await resolver.journeyVisitorsConnection(
          { OR: [] },
          { journeyId: 'journeyId' }
        )
      ).toEqual(jvConnection)
    })

    it('calls service with first, after and filter', async () => {
      await resolver.journeyVisitorsConnection(
        { OR: [] },
        { journeyId: 'journeyId' },
        JourneyVisitorSort.activity,
        50,
        'cursorId'
      )
      expect(vService.getJourneyVisitorList).toHaveBeenCalledWith({
        after: 'cursorId',
        filter: {
          AND: [{ OR: [] }, { journeyId: 'journeyId' }]
        },
        first: 50,
        sort: JourneyVisitorSort.activity
      })
    })
  })

  describe('visitor', () => {
    it('returns visitor', async () => {
      prismaService.visitor.findUnique.mockResolvedValueOnce(visitor)
      expect(
        await resolver.visitor({
          visitorId: 'visitorId'
        } as unknown as JourneyVisitor)
      ).toEqual(visitor)
    })

    it('throws error if not found', async () => {
      prismaService.visitor.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.visitor({
          visitorId: 'visitorId'
        } as unknown as JourneyVisitor)
      ).rejects.toThrow('visitor with id "visitorId" not found')
    })
  })

  describe('events', () => {
    const event: Event = {
      id: 'eventId',
      typename: 'event',
      visitorId: 'visitorId',
      journeyId: null,
      blockId: null,
      stepId: null,
      label: null,
      value: null,
      action: null,
      actionValue: null,
      messagePlatform: null,
      languageId: null,
      radioOptionBlockId: null,
      email: null,
      nextStepId: null,
      previousStepId: null,
      position: null,
      source: null,
      progress: null,
      userId: null,
      journeyVisitorJourneyId: null,
      journeyVisitorVisitorId: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    it('returns visitor events', async () => {
      prismaService.event.findMany.mockResolvedValueOnce([event])
      expect(
        await resolver.events({
          visitorId: 'visitorId'
        } as unknown as JourneyVisitor)
      ).toEqual([{ ...event, typename: undefined, __typename: 'event' }])
    })
  })
})
