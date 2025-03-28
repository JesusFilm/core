import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { Event, Visitor } from '.prisma/api-journeys-client'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import {
  MessagePlatform,
  VisitorStatus,
  VisitorUpdateInput,
  VisitorsConnection
} from '../../__generated__/graphql'
import { AppAbility, AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { VisitorResolver } from './visitor.resolver'
import { VisitorService } from './visitor.service'

describe('VisitorResolver', () => {
  let resolver: VisitorResolver,
    vService: VisitorService,
    prismaService: DeepMockProxy<PrismaService>,
    ability: AppAbility

  const connection: VisitorsConnection = {
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

  const visitorWithUser = {
    ...visitor,
    userId: 'userId'
  }

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      getList: jest.fn(() => connection)
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CaslAuthModule.register(AppCaslFactory)],
      providers: [
        VisitorResolver,
        visitorService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()
    resolver = module.get<VisitorResolver>(VisitorResolver)
    vService = module.get<VisitorService>(VisitorService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
    ability = await new AppCaslFactory().createAbility({ id: 'userId' })
  })

  describe('visitorsConnection', () => {
    it('returns connection', async () => {
      expect(await resolver.visitorsConnection({ OR: [] }, 'teamId')).toEqual(
        connection
      )
    })

    it('returns connections without teamId', async () => {
      await resolver.visitorsConnection({ OR: [] }, undefined, 50, 'cursorId')
      expect(vService.getList).toHaveBeenCalledWith({
        after: 'cursorId',
        filter: { AND: [{ OR: [] }] },
        first: 50
      })
    })

    it('calls service with first, after and filter', async () => {
      await resolver.visitorsConnection({ OR: [] }, 'teamId', 50, 'cursorId')
      expect(vService.getList).toHaveBeenCalledWith({
        after: 'cursorId',
        filter: { AND: [{ OR: [] }, { teamId: 'teamId' }] },
        first: 50
      })
    })
  })

  describe('visitor', () => {
    it('returns visitor', async () => {
      prismaService.visitor.findUnique.mockResolvedValueOnce(visitorWithUser)
      expect(await resolver.visitor(ability, 'visitorId')).toEqual(
        visitorWithUser
      )
    })

    it('throws error if not found', async () => {
      prismaService.visitor.findUnique.mockResolvedValueOnce(null)
      await expect(resolver.visitor(ability, 'visitorId')).rejects.toThrow(
        'visitor with id "visitorId" not found'
      )
    })

    it('throws error if not authorized', async () => {
      prismaService.visitor.findUnique.mockResolvedValueOnce(visitor)
      await expect(resolver.visitor(ability, 'visitorId')).rejects.toThrow(
        'user is not allowed to view visitor'
      )
    })
  })

  describe('visitorUpdate', () => {
    const input: VisitorUpdateInput = {
      email: 'sarah@example.com',
      messagePlatformId: '0800838383',
      messagePlatform: MessagePlatform.whatsApp,
      name: 'Sarah',
      notes: 'this is a test',
      status: VisitorStatus.star
    }

    it('updates visitor', async () => {
      prismaService.visitor.findUnique.mockResolvedValueOnce(visitorWithUser)
      prismaService.visitor.update.mockResolvedValueOnce({
        ...visitorWithUser,
        ...input
      })
      expect(await resolver.visitorUpdate(ability, 'visitorId', input)).toEqual(
        { ...visitorWithUser, ...input }
      )
    })

    it('throws error if not found', async () => {
      prismaService.visitor.findUnique.mockResolvedValueOnce(null)
      await expect(
        resolver.visitorUpdate(ability, 'visitorId', input)
      ).rejects.toThrow('visitor with id "visitorId" not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.visitor.findUnique.mockResolvedValueOnce(visitor)
      await expect(
        resolver.visitorUpdate(ability, 'visitorId', input)
      ).rejects.toThrow('user is not allowed to update visitor')
    })
  })

  describe('visitorUpdateForCurrentUser', () => {
    const input: VisitorUpdateInput = {
      email: 'sarah@example.com',
      messagePlatformId: '0800838383',
      messagePlatform: MessagePlatform.whatsApp,
      name: 'Sarah',
      notes: 'this is a test',
      status: VisitorStatus.star,
      countryCode: 'South Lake Tahoe, CA, USA',
      referrer: 'https://example.com'
    }

    it('updates visitor', async () => {
      prismaService.visitor.findFirst.mockResolvedValueOnce(visitorWithUser)
      prismaService.visitor.update.mockResolvedValueOnce({
        ...visitorWithUser,
        countryCode: 'South Lake Tahoe, CA, USA',
        referrer: 'https://example.com'
      })
      expect(
        await resolver.visitorUpdateForCurrentUser(ability, 'userId', input)
      ).toEqual({
        ...visitorWithUser,
        countryCode: 'South Lake Tahoe, CA, USA',
        referrer: 'https://example.com'
      })
      expect(prismaService.visitor.update).toHaveBeenCalledWith({
        where: { id: 'visitorId' },
        data: {
          countryCode: 'South Lake Tahoe, CA, USA',
          referrer: 'https://example.com'
        }
      })
    })

    it('throws error if not found', async () => {
      prismaService.visitor.findFirst.mockResolvedValueOnce(null)
      await expect(
        resolver.visitorUpdateForCurrentUser(ability, 'userId', input)
      ).rejects.toThrow('visitor with userId "userId" not found')
    })

    it('throws error if not authorized', async () => {
      prismaService.visitor.findFirst.mockResolvedValueOnce(visitor)
      await expect(
        resolver.visitorUpdateForCurrentUser(ability, 'userId', input)
      ).rejects.toThrow('user is not allowed to update visitor')
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
      expect(await resolver.events({ id: 'visitorId' })).toEqual([
        { ...event, typename: undefined, __typename: 'event' }
      ])
    })
  })

  describe('userAgent', () => {
    it('parses empty case', () => {
      expect(resolver.userAgent({})).toBeUndefined()
    })

    it('parses desktop user-agent', () => {
      expect(
        resolver.userAgent({
          userAgent:
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36'
        })
      ).toMatchObject({
        browser: { major: '106', name: 'Chrome', version: '106.0.0.0' },
        device: { model: 'Macintosh', type: undefined, vendor: 'Apple' },
        os: { name: 'Mac OS', version: '10.15.7' }
      })
    })

    it('parses mobile user-agent', () => {
      expect(
        resolver.userAgent({
          userAgent:
            'Mozilla/5.0 (iPhone; U; CPU iPhone OS 5_1_1 like Mac OS X; en) AppleWebKit/534.46.0 (KHTML, like Gecko) CriOS/19.0.1084.60 Mobile/9B206 Safari/7534.48.3'
        })
      ).toMatchObject({
        browser: { major: '19', name: 'Chrome', version: '19.0.1084.60' },
        device: { model: 'iPhone', type: 'mobile', vendor: 'Apple' },
        os: { name: 'iOS', version: '5.1.1' }
      })
    })
  })
})
