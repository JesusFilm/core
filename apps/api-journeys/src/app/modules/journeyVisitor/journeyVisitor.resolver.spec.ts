import { Test, TestingModule } from '@nestjs/testing'
import {
  JourneyVisitorSort,
  MessagePlatform
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { EventService } from '../event/event.service'
import { JourneyVisitorResolver } from './journeyVisitor.resolver'
import {
  JourneyVisitorsConnection,
  JourneyVisitorService
} from './journeyVisitor.service'

describe('JourneyVisitorResolver', () => {
  let resolver: JourneyVisitorResolver,
    vService: JourneyVisitorService,
    prismaService: PrismaService

  const jvConnection: JourneyVisitorsConnection = {
    edges: [],
    pageInfo: {
      hasNextPage: false,
      startCursor: null,
      endCursor: null
    }
  }

  const visitor = {
    id: 'visitorId',
    countryCode: null,
    email: 'bob@example.com',
    lastChatStartedAt: null,
    messagePlatformId: '555-000000',
    messagePlatform: MessagePlatform.whatsApp,
    name: 'Bob Smith',
    notes: 'Bob called this afternoon to arrange a meet-up.',
    status: 'star',
    teamId: 'teamId',
    userAgent: null
  }

  const journeyVisitorService = {
    provide: JourneyVisitorService,
    useFactory: () => ({
      getJourneyVisitorList: jest.fn(() => jvConnection)
    })
  }

  const userTeam = {
    id: 'userTeamId',
    userId: 'userId',
    teamId: 'teamId'
  }

  const event = {
    id: 'eventId'
  }

  const eventService = {
    provide: EventService,
    useFactory: () => ({
      getAllByVisitorId: jest.fn(() => [event])
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JourneyVisitorResolver,
        journeyVisitorService,
        eventService,
        PrismaService
      ]
    }).compile()
    resolver = module.get<JourneyVisitorResolver>(JourneyVisitorResolver)
    vService = module.get<JourneyVisitorService>(JourneyVisitorService)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.event.findMany = jest.fn().mockReturnValue([event])
    prismaService.visitor.findUnique = jest.fn().mockReturnValue(visitor)
    prismaService.userTeam.findUnique = jest.fn().mockReturnValue(userTeam)
  })

  describe('visitor', () => {
    it('returns visitor', async () => {
      expect(await resolver.visitor({ visitorId: 'visitorId' })).toEqual({
        ...visitor
      })
    })
  })

  describe('events', () => {
    it('returns visitor events', async () => {
      expect(await resolver.events({ visitorId: 'visitorId' })).toEqual([event])
    })

    it('calls event service with visitorId', async () => {
      await resolver.events({ visitorId: 'visitorId' })
      expect(prismaService.event.findMany).toHaveBeenCalledWith({
        where: { visitorId: 'visitorId' }
      })
    })
  })

  describe('journeyVisitorsConnection', () => {
    it('returns connection', async () => {
      expect(
        await resolver.journeyVisitorsConnection('userId', 'teamId', {
          journeyId: 'journeyId'
        })
      ).toEqual(jvConnection)
    })

    it('calls service with first, after and filter', async () => {
      await resolver.journeyVisitorsConnection(
        'userId',
        'teamId',
        { journeyId: 'journeyId' },
        JourneyVisitorSort.activity,
        50,
        'cursorId'
      )
      expect(vService.getJourneyVisitorList).toHaveBeenCalledWith({
        after: 'cursorId',
        filter: { journeyId: 'journeyId' },
        first: 50,
        sort: JourneyVisitorSort.activity
      })
    })

    it('throws error if user is not a member of the team', async () => {
      prismaService.userTeam.findUnique = jest.fn().mockReturnValue(null)
      await expect(
        resolver.journeyVisitorsConnection(
          'userId',
          'teamId',
          { journeyId: 'journeyId' },
          JourneyVisitorSort.activity,
          50,
          'cursorId'
        )
      ).rejects.toThrowError('User is not a member of the team')
    })
  })
})
