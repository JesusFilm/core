import { BullModule, getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'
import { setupServer } from 'msw/node'

import { PrismaService } from '../../lib/prisma.service'

import { PlausibleService } from './plausible.service'
import {
  MOCK_GATEWAY_URL,
  MOCK_PLAUSIBLE_URL,
  handlers,
  journey,
  realTimeVisitorsJourneyResponse,
  realTimeVisitorsTeamResponse,
  siteCreateResponse,
  statsAggregateJourneyResponse,
  statsAggregateTeamResponse,
  statsBreakdownJourneyResponse,
  statsBreakdownTeamResponse,
  statsTimeSeriesTeamResponse,
  statsTimeseriesJourneyResponse,
  team
} from './plausibleData'

describe('PlausibleService', () => {
  let service: PlausibleService,
    prismaService: PrismaService,
    plausibleQueue: { add: jest.Mock }

  const OLD_ENV = process.env

  const server = setupServer(...handlers)

  beforeAll(() => {
    server.listen()
  })

  beforeEach(async () => {
    process.env = { ...OLD_ENV }
    plausibleQueue = {
      add: jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      imports: [BullModule.registerQueue({ name: 'api-journeys-plausible' })],
      providers: [
        PlausibleService,
        {
          provide: PrismaService,
          useValue: {
            journey: {
              findMany: jest.fn(),
              update: jest.fn()
            },
            team: {
              findMany: jest.fn(),
              update: jest.fn()
            }
          }
        }
      ]
    })
      .overrideProvider(getQueueToken('api-journeys-plausible'))
      .useValue(plausibleQueue)
      .compile()
    service = module.get<PlausibleService>(PlausibleService)
    prismaService = module.get<PrismaService>(PrismaService)

    await service.onModuleInit()
  })

  afterEach(() => {
    process.env = OLD_ENV
    jest.clearAllMocks()
    server.resetHandlers()
  })

  afterAll(() => {
    server.close()
  })

  describe('createSites', () => {
    it('should create journey and team sites for existing journeys and teams without a site', async () => {
      service.createTeamSite = jest.fn()
      service.createJourneySite = jest.fn()

      prismaService.team.findMany = jest.fn().mockResolvedValueOnce([team])
      prismaService.journey.findMany = jest
        .fn()
        .mockResolvedValueOnce([journey])

      await service.createSites()

      expect(service.createTeamSite).toHaveBeenCalledTimes(1)
      expect(service.createTeamSite).toHaveBeenCalledWith({ teamId: team.id })
      expect(service.createJourneySite).toHaveBeenCalledTimes(1)
      expect(service.createJourneySite).toHaveBeenCalledWith({
        journeyId: journey.id
      })
    })
  })

  describe('createJourneySite', () => {
    it('should create a journey site', async () => {
      service.createSite = jest.fn().mockResolvedValue({
        __typename: 'MutationSiteCreateSuccess',
        data: {
          sharedLinks: [
            {
              slug: 'slug'
            }
          ]
        }
      })

      await service.createJourneySite({ journeyId: journey.id })

      expect(service.createSite).toHaveBeenCalledWith(
        `api-journeys-journey-${journey.id}`
      )
      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: journey.id },
        data: {
          plausibleToken: 'slug'
        }
      })
    })
  })

  describe('createTeamSite', () => {
    it('should create a team site', async () => {
      service.createSite = jest.fn().mockResolvedValue({
        __typename: 'MutationSiteCreateSuccess',
        data: {
          sharedLinks: [
            {
              slug: 'slug'
            }
          ]
        }
      })

      await service.createTeamSite({ teamId: team.id })

      expect(service.createSite).toHaveBeenCalledWith(
        `api-journeys-team-${team.id}`
      )
      expect(prismaService.team.update).toHaveBeenCalledWith({
        where: { id: team.id },
        data: {
          plausibleToken: 'slug'
        }
      })
    })
  })

  describe('createSite', () => {
    process.env.GATEWAY_URL = MOCK_GATEWAY_URL

    it('should create a site', async () => {
      expect(await service.createSite('site-name')).toEqual(
        siteCreateResponse.data.siteCreate
      )
    })
  })

  describe('getStatsRealtimeVisitors', () => {
    process.env.PLAUSIBLE_URL = MOCK_PLAUSIBLE_URL

    it('should return real time visitors for journey', async () => {
      expect(
        await service.getStatsRealtimeVisitors(journey.id, 'journey')
      ).toBe(realTimeVisitorsJourneyResponse)
    })

    it('should return real time visitors for team', async () => {
      expect(await service.getStatsRealtimeVisitors(team.id, 'team')).toBe(
        realTimeVisitorsTeamResponse
      )
    })
  })

  describe('getStatsAggregate', () => {
    process.env.PLAUSIBLE_URL = MOCK_PLAUSIBLE_URL

    it('should return aggregate stats for journey', async () => {
      expect(
        await service.getStatsAggregate(journey.id, 'journey', {
          metrics: 'metrics'
        })
      ).toEqual(statsAggregateJourneyResponse.results)
    })

    it('should return aggregate stats for team', async () => {
      expect(
        await service.getStatsAggregate(team.id, 'team', {
          metrics: 'metrics'
        })
      ).toEqual(statsAggregateTeamResponse.results)
    })

    it('should throw error', async () => {
      await expect(
        service.getStatsAggregate('invalid-id', 'journey', {
          metrics: 'metrics'
        })
      ).rejects.toThrow('Request failed with status code 404')
    })
  })

  describe('getStatsBreakdown', () => {
    process.env.PLAUSIBLE_URL = MOCK_PLAUSIBLE_URL

    it('should return breakdown stats for journey', async () => {
      expect(
        await service.getStatsBreakdown(journey.id, 'journey', {
          property: 'property',
          metrics: 'metrics'
        })
      ).toEqual(statsBreakdownJourneyResponse.results)
    })

    it('should return breakdown stats for team', async () => {
      expect(
        await service.getStatsBreakdown(team.id, 'team', {
          property: 'property',
          metrics: 'metrics'
        })
      ).toEqual(statsBreakdownTeamResponse.results)
    })

    it('should throw error', async () => {
      await expect(
        service.getStatsBreakdown('invalid-id', 'journey', {
          property: 'property',
          metrics: 'metrics'
        })
      ).rejects.toThrow('Request failed with status code 404')
    })
  })

  describe('getStatsTimeseries', () => {
    process.env.PLAUSIBLE_URL = MOCK_PLAUSIBLE_URL

    it('should return timeseries stats for journey', async () => {
      expect(
        await service.getStatsTimeseries(journey.id, 'journey', {
          metrics: 'metrics'
        })
      ).toEqual(statsTimeseriesJourneyResponse.results)
    })

    it('should return timeseries stats for team', async () => {
      expect(
        await service.getStatsTimeseries(team.id, 'team', {
          metrics: 'metrics'
        })
      ).toEqual(statsTimeSeriesTeamResponse.results)
    })

    it('should throw error', async () => {
      await expect(
        service.getStatsTimeseries('invalid-id', 'journey', {
          metrics: 'metrics'
        })
      ).rejects.toThrow('Request failed with status code 404')
    })
  })
})
