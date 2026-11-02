import Redis from 'ioredis'

import { connection } from '@core/yoga/redis/connection'

import { logger as parentLogger } from '../logger'

const logger = parentLogger.child({ module: 'campaignRedis' })

let client: Redis | undefined

/**
 * The one Redis client the campaign stats cache and the machine-translation
 * run lock share, made on first use. Short timeouts and two retries per
 * request, so an outage fails the call quickly instead of queueing it.
 */
export function redisClient(): Redis {
  if (client != null) return client
  const options = { connectTimeout: 5000, maxRetriesPerRequest: 2 }
  client =
    'url' in connection
      ? new Redis(connection.url, options)
      : new Redis({ host: connection.host, port: connection.port, ...options })
  client.on('error', (error) => {
    logger.error({ error }, 'redis connection error')
  })
  return client
}
