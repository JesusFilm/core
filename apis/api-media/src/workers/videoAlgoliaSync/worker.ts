import { Job, Worker } from 'bullmq'

import { connection } from '../lib/connection'
import { logger } from '../lib/logger'

import { queueName } from './config'
import { service } from './service'
import { VideoAlgoliaSyncJobData } from './types'

export const worker = new Worker<VideoAlgoliaSyncJobData>(
  queueName,
  processJob,
  {
    connection
  }
)

async function processJob(job: Job<VideoAlgoliaSyncJobData>): Promise<void> {
  const childLogger = logger.child({
    queue: queueName,
    jobId: job.id
  })

  childLogger.info(`started job: ${job.name}`)
  await service(job, childLogger)
  childLogger.info(`finished job: ${job.name}`)
}

logger.info({ queue: queueName }, 'videoAlgoliaSync worker waiting for jobs')
