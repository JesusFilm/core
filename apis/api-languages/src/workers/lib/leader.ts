import { runIfLeader as sharedRunIfLeader } from '@core/yoga/redis/leader'

import { logger as parentLogger } from '../../logger'

const logger = parentLogger.child({ module: 'worker', submodule: 'leader' })

// Local options kept for potential future extension; currently unused
export type RunIfLeaderOptions = {
  lockTtlMs?: number
  contend?: boolean
  contendDelayMs?: number
}

const DEFAULT_LOCK_TTL_MS = 60_000
const DEFAULT_CONTEND = true
const DEFAULT_CONTEND_DELAY_MS = 10_000

/**
 * Runs the provided task only if this instance acquires the leader lock.
 * The lock is automatically renewed while the process is alive and released on shutdown.
 */
export async function runIfLeader(
  task: () => Promise<void> | void,
  options: {
    lockTtlMs?: number
    contend?: boolean
    contendDelayMs?: number
  } = {}
): Promise<void> {
  await sharedRunIfLeader(task, {
    lockKey: 'api-languages:workers:leader',
    lockTtlMs: options.lockTtlMs ?? DEFAULT_LOCK_TTL_MS,
    contend: options.contend ?? DEFAULT_CONTEND,
    contendDelayMs: options.contendDelayMs ?? DEFAULT_CONTEND_DELAY_MS,
    logger
  })
}
