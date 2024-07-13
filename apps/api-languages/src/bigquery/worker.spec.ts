import { Job, Worker } from 'bullmq'
import { jobFn, jobName } from './worker'
import { bullConnection, queueName } from './queue'
import { importAudioPreview } from './importers/audioPreviews/audioPreviews'

jest.mock('bullmq')
jest.mock('./importers/languages/languages', () => ({
  getExistingPrismaLanguageIds: jest.fn().mockReturnValue(['1'])
}))

jest.mock('./importers/audioPreviews/audioPreviews', () => ({
  importAudioPreview: jest.fn()
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

    it('should call importAudioPreview', async () => {
      await jobFn({
        name: jobName
      } as unknown as Job)
      expect(importAudioPreview).toHaveBeenCalledWith(['1'])
    })
  })
})
