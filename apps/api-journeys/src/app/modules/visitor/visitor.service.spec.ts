import { Test, TestingModule } from '@nestjs/testing'
import { v4 as uuidv4 } from 'uuid'
import { PrismaService } from '../../lib/prisma.service'
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

const visitor = {
  id: 'visitor.id',
  userId: 'user.id',
  teamId: 'team.id'
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
      providers: [VisitorService, PrismaService]
    }).compile()

    service = module.get<VisitorService>(VisitorService)
    prisma = module.get<PrismaService>(PrismaService)
    prisma.journey.findUnique = jest.fn().mockReturnValueOnce(journey)
    prisma.visitor.create = jest.fn()
    prisma.visitor.findMany = jest.fn().mockReturnValueOnce([])
  })

  afterAll(() => {
    jest.resetAllMocks()
    jest.useRealTimers()
  })

  describe('getList', () => {
    const connection = {
      results: [],
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
        cursor: { createdAt: undefined },
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
        after: new Date('2021-02-18').toISOString(),
        filter: { teamId: 'jfp-team' }
      })
      expect(prisma.visitor.findMany).toHaveBeenCalledWith({
        cursor: { createdAt: new Date('2021-02-18') },
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
      ).toEqual(visitor)
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
})
