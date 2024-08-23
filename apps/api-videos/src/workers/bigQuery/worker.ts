import { Job, Worker } from 'bullmq'

import { connection } from '../connection'
import { logger as parentLogger } from '../logger'

import {
  importBibleBookNames,
  importBibleBooks,
  importBibleCitations,
  importKeywords,
  importLanguageSlugs,
  importVideoChildren,
  importVideoDescriptions,
  importVideoImageAlts,
  importVideoSnippets,
  importVideoStudyQuestions,
  importVideoSubtitles,
  importVideoTitles,
  importVideoVariantDownloads,
  importVideoVariants,
  importVideos
} from './importers'
import { jobName, queueName } from './names'

export async function jobFn(job: Job): Promise<void> {
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
    await importVideoTitles(logger),
    await importVideoDescriptions(logger),
    await importVideoImageAlts(logger),
    await importVideoSnippets(logger),
    await importVideoStudyQuestions(logger),
    await importVideoVariants(logger),
    await importVideoSubtitles(logger),
    await importVideoChildren(logger),
    // depends on bibleBooks and videos
    await importBibleCitations(logger),
    // depends on videoVariants
    await importVideoVariantDownloads(logger)
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
