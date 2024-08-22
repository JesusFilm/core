import { Job, Worker } from 'bullmq'

jest.mock('bullmq')
jest.mock('./importers/videos', () => ({
  getExistingPrismaVideoIds: jest.fn().mockReturnValue(['1']),
  importVideos: jest.fn().mockResolvedValue(['1'])
}))

jest.mock('./importers/audioPreviews/audioPreviews', () => ({
  importAudioPreview: jest.fn()
}))

jest.mock('./importers/countries/countries', () => ({
  importCountries: jest.fn().mockResolvedValue(['2'])
}))

jest.mock('./importers/countryVideos/countryVideos', () => ({
  importCountryVideos: jest.fn()
}))

jest.mock('./importers/countryNames/countryNames', () => ({
  importCountryNames: jest.fn()
}))

jest.mock('./importers/videoNames/videoNames', () => ({
  importVideoNames: jest.fn()
}))

jest.mock('./importers/videoSlugs/videoSlugs', () => ({
  importVideoSlugs: jest.fn()
}))

describe('bigquery/worker', () => {
  describe('jobName', () => {
    it('should be import-videos', () => {
      expect(jobName).toBe('import-videos')
    })
  })

  describe('init', () => {
    it('should create a worker', () => {
      // eslint-disable-next-line import/dynamic-import-chunkname
      import('./worker')
      expect(Worker).toHaveBeenCalledWith(queueName, jobFn, {
        connection: bullConnection
      })
    })
  })

  describe('jobFn', () => {
    it('should not call anything if job name is not import-videos', async () => {
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
      expect(importVideos).toHaveBeenCalled()
      expect(importVideoNames).toHaveBeenCalledWith(['1'])
      expect(importCountries).toHaveBeenCalled()
      expect(importCountryNames).toHaveBeenCalledWith(['1'], ['2'])
      expect(importCountryVideos).toHaveBeenCalledWith(['1'], ['2'])
      expect(importVideoSlugs).toHaveBeenCalledWith()
    })
  })
})
