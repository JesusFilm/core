import { Test, TestingModule } from '@nestjs/testing'
import {
  JourneyStatus,
  Role,
  ThemeMode,
  ThemeName
} from '../../__generated__/graphql'
import { PrismaService } from '../../lib/prisma.service'
import { JourneyService } from './journey.service'

describe('JourneyService', () => {
  let service: JourneyService, prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JourneyService, PrismaService]
    }).compile()

    service = module.get<JourneyService>(JourneyService)
    prisma = module.get<PrismaService>(PrismaService)
  })
  afterAll(() => {
    jest.resetAllMocks()
  })

  const journey = {
    id: '1',
    title: 'published',
    status: JourneyStatus.published,
    languageId: '529',
    themeMode: ThemeMode.light,
    themeName: ThemeName.base,
    description: null,
    primaryImageBlockId: null,
    slug: 'published-slug'
  }

  const userRole = {
    id: 'userRole.id',
    userId: 'user.id',
    roles: [Role.publisher]
  }

  describe('getBySlug', () => {
    it('should return a journey', async () => {
      prisma.journey.findFirst = jest.fn().mockResolvedValue(journey)
      expect(await service.getBySlug('slug')).toEqual(journey)
    })
  })

  describe('getAllPublishedJourneys', () => {
    it('should return published journeys', async () => {
      prisma.journey.findMany = jest.fn().mockResolvedValue([journey])
      expect(await service.getAllPublishedJourneys()).toEqual([journey])
    })

    it('should filter by filter query', async () => {
      prisma.journey.findMany = jest.fn().mockResolvedValue([journey])
      await service.getAllPublishedJourneys({ featured: true })
      expect(prisma.journey.findMany).toHaveBeenCalledWith({
        where: {
          status: JourneyStatus.published,
          featuredAt: { not: null }
        }
      })
    })
  })

  describe('getAllByTitle', () => {
    it('should return all for title', async () => {
      prisma.journey.findMany = jest.fn().mockResolvedValue([journey])
      expect(await service.getAllByTitle('publish', 'userId')).toEqual([
        journey
      ])
    })
  })

  describe('getAllByRole', () => {
    it('should return all for user', async () => {
      prisma.journey.findMany = jest.fn().mockResolvedValue([journey])
      expect(
        await service.getAllByRole(userRole, [JourneyStatus.published])
      ).toEqual([journey])
      expect(prisma.journey.findMany).toHaveBeenCalledWith({
        where: {
          status: { in: [JourneyStatus.published] },
          template: undefined,
          userJourney: {
            some: { userId: 'user.id', role: { in: ['owner', 'editor'] } }
          }
        }
      })
    })

    it('should return templates for publishers', async () => {
      // db.query.mockImplementationOnce(async (q) => {
      //   const { query } = q as unknown as AqlQuery
      //   expect(query).toEqual(
      //     aql`FOR journey in undefined
      //         FILTER journey.template == true
      //     && true
      //       RETURN journey
      // `.query
      //   )
      //   return await mockDbQueryResult(db, [journey])
      // })
      prisma.journey.findMany = jest.fn().mockResolvedValue([journey])
      await service.getAllPublishedJourneys({ featured: true })
      // expect(db.query).toHaveBeenCalled()
      // expect(await service.getAllByRole(userRole, undefined, true)).toEqual([
      //   journey
      // ])
    })
  })
})
