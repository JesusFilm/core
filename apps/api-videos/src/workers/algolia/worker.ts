import { Job, Worker } from 'bullmq'

import { connection } from '../connection'
import { logger as parentLogger } from '../logger'

import { exportToAlgolia } from './exporter'
import { jobName, queueName } from './names'

export async function jobFn(job: Job): Promise<void> {
  if (job.name !== jobName) return

  const logger = parentLogger.child({
    queue: queueName,
    jobId: job.id
  })
  logger.info('algolia export started')
  await exportToAlgolia(logger)
  logger.info('algolia export finished')
}

// avoid running on test environment
if (process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line no-new
  new Worker(queueName, jobFn, { connection })
  parentLogger.info({ queue: queueName }, 'waiting for jobs')
}
