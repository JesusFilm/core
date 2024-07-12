import { Job, Worker } from 'bullmq'

import { importAudioPreview } from './audioPreviews/audioPreviews'
import { getExistingPrismaLanguageIds } from './languages/languages'
import { bullConnection, importLanguagesQueue } from './queue'

new Worker(
  'api-languages-importer',
  async (job: Job) => {
    if (job.name !== 'import-languages') return

    const languageIds = await getExistingPrismaLanguageIds()
    await importAudioPreview(languageIds)
  },
  {
    connection: bullConnection
  }
)
