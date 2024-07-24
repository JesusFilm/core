import { type Job, Worker } from 'bullmq'

import { importAudioPreview } from './importers/audioPreviews/audioPreviews'
import { importLanguageNames } from './importers/languageNames/languageNames'
import { importLanguages } from './importers/languages/languages'
import { bullConnection, queueName } from './queue'

export const jobName = 'import-languages'

export const jobFn = async (job: Job) => {
  if (job.name !== jobName) return

  const existingLanguageIds = await importLanguages()
  await importLanguageNames(existingLanguageIds)
  await importAudioPreview(existingLanguageIds)
}

new Worker(queueName, jobFn, {
  connection: bullConnection
})
