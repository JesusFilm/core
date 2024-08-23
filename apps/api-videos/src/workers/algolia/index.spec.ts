import { jobName } from './names'
import { queue } from './queue'

import { main } from '.'

jest.mock('bullmq')
jest.mock('./queue', () => ({
  queue: {
    add: jest.fn()
  }
}))

describe('algolia', () => {
  describe('main', () => {
    it('should add new job', async () => {
      await main()
      expect(queue.add).toHaveBeenCalledWith(
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
