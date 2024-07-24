import { type Job, Worker } from 'bullmq'

import { importAudioPreview } from './importers/audioPreviews/audioPreviews'
import { importLanguageNames } from './importers/languageNames/languageNames'
import { importLanguages } from './importers/languages/languages'
import { bullConnection, queueName } from './queue'
import { importCountries } from './importers/countries/countries'
import { importCountryNames } from './importers/countryNames/countryNames'
import { importCountryLanguages } from './importers/countryLanguages/countryLanguages'

export const jobName = 'import-languages'

export const jobFn = async (job: Job) => {
  if (job.name !== jobName) return

  const existingLanguageIds = await importLanguages()
  await importLanguageNames(existingLanguageIds)
  await importAudioPreview(existingLanguageIds)
  const existingCountryIds = await importCountries()
  await importCountryNames(existingLanguageIds, existingCountryIds)
  await importCountryLanguages(existingLanguageIds, existingCountryIds)
}

new Worker(queueName, jobFn, {
  connection: bullConnection
})
