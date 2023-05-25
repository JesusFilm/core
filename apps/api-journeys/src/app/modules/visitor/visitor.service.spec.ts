import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyVisitorSort } from '../../__generated__/graphql'
import { JourneyService } from '../journey/journey.service'
import { VisitorService } from './visitor.service'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

const journey = {
  id: 'journey.id',
  teamId: 'team.id'
}

const journeyVisitor = {
  journeyId: 'journey.id',
  visitorId: 'visitor.id'
}
const visitor = {
  id: 'visitor.id',
  userId: 'user.id',
  teamId: 'team.id'
}

const journeyService = {
  provide: JourneyService,
  useFactory: () => ({
    get: jest.fn(() => journey)
  })
}
describe('VisitorService', () => {
  let service: VisitorService, prisma: PrismaService

  beforeAll(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date('2021-02-18'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VisitorService, PrismaService, journeyService]
    }).compile()

    service = module.get<VisitorService>(VisitorService)
    prisma = module.get<PrismaService>(PrismaService)
    prisma.visitor.create = jest
      .fn()
      .mockImplementationOnce((input) => input.data)
    prisma.visitor.findMany = jest.fn().mockReturnValueOnce([])
    prisma.journeyVisitor.findUnique = jest
      .fn()
      .mockReturnValueOnce(journeyVisitor)
    prisma.journeyVisitor.upsert = jest
      .fn()
      .mockImplementationOnce((input) => input.create)
    prisma.journeyVisitor.findMany = jest.fn().mockReturnValueOnce([])
  })

  describe('getList', () => {
    const connection = {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        startCursor: null,
        endCursor: null
      }
    }
    it('returns a visitors connection', async () => {
      expect(
        await service.getList({ first: 50, filter: { teamId: 'jfp-team' } })
      ).toEqual(connection)
      expect(prisma.visitor.findMany).toHaveBeenCalledWith({
        cursor: undefined,
        orderBy: {
          createdAt: 'desc'
        },
        skip: 0,
        take: 51,
        where: { teamId: 'jfp-team' }
      })
    })

    it('allows pagination of the visitors connection', async () => {
      await service.getList({
        first: 50,
        after: '1',
        filter: { teamId: 'jfp-team' }
      })
      expect(prisma.visitor.findMany).toHaveBeenCalledWith({
        cursor: { id: '1' },
        orderBy: {
          createdAt: 'desc'
        },
        skip: 1,
        take: 51,
        where: { teamId: 'jfp-team' }
      })
    })
  })

  describe('getVisitorId', () => {
    it('should return visitor id', async () => {
      prisma.visitor.findFirst = jest.fn().mockReturnValueOnce(visitor)
      expect(
        await service.getByUserIdAndJourneyId('user.id', 'journey.id')
      ).toEqual({ visitor, journeyVisitor })
    })

    it('should create a new visitor if visitor does not exist', async () => {
      prisma.visitor.findFirst = jest.fn().mockReturnValueOnce(null)
      mockUuidv4.mockReturnValueOnce('newVisitor.id')

      await service.getByUserIdAndJourneyId('user.id', 'journey.id')
      expect(prisma.visitor.create).toHaveBeenCalledWith({
        data: {
          ...visitor,
          id: 'newVisitor.id',
          createdAt: new Date()
        }
      })
    })
  })

  describe('getJourneyVisitorCount', () => {
    it('should return the number of visitors for a journey', async () => {
      prisma.journeyVisitor.count = jest.fn().mockReturnValueOnce(2)
      expect(
        await service.getJourneyVisitorCount({
          journeyId: 'journey.id'
        })
      ).toEqual(2)
    })
  })

  describe('getJourneyVisitorList', () => {
    it('should return the list of visitors for a journey', async () => {
      const connection = {
        edges: [],
        pageInfo: {
          hasNextPage: false,
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
      expect(prisma.journeyVisitor.findMany).toHaveBeenCalledWith({
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
      expect(prisma.journeyVisitor.findMany).toHaveBeenCalledWith({
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
