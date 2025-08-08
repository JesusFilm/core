import os from 'node:os'

import Redis from 'ioredis'
import type { Logger } from 'pino'

import { connection } from './connection'
import type { RedisConnectionConfig } from './connection'

type RunIfLeaderOptions = {
  lockKey: string
  lockTtlMs?: number
  contend?: boolean
  contendDelayMs?: number
  logger?: Logger
  /**
   * What to do when the instance loses the leader lock.
   * - 'contend' (default): continue running and contend to become leader again
   * - 'exit': gracefully release resources and exit the process
   * - 'shutdown': run the provided shutdown hook and stop contending
   */
  onLeadershipLoss?: 'contend' | 'exit' | 'shutdown'
  /**
   * Optional shutdown hook to be executed when onLeadershipLoss is 'shutdown'.
   */
  onLeadershipLossShutdown?: () => Promise<void> | void
}

const DEFAULT_LOCK_TTL_MS = 60_000
const DEFAULT_CONTEND = true
const DEFAULT_CONTEND_DELAY_MS = 10_000

export async function runIfLeader(
  task: () => Promise<void> | void,
  options: RunIfLeaderOptions
): Promise<void> {
  const lockKey = options.lockKey
  const lockTtlMs = options.lockTtlMs ?? DEFAULT_LOCK_TTL_MS
  const contend = options.contend ?? DEFAULT_CONTEND
  const contendDelayMs = options.contendDelayMs ?? DEFAULT_CONTEND_DELAY_MS
  const logger = options.logger
  const onLeadershipLoss = options.onLeadershipLoss ?? 'contend'

  const isUrlConfig = (cfg: RedisConnectionConfig): cfg is { url: string } =>
    'url' in cfg

  const commonRedisOptions = {
    // Exponential backoff with a cap for reconnection attempts
    retryStrategy: (retryCount: number) => {
      const delayMs = Math.min(retryCount * 1000, 30_000)
      logger?.warn({ retryCount, delayMs }, 'redis retrying connection')
      return delayMs
    },
    // Proactively reconnect on common transient errors
    reconnectOnError: (err: Error) => {
      const message = err.message ?? ''
      const shouldReconnect =
        message.includes('READONLY') ||
        message.includes('ETIMEDOUT') ||
        message.includes('ECONNRESET') ||
        message.includes('EPIPE')
      if (shouldReconnect) {
        logger?.warn({ error: err }, 'redis reconnectOnError triggered')
      }
      return shouldReconnect
    }
  }

  const redis = isUrlConfig(connection)
    ? new Redis(connection.url, commonRedisOptions)
    : new Redis({
        host: connection.host,
        port: connection.port,
        ...commonRedisOptions
      })

  // Basic connection lifecycle logging and error handling
  redis.on('error', (error) => {
    logger?.error({ error }, 'redis client error')
  })
  redis.on('connect', () => {
    const details = isUrlConfig(connection)
      ? { url: connection.url }
      : { host: connection.host, port: connection.port }
    logger?.info(details, 'redis client connected')
  })
  redis.on('reconnecting', (delayMs: number) => {
    logger?.warn({ delayMs }, 'redis client reconnecting')
  })
  redis.on('end', () => {
    logger?.warn('redis client connection closed')
  })
  const instanceId = `${os.hostname()}:${process.pid}:${Math.random()
    .toString(36)
    .slice(2)}`

  let isLeader = false
  let taskHasRun = false
  let renewInterval: NodeJS.Timeout | undefined
  let contendInterval: NodeJS.Timeout | undefined

  const renewScript = `
    if redis.call('GET', KEYS[1]) == ARGV[1] then
      return redis.call('PEXPIRE', KEYS[1], ARGV[2])
    else
      return 0
    end
  `

  const releaseScript = `
    if redis.call('GET', KEYS[1]) == ARGV[1] then
      return redis.call('DEL', KEYS[1])
    else
      return 0
    end
  `

  const stopRenewal = (): void => {
    if (renewInterval != null) clearInterval(renewInterval)
    renewInterval = undefined
  }

  const startRenewal = (): void => {
    const renewIntervalMs = Math.floor(lockTtlMs / 2)
    renewInterval = setInterval(() => {
      void (async () => {
        try {
          const result = (await redis.eval(
            renewScript,
            1,
            lockKey,
            instanceId,
            String(lockTtlMs)
          )) as number
          if (result === 0) {
            if (isLeader) logger?.warn({ lockKey }, 'lost leader lock')
            isLeader = false
            stopRenewal()
            await handleLeadershipLoss()
          }
        } catch (error) {
          logger?.error({ error }, 'failed to renew leader lock')
        }
      })()
    }, renewIntervalMs)
  }

  const handleLeadershipLoss = async (): Promise<void> => {
    try {
      if (onLeadershipLoss === 'exit') {
        logger?.warn({ lockKey }, 'exiting due to leadership loss')
        await release()
        // eslint-disable-next-line no-process-exit
        process.exit()
      }

      if (onLeadershipLoss === 'shutdown') {
        logger?.info(
          { lockKey },
          'running shutdown hook due to leadership loss'
        )
        try {
          await options.onLeadershipLossShutdown?.()
        } catch (error) {
          logger?.error({ error }, 'shutdown hook failed after leadership loss')
        }
        await release()
        return
      }

      // Default behavior: continue contending
      startContending()
    } catch (error) {
      logger?.error({ error }, 'failed to handle leadership loss')
    }
  }

  const runTaskOnce = async (): Promise<void> => {
    if (taskHasRun) return
    try {
      await task()
      taskHasRun = true
    } catch (error) {
      logger?.error({ error }, 'leader task execution failed')
    }
  }

  const becomeLeader = async (): Promise<void> => {
    if (isLeader) return
    isLeader = true
    if (contendInterval != null) clearInterval(contendInterval)
    contendInterval = undefined
    logger?.info(
      { lockKey, instanceId },
      'acquired leader lock; initializing workers'
    )
    startRenewal()
    await runTaskOnce()
  }

  const tryAcquire = async (): Promise<void> => {
    try {
      const setResult = await redis.set(
        lockKey,
        instanceId,
        'PX',
        lockTtlMs,
        'NX'
      )
      if (setResult === 'OK') await becomeLeader()
    } catch (error) {
      logger?.error({ error }, 'error attempting to acquire leader lock')
    }
  }

  const startContending = (): void => {
    if (!contend || contendInterval != null) return
    logger?.info(
      { lockKey, delayMs: contendDelayMs },
      'contending for leader lock'
    )
    contendInterval = setInterval(() => {
      void tryAcquire()
    }, contendDelayMs)
  }

  const release = async (): Promise<void> => {
    try {
      stopRenewal()
      if (contendInterval != null) clearInterval(contendInterval)
      contendInterval = undefined
      if (isLeader) await redis.eval(releaseScript, 1, lockKey, instanceId)
    } catch (error) {
      logger?.error({ error }, 'failed to release leader lock')
    } finally {
      await redis.quit()
    }
  }

  const onExit = async (): Promise<void> => {
    await release()
    // eslint-disable-next-line no-process-exit
    process.exit()
  }
  process.once('SIGINT', () => {
    void onExit()
  })
  process.once('SIGTERM', () => {
    void onExit()
  })
  process.once('beforeExit', () => {
    void release()
  })

  // Initial attempt
  const setResult = await redis.set(lockKey, instanceId, 'PX', lockTtlMs, 'NX')
  if (setResult === 'OK') {
    await becomeLeader()
    return
  }

  if (contend) {
    startContending()
    // Keep the promise unresolved so the process can become leader later
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return new Promise<void>(() => {})
  }

  logger?.info(
    { lockKey },
    'another instance holds the leader lock; not contending'
  )
  await redis.quit()
}
