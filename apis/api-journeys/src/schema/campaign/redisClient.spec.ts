import type { RedisConnectionConfig } from '@core/yoga/redis/connection'

const redis = vi.hoisted(() => ({ on: vi.fn() }))

const Redis = vi.hoisted(() =>
  vi.fn(function () {
    return redis
  })
)

const logger = vi.hoisted(() => ({ error: vi.fn() }))

/** The connection config `redisClient` reads when it makes the client. */
const redisConnection = vi.hoisted((): { current: RedisConnectionConfig } => ({
  current: { url: 'redis://cache.example.org:6380' }
}))

vi.mock('ioredis', () => ({ default: Redis }))

vi.mock('@core/yoga/redis/connection', () => ({
  get connection() {
    return redisConnection.current
  }
}))

vi.mock('../logger', () => ({
  logger: { child: () => logger }
}))

/** A fresh `redisClient`, with no client made yet. */
async function loadRedisClient(): Promise<
  (typeof import('./redisClient'))['redisClient']
> {
  vi.resetModules()
  return (
    await import(
      /* webpackChunkName: "campaign-redis-client" */ './redisClient'
    )
  ).redisClient
}

describe('redisClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    redisConnection.current = { url: 'redis://cache.example.org:6380' }
  })

  it('makes one client and returns it on every call', async () => {
    const redisClient = await loadRedisClient()

    const first = redisClient()
    const second = redisClient()

    expect(second).toBe(first)
    expect(Redis).toHaveBeenCalledTimes(1)
  })

  it('builds the client from connection.url', async () => {
    const redisClient = await loadRedisClient()

    redisClient()

    expect(Redis).toHaveBeenCalledWith('redis://cache.example.org:6380', {
      connectTimeout: 5000,
      maxRetriesPerRequest: 2
    })
  })

  it('builds the client from connection.host and connection.port', async () => {
    redisConnection.current = { host: 'cache.internal', port: 6390 }
    const redisClient = await loadRedisClient()

    redisClient()

    expect(Redis).toHaveBeenCalledWith({
      host: 'cache.internal',
      port: 6390,
      connectTimeout: 5000,
      maxRetriesPerRequest: 2
    })
  })

  it('logs an error event of the connection', async () => {
    const redisClient = await loadRedisClient()
    redisClient()
    const error = new Error('ECONNREFUSED')

    const onError = redis.on.mock.calls.find(
      ([event]) => event === 'error'
    )?.[1] as (error: Error) => void
    onError(error)

    expect(logger.error).toHaveBeenCalledWith(
      { error },
      'redis connection error'
    )
  })
})
