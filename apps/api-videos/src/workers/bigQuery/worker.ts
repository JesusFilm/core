import { Job, Worker } from 'bullmq'

import { connection } from '../connection'
import { logger as parentLogger } from '../logger'

import { importBibleBookNames } from './importers/bibleBookNames'
import { importBibleBooks } from './importers/bibleBooks'
import { importBibleCitations } from './importers/bibleCitations'
import { importKeywords } from './importers/keywords'
import { importLanguageSlugs } from './importers/languageSlugs'
import { importVideos } from './importers/videos'
import { jobName, queueName } from './names'

export const jobFn = async (job: Job): Promise<void> => {
  if (job.name !== jobName) return

  const logger = parentLogger.child({
    queue: queueName,
    jobId: job.id
  })
  logger.info('import started')
  const cleanup = [
    await importLanguageSlugs(logger),
    await importVideos(logger),
    await importBibleBooks(logger),
    // depends on bibleBooks
    await importBibleBookNames(logger),
    // depends on videos
    await importKeywords(logger),
    // depends on bibleBooks and videos
    await importBibleCitations(logger)
  ]
  cleanup.forEach((fn) => fn?.())
  logger.info('import finished')
}

// avoid running on test environment
if (process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line no-new
  new Worker(queueName, jobFn, { connection })
  parentLogger.info({ queue: queueName }, 'waiting for jobs')
}
