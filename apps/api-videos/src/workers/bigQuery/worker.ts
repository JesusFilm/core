import { Job, Worker } from 'bullmq'

import { connection } from '../connection'

import { importBibleBookNames } from './importers/bibleBookNames'
import { jobName, queueName } from './names'

export const jobFn = async (job: Job): Promise<void> => {
  if (job.name !== jobName) return

  await importBibleBookNames([])
}

// avoid running on test environment
export const bigQueryWorker =
  process.env.NODE_ENV !== 'test'
    ? new Worker(queueName, jobFn, { connection })
    : undefined
