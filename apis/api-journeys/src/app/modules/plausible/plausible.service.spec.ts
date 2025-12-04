import { BullModule, getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'
import { mockDeep } from 'jest-mock-extended'
import { setupServer } from 'msw/node'

import {
  getRealTimeVisitors,
  getRealTimeVisitorsResponse,
  getStatsAggregate,
  getStatsAggregateResponse,
  getStatsBreakdown,
  getStatsBreakdownResponse,
  getStatsTimeseries,
  getStatsTimeseriesResponse
} from './plausible.handlers'
import { PlausibleService } from './plausible.service'

describe('PlausibleService', () => {
  let service: PlausibleService, plausibleQueue: { add: jest.Mock }

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
      providers: [PlausibleService]
    })
      .overrideProvider(getQueueToken('api-journeys-plausible'))
      .useValue(plausibleQueue)
      .compile()
    service = module.get<PlausibleService>(PlausibleService)

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
