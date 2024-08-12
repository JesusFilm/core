import { type Job, Worker } from 'bullmq'

import { importAudioPreview } from './importers/audioPreviews/audioPreviews'
import { importCountries } from './importers/countries/countries'
import { importCountryLanguages } from './importers/countryLanguages/countryLanguages'
import { importCountryNames } from './importers/countryNames/countryNames'
import { importLanguageNames } from './importers/languageNames/languageNames'
import { importLanguages } from './importers/languages/languages'
import { bullConnection, queueName } from './queue'

export const jobName = 'import-languages'

export const jobFn = async (job: Job): Promise<void> => {
  if (job.name !== jobName) return

  const existingLanguageIds = await importLanguages()
  await importLanguageNames(existingLanguageIds)
  await importAudioPreview(existingLanguageIds)
  const existingCountryIds = await importCountries()
  await importCountryNames(existingLanguageIds, existingCountryIds)
  await importCountryLanguages(existingLanguageIds, existingCountryIds)
}

// eslint-disable-next-line no-new
new Worker(queueName, jobFn, {
  connection: bullConnection
})
