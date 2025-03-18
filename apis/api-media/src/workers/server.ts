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

    childLogger.info('started job')
    await service(childLogger)
    childLogger.info('finished job')
  }

  logger.info({ queue: queueName }, 'waiting for jobs')
  const queue = new Queue(queueName, { connection })

  void queue.add(
    jobName,
    {},
    {
      removeOnComplete: { age: ONE_HOUR },
      removeOnFail: { age: ONE_DAY, count: 50 },
      repeat: repeat != null ? { pattern: repeat } : undefined
    }
  )
}

async function main(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    run(
      await import(
        /* webpackChunkName: "algolia" */
        './algolia'
      )
    )
    run(
      await import(
        /* webpackChunkName: "big-query" */
        './bigQuery'
      )
    )
    run(
      await import(
        /* webpackChunkName: "crowdin" */
        './crowdin'
      )
    )
    run(
      await import(
        /* webpackChunkName: "data-export" */
        './dataExport'
      )
    )
    run(
      await import(
        /* webpackChunkName: "blocklist" */
        './blocklist'
      )
    )
  }

  // Register dataImport worker but don't auto-schedule it
  // Only register the worker if DB_SEED_PATH is defined
  if (process.env.DB_SEED_PATH) {
    const dataImportModule = await import(
      /* webpackChunkName: "data-import" */
      './dataImport'
    )
    // Create a worker without scheduling automatic runs
    // eslint-disable-next-line no-new
    new Worker(
      dataImportModule.queueName,
      async (job: Job) => {
        if (job.name !== dataImportModule.jobName) return

        const childLogger = logger.child({
          queue: dataImportModule.queueName,
          jobId: job.id
        })

        childLogger.info('started job')
        await dataImportModule.service(childLogger)
        childLogger.info('finished job')
      },
      {
        connection
      }
    )
    logger.info({ queue: dataImportModule.queueName }, 'waiting for jobs')
  }

  if (process.env.NODE_ENV !== 'production') {
    run(
      await import(
        /* webpackChunkName: "seed" */
        './seed'
      )
    )
  }
}

// avoid running on test environment
if (process.env.NODE_ENV !== 'test') void main()
