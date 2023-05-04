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
    prisma.journey.findMany = jest.fn().mockResolvedValue([journey])
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
      expect(await service.getAllPublishedJourneys()).toEqual([journey])
    })

    it('should filter by filter query', async () => {
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
      expect(await service.getAllByTitle('publish', 'userId')).toEqual([
        journey
      ])
    })
  })

  describe('getAllByRole', () => {
    it('should return all for user', async () => {
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
      await service.getAllPublishedJourneys({ featured: true })
      expect(prisma.journey.findMany).toHaveBeenCalledWith({
        where: {
          status: JourneyStatus.published,
          featuredAt: { not: null }
        }
      })
    })
  })
})
