import { Job, Worker } from 'bullmq'

import { importAudioPreview } from './audioPreviews/audioPreviews'
import { getExistingPrismaLanguageIds } from './languages/languages'

new Worker('api-languages-importer', async (job: Job) => {
  if (job.name !== 'import-languages') return

  const languageIds = await getExistingPrismaLanguageIds()
  await importAudioPreview(languageIds)
})
