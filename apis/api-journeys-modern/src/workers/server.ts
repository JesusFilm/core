import { Job, Queue, Worker } from 'bullmq'
import { Logger } from 'pino'

import { env } from '../env'

import { connection } from './lib/connection'
import { runIfLeader } from './lib/leader'
import { logger } from './lib/logger'

const ONE_HOUR = 3600
const ONE_DAY = 86_400

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

async function main(): Promise<void> {
  async function importAndRunAllWorkers(): Promise<void> {
    // run(
    //   await import(
    //     /* webpackChunkName: 'email' */
    //     './email'
    //   )
    // )
    // run(
    //   await import(
    //     /* webpackChunkName: 'emailEvents' */
    //     './emailEvents'
    //   )
    // )
    // run(
    //   await import(
    //     /* webpackChunkName: 'revalidate' */
    //     './revalidate'
    //   )
    // )
    // run(
    //   await import(
    //     /* webpackChunkName: 'plausible' */
    //     './plausible'
    //   )
    // )
    // run(
    //   await import(
    //     /* webpackChunkName: 'shortlinkUpdater' */
    //     './shortlinkUpdater'
    //   )
    // )
    run(
      await import(
        /* webpackChunkName: "e2eCleanup" */
        './e2eCleanup'
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
