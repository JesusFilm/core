import { Job, Worker } from 'bullmq'

import { connection } from '../lib/connection'
import { logger } from '../lib/logger'

import { queueName } from './config'
import { service } from './service'

export const worker = new Worker(queueName, processJob, {
  connection
})

async function processJob(job: Job): Promise<void> {
  const childLogger = logger.child({
    queue: queueName,
    jobId: job.id
  })

  childLogger.info(`started job: ${job.name}`)
  await service(job, childLogger)
  childLogger.info(`finished job: ${job.name}`)
}

logger.info(
  { queue: queueName },
  'processVideoDownloads worker waiting for jobs'
)
