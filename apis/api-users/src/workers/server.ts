import { Job, Worker } from 'bullmq'
import { Logger } from 'pino'

import { connection } from './lib/connection'
import { runIfLeader } from './lib/leader'
import { logger } from './lib/logger'

function run({
  service,
  queueName
}: {
  service: (job: Job, logger?: Logger) => Promise<void>
  queueName: string
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
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    run(
      await import(
        /* webpackChunkName: 'email' */
        './email'
      )
    )
    return
  }

  await runIfLeader(async () => {
    run(
      await import(
        /* webpackChunkName: 'email' */
        './email'
      )
    )
  })
}

// avoid running on test environment
if (process.env.NODE_ENV !== 'test') void main()
