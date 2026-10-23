import { randomUUID } from 'node:crypto'

import { logger as parentLogger } from '../../../logger'
import { redisClient } from '../redisClient'

const logger = parentLogger.child({ module: 'campaignTranslationRunLock' })

/**
 * How long a run holds its key without reporting back. Each finished batch
 * extends it, so only a crashed instance's run outlives it.
 */
export const TRANSLATION_RUN_LOCK_TTL_SECONDS = 10 * 60

// Compare-and-act on the key so a run whose key expired and was taken by
// another run never extends or deletes that run's key.
const EXTEND_IF_HELD = `if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('expire', KEYS[1], ARGV[2]) else return 0 end`
const RELEASE_IF_HELD = `if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end`

function key(campaignId: string, languageId: string): string {
  return `campaign-translate:${campaignId}:${languageId}`
}

export interface TranslationRunLock {
  /** Push the key's expiry out by the TTL again; a failure is logged, not thrown. */
  extend: () => Promise<void>
  /** Delete the key while it still holds this run's token; a failure is logged, not thrown. */
  release: () => Promise<void>
}

/**
 * Take the one in-flight machine-translation run of a campaign language,
 * across api-journeys instances: a Redis `SET NX` key holding a random token,
 * with a TTL. Resolves null when another run holds it. Rejects when Redis
 * cannot be reached, so the caller can fail closed.
 */
export async function acquireTranslationRunLock(
  campaignId: string,
  languageId: string
): Promise<TranslationRunLock | null> {
  const runKey = key(campaignId, languageId)
  const token = randomUUID()
  const taken = await redisClient().set(
    runKey,
    token,
    'EX',
    TRANSLATION_RUN_LOCK_TTL_SECONDS,
    'NX'
  )
  if (taken !== 'OK') return null

  return {
    extend: async () => {
      try {
        await redisClient().eval(
          EXTEND_IF_HELD,
          1,
          runKey,
          token,
          TRANSLATION_RUN_LOCK_TTL_SECONDS
        )
      } catch (error) {
        logger.warn({ error, campaignId, languageId }, 'run lock extend failed')
      }
    },
    release: async () => {
      try {
        await redisClient().eval(RELEASE_IF_HELD, 1, runKey, token)
      } catch (error) {
        logger.warn(
          { error, campaignId, languageId },
          'run lock release failed'
        )
      }
    }
  }
}
