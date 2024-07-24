import { Job, Worker } from 'bullmq'

import { importAudioPreview } from './importers/audioPreviews/audioPreviews'
import { bullConnection, queueName } from './queue'
import { jobFn, jobName } from './worker'
import { importLanguages } from './importers/languages/languages'
import { importLanguageNames } from './importers/languageNames/languageNames'
import { importCountries } from './importers/countries/countries'
import { importCountryNames } from './importers/countryNames/countryNames'
import { importCountryLanguages } from './importers/countryLanguages/countryLanguages'

jest.mock('bullmq')
jest.mock('./importers/languages/languages', () => ({
  getExistingPrismaLanguageIds: jest.fn().mockReturnValue(['1']),
  importLanguages: jest.fn().mockResolvedValue(['1'])
}))

jest.mock('./importers/audioPreviews/audioPreviews', () => ({
  importAudioPreview: jest.fn()
}))

jest.mock('./importers/countries/countries', () => ({
  importCountries: jest.fn().mockResolvedValue(['2'])
}))

jest.mock('./importers/countryLanguages/countryLanguages', () => ({
  importCountryLanguages: jest.fn()
}))

jest.mock('./importers/countryNames/countryNames', () => ({
  importCountryNames: jest.fn()
}))

jest.mock('./importers/languageNames/languageNames', () => ({
  importLanguageNames: jest.fn()
}))

describe('bigquery/worker', () => {
  describe('jobName', () => {
    it('should be import-languages', () => {
      expect(jobName).toBe('import-languages')
    })
  })

  describe('init', () => {
    it('should create a worker', () => {
      import('./worker')
      expect(Worker).toHaveBeenCalledWith(queueName, jobFn, {
        connection: bullConnection
      })
    })
  })

  describe('jobFn', () => {
    it('should not call anything if job name is not import-languages', async () => {
      await jobFn({
        name: 'some-other-job'
      } as unknown as Job)
      expect(importAudioPreview).not.toHaveBeenCalled()
    })

    it('should call importers', async () => {
      await jobFn({
        name: jobName
      } as unknown as Job)
      expect(importAudioPreview).toHaveBeenCalledWith(['1'])
      expect(importLanguages).toHaveBeenCalled()
      expect(importLanguageNames).toHaveBeenCalledWith(['1'])
      expect(importCountries).toHaveBeenCalled()
      expect(importCountryNames).toHaveBeenCalledWith(['1'], ['2'])
      expect(importCountryLanguages).toHaveBeenCalledWith(['1'], ['2'])
    })
  })
})
