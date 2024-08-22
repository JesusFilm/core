import { jobName } from './names'
import { bigQueryQueue } from './queue'

import { main } from '.'

jest.mock('bullmq')
jest.mock('./queue', () => ({
  bigQueryQueue: {
    add: jest.fn()
  }
}))

describe('bigquery', () => {
  describe('main', () => {
    it('should add new job', async () => {
      await main()
      expect(bigQueryQueue.add).toHaveBeenCalledWith(
        jobName,
        {},
        {
          removeOnComplete: { age: 3600 },
          removeOnFail: { age: 86_400 },
          repeat: { pattern: '0 0 1 * * *' }
        }
      )
    })
  })
})
