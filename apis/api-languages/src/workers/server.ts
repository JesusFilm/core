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

// Special function for data import worker which needs job data
function runDataImport(): void {
  const queueName = 'api-languages-data-import'
  const jobName = `${queueName}-job`

  // eslint-disable-next-line no-new
  new Worker(
    queueName,
    async (job) => {
      if (job.name !== jobName) return

      const childLogger = logger.child({
        queue: queueName,
        jobId: job.id
      })

      logger.info('started data import job')

      const { service } = await import(
        /* webpackChunkName: "data-import" */
        './dataImport/service'
      )
      const { filePath, clearExistingData } = job.data

      await service(filePath, { clearExistingData }, childLogger)

      logger.info('finished data import job')
    },
    {
      connection
    }
  )

  logger.info({ queue: queueName }, 'waiting for data import jobs')
}

async function main(): Promise<void> {
  run(
    await import(
      /* webpackChunkName: "algolia" */
      './algolia'
    )
  )
  // run(
  //   await import(
  //     /* webpackChunkName: "big-query" */
  //     './bigQuery'
  //   )
  // )
  run(
    await import(
      /* webpackChunkName: "data-export" */
      './dataExport'
    )
  )

  // Run data import worker separately since it needs job data
  runDataImport()
}

// avoid running on test environment
if (process.env.NODE_ENV !== 'test') void main()
