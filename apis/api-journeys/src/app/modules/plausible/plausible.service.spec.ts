import { BullModule, getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { setupServer } from 'msw/node'

import { Journey, Team } from '@core/prisma/journeys/client'

import { PrismaService } from '../../lib/prisma.service'

import {
  getRealTimeVisitors,
  getRealTimeVisitorsResponse,
  getStatsAggregate,
  getStatsAggregateResponse,
  getStatsBreakdown,
  getStatsBreakdownResponse,
  getStatsTimeseries,
  getStatsTimeseriesResponse,
  siteCreate,
  siteCreateResponse
} from './plausible.handlers'
import { PlausibleService } from './plausible.service'

describe('PlausibleService', () => {
  let service: PlausibleService,
    prismaService: DeepMockProxy<PrismaService>,
    plausibleQueue: { add: jest.Mock }

  const OLD_ENV = process.env

  const server = setupServer()

  beforeAll(() => {
    server.listen()
  })

  beforeEach(async () => {
    process.env = {
      ...OLD_ENV,
      GATEWAY_URL: 'http://gateway.local',
      PLAUSIBLE_URL: 'http://plausible.local'
    }
    plausibleQueue = {
      add: jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      imports: [BullModule.registerQueue({ name: 'api-journeys-plausible' })],
      providers: [
        PlausibleService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    })
      .overrideProvider(getQueueToken('api-journeys-plausible'))
      .useValue(plausibleQueue)
      .compile()
    service = module.get<PlausibleService>(PlausibleService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>

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

      prismaService.team.findMany.mockResolvedValueOnce([
        { id: 'teamId' } as unknown as Team
      ])
      prismaService.journey.findMany.mockResolvedValueOnce([
        { id: 'journeyId' } as unknown as Journey
      ])

      await service.createSites()

      expect(service.createTeamSite).toHaveBeenCalledTimes(1)
      expect(service.createTeamSite).toHaveBeenCalledWith({ teamId: 'teamId' })
      expect(service.createJourneySite).toHaveBeenCalledTimes(1)
      expect(service.createJourneySite).toHaveBeenCalledWith({
        journeyId: 'journeyId'
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

      await service.createJourneySite({ journeyId: 'journeyId' })

      expect(service.createSite).toHaveBeenCalledWith(
        'api-journeys-journey-journeyId'
      )
      expect(prismaService.journey.update).toHaveBeenCalledWith({
        where: { id: 'journeyId' },
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

      await service.createTeamSite({ teamId: 'teamId' })

      expect(service.createSite).toHaveBeenCalledWith(
        'api-journeys-team-teamId'
      )
      expect(prismaService.team.update).toHaveBeenCalledWith({
        where: { id: 'teamId' },
        data: {
          plausibleToken: 'slug'
        }
      })
    })
  })

  describe('createSite', () => {
    beforeEach(() => {
      server.use(siteCreate)
    })

    it('should create a site', async () => {
      expect(await service.createSite('site-name')).toEqual(
        siteCreateResponse.data.siteCreate
      )
    })
  })

  describe('getStatsRealtimeVisitors', () => {
    beforeEach(() => {
      server.use(getRealTimeVisitors())
    })

    it('should return real time visitors for journey', async () => {
      expect(
        await service.getStatsRealtimeVisitors('journeyId', 'journey')
      ).toBe(getRealTimeVisitorsResponse)
    })

    it('should return real time visitors for team', async () => {
      expect(await service.getStatsRealtimeVisitors('teamId', 'team')).toBe(
        getRealTimeVisitorsResponse
      )
    })
  })

  describe('getStatsAggregate', () => {
    beforeEach(() => {
      server.use(getStatsAggregate())
    })

    it('should return aggregate stats for journey', async () => {
      expect(
        await service.getStatsAggregate('journeyId', 'journey', {
          metrics: 'metrics'
        })
      ).toEqual(getStatsAggregateResponse.results)
    })

    it('should return aggregate stats for team', async () => {
      expect(
        await service.getStatsAggregate('teamId', 'team', {
          metrics: 'metrics'
        })
      ).toEqual(getStatsAggregateResponse.results)
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
    beforeEach(() => {
      server.use(getStatsBreakdown())
    })

    it('should return breakdown stats for journey', async () => {
      expect(
        await service.getStatsBreakdown('journeyId', 'journey', {
          property: 'property',
          metrics: 'metrics'
        })
      ).toEqual(getStatsBreakdownResponse.results)
    })

    it('should return breakdown stats for team', async () => {
      expect(
        await service.getStatsBreakdown('teamId', 'team', {
          property: 'property',
          metrics: 'metrics'
        })
      ).toEqual(getStatsBreakdownResponse.results)
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
    beforeEach(() => {
      server.use(getStatsTimeseries())
    })

    it('should return timeseries stats for journey', async () => {
      expect(
        await service.getStatsTimeseries('journeyId', 'journey', {
          metrics: 'metrics'
        })
      ).toEqual(getStatsTimeseriesResponse.results)
    })

    it('should return timeseries stats for team', async () => {
      expect(
        await service.getStatsTimeseries('teamId', 'team', {
          metrics: 'metrics'
        })
      ).toEqual(getStatsTimeseriesResponse.results)
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
