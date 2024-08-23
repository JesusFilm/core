import { main } from './console'
import { jobName } from './names'
import { queue } from './queue'

jest.mock('./queue', () => ({
  queue: {
    getJobs: jest.fn().mockResolvedValue([
      {
        id: 1,
        name: 'api-videos-algolia-job',
        getState: () => 'waiting',
        isDelayed: () => false
      }
    ]),
    add: jest.fn().mockResolvedValue({ id: 2, getState: () => 'active' }),
    remove: jest.fn()
  }
}))

describe('bigQuery/console', () => {
  describe('main', () => {
    it('should add new job', async () => {
      await main()
      expect(queue.getJobs).toHaveBeenCalled()
      expect(queue.remove).toHaveBeenCalledWith(1)
      expect(queue.add).toHaveBeenCalledWith(
        jobName,
        {},
        {
          removeOnComplete: { age: 3600 },
          removeOnFail: { age: 86_400 }
        }
      )
    })
  })
})
