import { Test, TestingModule } from '@nestjs/testing'

import { JourneyVisitorSort } from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'

import { JourneyVisitorService } from './journeyVisitor.service'

const journeyVisitor = {
  journeyId: 'journey.id',
  visitorId: 'visitor.id'
}

describe('JourneyVisitorService', () => {
  let service: JourneyVisitorService, prismaService: PrismaService

  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JourneyVisitorService, PrismaService]
    }).compile()

    service = module.get<JourneyVisitorService>(JourneyVisitorService)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaService.journeyVisitor.findUnique = jest
      .fn()
      .mockReturnValueOnce(journeyVisitor)
    prismaService.journeyVisitor.upsert = jest
      .fn()
      .mockImplementationOnce((input) => input.create)
    prismaService.journeyVisitor.findMany = jest.fn().mockReturnValueOnce([])
  })

  describe('getJourneyVisitorCount', () => {
    it('should return the number of visitors for a journey', async () => {
      prismaService.journeyVisitor.count = jest.fn().mockReturnValueOnce(2)
      expect(
        await service.getJourneyVisitorCount({
          journeyId: 'journey.id'
        })
      ).toBe(2)
    })
  })

  describe('getJourneyVisitorList', () => {
    it('should return the list of visitors for a journey', async () => {
      const connection = {
        edges: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null
        }
      }
      expect(
        await service.getJourneyVisitorList({
          first: 50,
          filter: {
            journeyId: 'journey.id'
          },
          sort: JourneyVisitorSort.date
        })
      ).toEqual(connection)
      expect(prismaService.journeyVisitor.findMany).toHaveBeenCalledWith({
        cursor: undefined,
        orderBy: {
          createdAt: 'desc'
        },
        skip: 0,
        take: 51,
        where: { journeyId: 'journey.id' }
      })
    })

    it('allows pagination of the visitors connection', async () => {
      await service.getJourneyVisitorList({
        first: 50,
        after: 'journey.id',
        filter: { journeyId: 'journey.id' },
        sort: JourneyVisitorSort.date
      })
      expect(prismaService.journeyVisitor.findMany).toHaveBeenCalledWith({
        cursor: { id: 'journey.id' },
        orderBy: {
          createdAt: 'desc'
        },
        skip: 1,
        take: 51,
        where: { journeyId: 'journey.id' }
      })
    })
  })

  describe('generateWhere', () => {
    it('should return the where clause for a filter', () => {
      expect(
        service.generateWhere({
          journeyId: 'journey.id',
          hasChatStarted: true,
          hasIcon: true,
          hasPollAnswers: true,
          hasTextResponse: true,
          hideInactive: true,
          countryCode: 'JA'
        })
      ).toEqual({
        journeyId: 'journey.id',
        lastChatStartedAt: { not: null },
        lastRadioQuestion: { not: null },
        lastTextResponse: { not: null },
        activityCount: { gt: 0 },
        visitor: { status: { not: null }, countryCode: { contains: 'JA' } }
      })
    })

    it('should handle null values', () => {
      expect(
        service.generateWhere({
          journeyId: 'journey.id'
        })
      ).toEqual({
        journeyId: 'journey.id'
      })
    })
  })
})
