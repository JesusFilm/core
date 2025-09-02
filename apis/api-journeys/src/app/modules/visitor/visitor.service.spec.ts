import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import {
  Journey,
  JourneyVisitor,
  Prisma,
  Visitor
} from '@core/prisma/journeys/client'

import { PrismaService } from '../../lib/prisma.service'
import { ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED } from '../../lib/prismaErrors'

import { VisitorService } from './visitor.service'

const journey = {
  id: 'journey.id',
  teamId: 'team.id'
} as unknown as Journey
const journeyVisitor = {
  journeyId: 'journey.id',
  visitorId: 'visitor.id'
} as unknown as JourneyVisitor
const visitor = {
  id: 'visitor.id',
  userId: 'user.id',
  teamId: 'team.id'
} as unknown as Visitor

describe('VisitorService', () => {
  let service: VisitorService, prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitorService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    service = module.get<VisitorService>(VisitorService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  describe('getList', () => {
    const connection = {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null
      }
    }

    it('returns a visitors connection', async () => {
      prismaService.visitor.findMany.mockResolvedValueOnce([])
      expect(
        await service.getList({ first: 50, filter: { teamId: 'teamId' } })
      ).toEqual(connection)
      expect(prismaService.visitor.findMany).toHaveBeenCalledWith({
        cursor: undefined,
        orderBy: {
          createdAt: 'desc'
        },
        skip: 0,
        take: 51,
        where: { teamId: 'teamId' }
      })
    })

    it('allows pagination of the visitors connection', async () => {
      prismaService.visitor.findMany.mockResolvedValueOnce([])
      await service.getList({
        first: 50,
        after: '1',
        filter: { teamId: 'teamId' }
      })
      expect(prismaService.visitor.findMany).toHaveBeenCalledWith({
        cursor: { id: '1' },
        orderBy: {
          createdAt: 'desc'
        },
        skip: 1,
        take: 51,
        where: { teamId: 'teamId' }
      })
    })
  })

  describe('getVisitorId', () => {
    it('should return visitor id', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(journey)
      prismaService.visitor.upsert.mockResolvedValueOnce(visitor)
      prismaService.journeyVisitor.upsert.mockResolvedValueOnce(journeyVisitor)
      expect(
        await service.getByUserIdAndJourneyId('user.id', 'journey.id')
      ).toEqual({ visitor, journeyVisitor })
    })

    it('should throw error if journey not found', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(null)
      await expect(
        service.getByUserIdAndJourneyId('user.id', 'journey.id')
      ).rejects.toThrow('Journey not found')
    })

    it('should retry if visitor already exists', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(journey)
      prismaService.visitor.upsert.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('', {
          code: ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED,
          clientVersion: ''
        })
      )
      prismaService.visitor.upsert.mockResolvedValueOnce(visitor)
      prismaService.journeyVisitor.upsert.mockResolvedValueOnce(journeyVisitor)
      expect(
        await service.getByUserIdAndJourneyId('user.id', 'journey.id')
      ).toEqual({ visitor, journeyVisitor })
    })

    it('should retry if journeyVisitor already exists', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(journey)
      prismaService.visitor.upsert.mockResolvedValueOnce(visitor)
      prismaService.visitor.upsert.mockResolvedValueOnce(visitor)
      prismaService.journeyVisitor.upsert.mockRejectedValueOnce(
        new Prisma.PrismaClientKnownRequestError('', {
          code: ERROR_PSQL_UNIQUE_CONSTRAINT_VIOLATED,
          clientVersion: ''
        })
      )
      prismaService.journeyVisitor.upsert.mockResolvedValueOnce(journeyVisitor)
      expect(
        await service.getByUserIdAndJourneyId('user.id', 'journey.id')
      ).toEqual({ visitor, journeyVisitor })
    })

    it('should throw error if visitor upsert fails', async () => {
      prismaService.journey.findUnique.mockResolvedValueOnce(journey)
      prismaService.visitor.upsert.mockRejectedValueOnce(new Error())
      await expect(
        service.getByUserIdAndJourneyId('user.id', 'journey.id')
      ).rejects.toThrow()
    })
  })
})
