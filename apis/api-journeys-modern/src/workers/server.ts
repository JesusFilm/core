import { Job, Queue, Worker } from 'bullmq'
import { Logger } from 'pino'

import { env } from '../env'

import { connection } from './lib/connection'
import { runIfLeader } from './lib/leader'
import { logger } from './lib/logger'

const ONE_HOUR = 3600
const ONE_DAY = 86_400

interface RunOptions {
  service: (job: Job, logger?: Logger) => Promise<void>
  queueName: string
  repeat?: string
  jobData?: Record<string, unknown>
  concurrency?: number
}

function run({
  service,
  queueName,
  repeat,
  jobData,
  concurrency
}: RunOptions): void {
  if (
    concurrency != null &&
    !(Number.isFinite(concurrency) && concurrency > 0)
  ) {
    logger.warn(
      { queue: queueName, concurrency },
      'invalid concurrency; using default'
    )
  }

  const workerOptions: ConstructorParameters<typeof Worker>[2] =
    typeof concurrency === 'number' &&
    Number.isFinite(concurrency) &&
    concurrency > 0
      ? { connection, concurrency }
      : { connection }

  const worker = new Worker(queueName, job, workerOptions)

  const queueLogger = logger.child({ queue: queueName })

  worker.on('failed', (job, err) => {
    queueLogger.error(
      {
        jobId: job?.id,
        jobName: job?.name,
        error: err
      },
      'Job failed'
    )
  })

  worker.on('error', (err) => {
    queueLogger.error({ error: err }, 'Worker error')
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

  logger.info({ queue: queueName, concurrency }, 'waiting for jobs')

  if (repeat != null) {
    const queue = new Queue(queueName, { connection })
    void queue.add(`${queueName}-job`, jobData ?? {}, {
      removeOnComplete: { age: ONE_HOUR },
      removeOnFail: { age: ONE_DAY },
      repeat: { pattern: repeat }
    })
    logger.info({ queue: queueName, repeat }, 'scheduled recurring job')
  }
}

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
    run(
      await import(
        /* webpackChunkName: "e2eCleanup" */
        './e2eCleanup'
      )
    )
    // Google Sheets sync worker - concurrency of 1 to prevent race conditions
    run({
      ...(await import(
        /* webpackChunkName: 'googleSheetsSync' */
        './googleSheetsSync'
      )),
      concurrency: 1
    })
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
