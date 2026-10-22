import {
  STATS_CACHE_TTL_SECONDS,
  STATS_REFRESH_BACKOFF_SECONDS,
  statsCache
} from './statsCache'

const redis = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  on: vi.fn(),
  options: [] as unknown[]
}))

const logger = vi.hoisted(() => ({ error: vi.fn() }))

vi.mock('../../logger', () => ({
  logger: { child: () => logger }
}))

vi.mock('ioredis', () => ({
  default: vi.fn(function (this: unknown, ...args: unknown[]) {
    redis.options.push(args)
    return redis
  })
}))

const sweep = {
  from: '2026-10-05T00:00:00.000Z',
  to: '2026-10-06T00:00:00.000Z',
  journeys: { journeyId: [{ countryCode: 'GB', visitors: 3 }] }
}

const NOW = new Date('2026-10-06T12:00:00.000Z').getTime()
const SECOND = 1000

function stored(entry: object): string {
  return JSON.stringify(entry)
}

describe('statsCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    redis.set.mockResolvedValue('OK')
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('get', () => {
    it('reads the entry keyed by campaign id', async () => {
      redis.get.mockResolvedValue(null)

      await statsCache.get('campaignId')

      expect(redis.get).toHaveBeenCalledWith('campaign-stats:campaignId')
    })

    it('is a miss when nothing is stored', async () => {
      redis.get.mockResolvedValue(null)

      expect(await statsCache.get('campaignId')).toBeNull()
    })

    it('is fresh within the TTL', async () => {
      redis.get.mockResolvedValue(
        stored({
          sweptAt: NOW - (STATS_CACHE_TTL_SECONDS - 1) * SECOND,
          sweep
        })
      )

      expect(await statsCache.get('campaignId')).toEqual({
        sweep,
        sweptAt: NOW - (STATS_CACHE_TTL_SECONDS - 1) * SECOND,
        fresh: true,
        backingOff: false,
        partial: false
      })
    })

    it('is fresh while a partial sweep is backing off, then due for a retry long before the TTL', async () => {
      redis.get.mockResolvedValue(
        stored({
          sweptAt: NOW,
          retryAfter: NOW + SECOND,
          partial: true,
          sweep
        })
      )
      expect(await statsCache.get('campaignId')).toEqual({
        sweep,
        sweptAt: NOW,
        fresh: true,
        backingOff: true,
        partial: true
      })

      vi.setSystemTime(NOW + SECOND)

      expect(await statsCache.get('campaignId')).toEqual({
        sweep,
        sweptAt: NOW,
        fresh: false,
        backingOff: false,
        partial: true
      })
    })

    it('is stale, but still returns the sweep, once the TTL has passed', async () => {
      redis.get.mockResolvedValue(
        stored({ sweptAt: NOW - STATS_CACHE_TTL_SECONDS * SECOND, sweep })
      )

      const cached = await statsCache.get('campaignId')

      expect(cached?.fresh).toBe(false)
      expect(cached?.sweep).toEqual(sweep)
    })

    it('is backing off until the retry time passes', async () => {
      redis.get.mockResolvedValue(
        stored({ sweptAt: NOW, retryAfter: NOW + SECOND, sweep })
      )
      expect((await statsCache.get('campaignId'))?.backingOff).toBe(true)

      vi.setSystemTime(NOW + SECOND)

      expect((await statsCache.get('campaignId'))?.backingOff).toBe(false)
    })

    it('is never fresh for a failure marker', async () => {
      redis.get.mockResolvedValue(
        stored({ sweptAt: NOW, retryAfter: NOW + SECOND, sweep: null })
      )

      expect(await statsCache.get('campaignId')).toEqual({
        sweep: null,
        sweptAt: NOW,
        fresh: false,
        backingOff: true,
        partial: false
      })
    })

    it('rejects on a Redis failure rather than reading it as a miss', async () => {
      const error = new Error('ECONNREFUSED')
      redis.get.mockRejectedValue(error)

      await expect(statsCache.get('campaignId')).rejects.toBe(error)
    })

    it('logs a Redis read failure once per campaign per minute', async () => {
      redis.get.mockRejectedValue(new Error('ECONNREFUSED'))
      const readFailures = (): unknown[] =>
        logger.error.mock.calls.filter(
          ([, message]) => message === 'stats cache read failed'
        )

      await expect(statsCache.get('outageCampaignId')).rejects.toThrow()
      await expect(statsCache.get('outageCampaignId')).rejects.toThrow()
      vi.setSystemTime(NOW + 59 * SECOND)
      await expect(statsCache.get('outageCampaignId')).rejects.toThrow()
      expect(readFailures()).toHaveLength(1)

      await expect(statsCache.get('otherCampaignId')).rejects.toThrow()
      expect(readFailures()).toHaveLength(2)

      vi.setSystemTime(NOW + 60 * SECOND)
      await expect(statsCache.get('outageCampaignId')).rejects.toThrow()
      expect(readFailures()).toHaveLength(3)
    })

    it('reads a corrupt entry as a miss', async () => {
      redis.get.mockResolvedValue('{not json')

      expect(await statsCache.get('campaignId')).toBeNull()
    })
  })

  describe('set', () => {
    it('stores the sweep with the time it was taken, retained for a day', async () => {
      await statsCache.set('campaignId', sweep)

      expect(redis.set).toHaveBeenCalledWith(
        'campaign-stats:campaignId',
        JSON.stringify({ sweptAt: NOW, sweep }),
        'EX',
        24 * 60 * 60
      )
    })

    it('stores a partial sweep with a retry time so it is not fresh for the full TTL', async () => {
      await statsCache.set('campaignId', sweep, { partial: true })

      expect(redis.set).toHaveBeenCalledWith(
        'campaign-stats:campaignId',
        JSON.stringify({
          sweptAt: NOW,
          retryAfter: NOW + STATS_REFRESH_BACKOFF_SECONDS * SECOND,
          partial: true,
          sweep
        }),
        'EX',
        24 * 60 * 60
      )
    })

    it('swallows a Redis write failure', async () => {
      redis.set.mockRejectedValue(new Error('READONLY'))

      await expect(statsCache.set('campaignId', sweep)).resolves.toBeUndefined()
    })
  })

  describe('deferRefresh', () => {
    it('writes a sweepless failure marker for the backoff when nothing is cached', async () => {
      await statsCache.deferRefresh('campaignId', null)

      expect(redis.set).toHaveBeenCalledWith(
        'campaign-stats:campaignId',
        JSON.stringify({
          sweptAt: NOW,
          retryAfter: NOW + STATS_REFRESH_BACKOFF_SECONDS * SECOND,
          sweep: null
        }),
        'EX',
        STATS_REFRESH_BACKOFF_SECONDS
      )
    })

    it('keeps the cached sweep and its sweep time, and retains it for the rest of its day', async () => {
      const sweptAt = NOW - 2 * 60 * 60 * SECOND

      await statsCache.deferRefresh('campaignId', {
        sweep,
        sweptAt,
        fresh: false,
        backingOff: false,
        partial: false
      })

      expect(redis.set).toHaveBeenCalledWith(
        'campaign-stats:campaignId',
        JSON.stringify({
          sweptAt,
          retryAfter: NOW + STATS_REFRESH_BACKOFF_SECONDS * SECOND,
          sweep
        }),
        'EX',
        22 * 60 * 60
      )
    })

    it('keeps a partial sweep partial so it is still retried rather than going fresh', async () => {
      await statsCache.deferRefresh('campaignId', {
        sweep,
        sweptAt: NOW - 60 * SECOND,
        fresh: false,
        backingOff: false,
        partial: true
      })

      expect(redis.set).toHaveBeenCalledWith(
        'campaign-stats:campaignId',
        JSON.stringify({
          sweptAt: NOW - 60 * SECOND,
          retryAfter: NOW + STATS_REFRESH_BACKOFF_SECONDS * SECOND,
          partial: true,
          sweep
        }),
        'EX',
        24 * 60 * 60 - 60
      )
    })

    it('does not write an entry that has already outlived its retention', async () => {
      await statsCache.deferRefresh('campaignId', {
        sweep,
        sweptAt: NOW - 24 * 60 * 60 * SECOND,
        fresh: false,
        backingOff: false,
        partial: false
      })

      expect(redis.set).not.toHaveBeenCalled()
    })

    it('swallows a Redis write failure', async () => {
      redis.set.mockRejectedValue(new Error('READONLY'))

      await expect(
        statsCache.deferRefresh('campaignId', null)
      ).resolves.toBeUndefined()
    })
  })
})
