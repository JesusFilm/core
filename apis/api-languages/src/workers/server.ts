import { Job, Queue, Worker } from 'bullmq'
import { Logger } from 'pino'

import { connection } from './lib/connection'
import { logger } from './lib/logger'

const ONE_HOUR = 3600
const ONE_DAY = 86_400

function run({
  service,
  queueName,
  jobName,
  repeat
}: {
  service: (logger?: Logger) => Promise<void>
  queueName: string
  jobName: string
  repeat?: string
}): void {
  // eslint-disable-next-line no-new
  new Worker(queueName, job, {
    connection
  })

  async function job(job: Job): Promise<void> {
    if (job.name !== jobName) return

    const childLogger = logger.child({
      queue: queueName,
      jobId: job.id
    })

    logger.info('started job')
    await service(childLogger)
    logger.info('finished job')
  }

  logger.info({ queue: queueName }, 'waiting for jobs')
  const queue = new Queue(queueName, { connection })

  void queue.add(
    jobName,
    {},
    {
      removeOnComplete: { age: ONE_HOUR },
      removeOnFail: { age: ONE_DAY },
      repeat: repeat != null ? { pattern: repeat } : undefined
    }
  )
}

async function main(): Promise<void> {
  run(
    await import(
      /* webpackChunkName: "algolia" */
      './algolia'
    )
  )
  if (process.env.NODE_ENV === 'production') {
    run(
      await import(
        /* webpackChunkName: "data-export" */
        './dataExport'
      )
    )
  }
}

// avoid running on test environment
if (process.env.NODE_ENV !== 'test') void main()
