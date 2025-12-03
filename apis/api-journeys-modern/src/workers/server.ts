import { Job, Queue, Worker } from 'bullmq'
import { Logger } from 'pino'

import { connection } from './lib/connection'
import { runIfLeader } from './lib/leader'
import { logger } from './lib/logger'

const ONE_HOUR = 3600
const ONE_DAY = 86_400

/**
 * Start a worker to process jobs from the specified queue and optionally schedule a recurring or one-off job.
 *
 * The provided `service` is invoked for each job; each invocation receives a job-scoped logger. If `repeat` or `jobData`
 * is provided, a scheduled job is added to the queue with automatic removal on completion and failure.
 *
 * @param service - Worker function invoked for each job; receives the BullMQ `Job` and a scoped `Logger`
 * @param queueName - Name of the BullMQ queue to consume and (optionally) schedule jobs on
 * @param repeat - Optional cron-like pattern string to schedule a recurring job
 * @param jobData - Optional payload for the scheduled job (used for one-off or recurring scheduled jobs)
 */
function run({
  service,
  queueName,
  repeat,
  jobData
}: {
  service: (job: Job, logger?: Logger) => Promise<void>
  queueName: string
  repeat?: string
  jobData?: Record<string, unknown>
}): void {
  // eslint-disable-next-line no-new
  new Worker(queueName, job, {
    connection
  })

  async function job(job: Job): Promise<void> {
    const childLogger = logger.child({
      queue: queueName,
      jobId: job.id
    })

    childLogger.info(`started job: ${job.name}`)
    await service(job, childLogger)
    childLogger.info(`finished job: ${job.name}`)
  }

  logger.info({ queue: queueName }, 'waiting for jobs')

  if (repeat != null || jobData != null) {
    // Set up scheduled or one-off job
    const queue = new Queue(queueName, { connection })
    void queue.add(`${queueName}-job`, jobData ?? {}, {
      removeOnComplete: { age: ONE_HOUR },
      removeOnFail: { age: ONE_DAY },
      repeat: repeat != null ? { pattern: repeat } : undefined
    })
    logger.info(
      { queue: queueName, repeat },
      repeat != null ? 'scheduled recurring job' : 'scheduled one-off job'
    )
  }
}

/**
 * Loads worker modules and starts their workers, running them only on the elected leader in production.
 *
 * In non-production environments, imports and starts all workers immediately. In production, defers starting workers until leadership is acquired via `runIfLeader`.
 */
async function main(): Promise<void> {
  async function importAndRunAllWorkers(): Promise<void> {
    run(
      await import(
        /* webpackChunkName: 'email' */
        './email'
      )
    )
    run(
      await import(
        /* webpackChunkName: 'emailEvents' */
        './emailEvents'
      )
    )
    run(
      await import(
        /* webpackChunkName: 'revalidate' */
        './revalidate'
      )
    )
    run(
      await import(
        /* webpackChunkName: 'plausible' */
        './plausible'
      )
    )
    run(
      await import(
        /* webpackChunkName: 'shortlinkUpdater' */
        './shortlinkUpdater'
      )
    )
  }

  if (process.env.NODE_ENV !== 'production') {
    await importAndRunAllWorkers()
    return
  }

  await runIfLeader(async () => {
    await importAndRunAllWorkers()
  })
}

// avoid running on test environment
if (process.env.NODE_ENV !== 'test') void main()