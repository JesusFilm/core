import { Job, Queue, Worker } from 'bullmq'
import { Logger } from 'pino'

import { connection } from './lib/connection'
import { logger } from './lib/logger'

const ONE_HOUR = 3600
const ONE_DAY = 86_400

function run({
  service,
  queueName,
  repeat
}: {
  service: (job: Job, logger?: Logger) => Promise<void>
  queueName: string
  repeat?: string
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

  if (repeat != null) {
    // Set up scheduled job
    const queue = new Queue(queueName, { connection })
    void queue.add(
      `${queueName}-job`,
      { __typename: 'updateAllShortlinks' },
      {
        removeOnComplete: { age: ONE_HOUR },
        removeOnFail: { age: ONE_DAY },
        repeat: repeat != null ? { pattern: repeat } : undefined
      }
    )
    logger.info({ queue: queueName, repeat }, 'scheduled recurring job')
  }
}

async function main(): Promise<void> {
  run(
    await import(
      /* webpackChunkName: "email" */
      './email'
    )
  )
  run(
    await import(
      /* webpackChunkName: "emailEvents" */
      './emailEvents'
    )
  )
  run(
    await import(
      /* webpackChunkName: "revalidate" */
      './revalidate'
    )
  )
  run(
    await import(
      /* webpackChunkName: "shortlinkUpdater" */
      './shortlinkUpdater'
    )
  )
}

// avoid running on test environment
if (process.env.NODE_ENV !== 'test') void main()
