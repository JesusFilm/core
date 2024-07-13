import { Job, Worker } from 'bullmq'

import { importAudioPreview } from './importers/audioPreviews/audioPreviews'
import { getExistingPrismaLanguageIds } from './importers/languages/languages'
import { bullConnection, queueName } from './queue'

export const jobName = 'import-languages'

new Worker(
  queueName,
  async (job: Job) => {
    if (job.name !== jobName) return

    const languageIds = await getExistingPrismaLanguageIds()
    await importAudioPreview(languageIds)
  },
  {
    connection: bullConnection
  }
)
