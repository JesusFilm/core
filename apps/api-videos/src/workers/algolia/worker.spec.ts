import { Job } from 'bullmq'

import { exportToAlgolia } from './exporter'
import { jobName } from './names'
import { jobFn } from './worker'

jest.mock('./exporter', () => ({
  exportToAlgolia: jest.fn()
}))

describe('algolia/worker', () => {
  describe('jobFn', () => {
    it(`should not call anything if job name is not ${jobName}`, async () => {
      await jobFn({
        name: 'some-other-job'
      } as unknown as Job)
      expect(exportToAlgolia).not.toHaveBeenCalled()
    })

    it('should call importers', async () => {
      await jobFn({
        name: jobName
      } as unknown as Job)
      expect(exportToAlgolia).toHaveBeenCalled()
    })
  })
})
