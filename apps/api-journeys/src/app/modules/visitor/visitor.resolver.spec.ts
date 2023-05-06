import { Test, TestingModule } from '@nestjs/testing'
import {
  MessagePlatform,
  VisitorConnectionSort,
  VisitorsConnection
} from '../../__generated__/graphql'
import { EventService } from '../event/event.service'
import { PrismaService } from '../../lib/prisma.service'

import { VisitorResolver } from './visitor.resolver'
import { VisitorService } from './visitor.service'

describe('VisitorResolver', () => {
  let resolver: VisitorResolver, vService: VisitorService, prisma: PrismaService

  const connection: VisitorsConnection = {
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

  const visitorService = {
    provide: VisitorService,
    useFactory: () => ({
      getList: jest.fn(() => connection),
      get: jest.fn((id) => {
        switch (id) {
          case 'visitorId':
            return { ...visitor, id, teamId: 'teamId' }
          case 'unknownVisitorId':
            return undefined
          case 'visitorWithDifferentTeamId':
            return { ...visitor, id, teamId: 'differentTeamId' }
        }
      }),
      update: jest.fn((_id, input) => ({ ...visitor, ...input }))
    })
  }

  const member = {
    id: 'memberId',
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
      providers: [VisitorResolver, visitorService, eventService, PrismaService]
    }).compile()
    resolver = module.get<VisitorResolver>(VisitorResolver)
    vService = module.get<VisitorService>(VisitorService)
    prisma = module.get<PrismaService>(PrismaService)
    prisma.event.findMany = jest.fn().mockReturnValue([event])
    prisma.member.findUnique = jest.fn().mockResolvedValueOnce(member)
    prisma.visitor.findUnique = jest.fn().mockReturnValue(visitor)
  })

  describe('visitorsConnection', () => {
    it('returns connection', async () => {
      expect(await resolver.visitorsConnection('userId', 'teamId')).toEqual(
        connection
      )
    })

    it('calls service with first, after and filter', async () => {
      await resolver.visitorsConnection('userId', 'teamId', 50, 'cursorId')
      expect(vService.getList).toHaveBeenCalledWith({
        after: 'cursorId',
        teamId: 'teamId',
        first: 50,
        sort: VisitorConnectionSort.date,
        filter: undefined
      })
    })

    it('throws error when user is not a team member', async () => {
      prisma.member.findUnique = jest.fn().mockResolvedValueOnce(null)
      await expect(
        async () =>
          await resolver.visitorsConnection('userId', 'differentTeamId')
      ).rejects.toThrow('User is not a member of the team.')
    })
  })

  describe('visitor', () => {
    it('returns visitor', async () => {
      prisma.event.findMany = jest.fn().mockReturnValue([])
      expect(await resolver.visitor('userId', 'visitorId')).toEqual({
        ...visitor
      })
    })

    it('throws error when invalid visitor ID', async () => {
      prisma.visitor.findUnique = jest.fn().mockReturnValue(null)
      await expect(
        async () => await resolver.visitor('userId', 'unknownVisitorId')
      ).rejects.toThrow('Visitor with ID "unknownVisitorId" does not exist')
    })

    it('throws error when user is not member of visitors team', async () => {
      prisma.member.findUnique = jest.fn().mockResolvedValueOnce(null)
      prisma.visitor.findUnique = jest
        .fn()
        .mockReturnValue({ ...visitor, teamId: 'junk' })
      await expect(
        async () =>
          await resolver.visitor('userId', 'visitorWithDifferentTeamId')
      ).rejects.toThrow(
        'User is not a member of the team the visitor belongs to'
      )
    })
  })

  describe('visitorUpdate', () => {
    const input = {
      email: 'sarah@example.com',
      messagePlatformId: '0800838383',
      messagePlatform: MessagePlatform.whatsApp,
      name: 'Sarah',
      notes: 'this is a test',
      status: 'star'
    }
    it('returns updated visitor', async () => {
      prisma.visitor.update = jest
        .fn()
        .mockReturnValueOnce({ ...visitor, ...input })
      expect(
        await resolver.visitorUpdate('userId', 'visitorId', input)
      ).toEqual({ ...visitor, ...input })
    })

    it('throws error when invalid visitor ID', async () => {
      prisma.visitor.findUnique = jest.fn().mockReturnValueOnce(null)
      await expect(
        async () =>
          await resolver.visitorUpdate('userId', 'unknownVisitorId', input)
      ).rejects.toThrow('Visitor with ID "unknownVisitorId" does not exist')
    })

    it('throws error when user is not member of visitors team', async () => {
      prisma.member.findUnique = jest.fn().mockResolvedValueOnce(null)
      prisma.visitor.findUnique = jest
        .fn()
        .mockReturnValueOnce({ ...visitor, teamId: 'junk' })
      await expect(
        async () =>
          await resolver.visitorUpdate(
            'userId',
            'visitorWithDifferentTeamId',
            input
          )
      ).rejects.toThrow(
        'User is not a member of the team the visitor belongs to'
      )
    })
  })

  describe('events', () => {
    it('returns visitor events', async () => {
      expect(await resolver.events({ id: 'visitorId' })).toEqual([event])
    })

    it('calls event service with visitorId', async () => {
      await resolver.events({ id: 'visitorId' })
      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: { visitorId: 'visitorId' }
      })
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
