import { runIfLeader as sharedRunIfLeader } from '@core/yoga/redis/leader'

import { logger as parentLogger } from '../../logger'

const logger = parentLogger.child({ module: 'worker', submodule: 'leader' })

const DEFAULT_LOCK_TTL_MS = 60_000
const DEFAULT_CONTEND = true
const DEFAULT_CONTEND_DELAY_MS = 10_000

export async function runIfLeader(
  task: () => Promise<void> | void,
  options: {
    lockTtlMs?: number
    contend?: boolean
    contendDelayMs?: number
  } = {}
): Promise<void> {
  await sharedRunIfLeader(task, {
    lockKey: 'api-media:workers:leader',
    lockTtlMs: options.lockTtlMs ?? DEFAULT_LOCK_TTL_MS,
    contend: options.contend ?? DEFAULT_CONTEND,
    contendDelayMs: options.contendDelayMs ?? DEFAULT_CONTEND_DELAY_MS,
    logger
  })
}
