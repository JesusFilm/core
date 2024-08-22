import { main } from './console'
import { jobName } from './names'
import { bigQueryQueue } from './queue'

jest.mock('./queue', () => ({
  bigQueryQueue: {
    getJobs: jest
      .fn()
      .mockResolvedValue([
        { id: 1, name: 'api-videos-big-query-job', getState: () => 'waiting' }
      ]),
    add: jest.fn(),
    remove: jest.fn()
  }
}))

describe('bigQuery/console', () => {
  describe('main', () => {
    it('should add new job', async () => {
      await main()
      expect(bigQueryQueue.getJobs).toHaveBeenCalled()
      expect(bigQueryQueue.remove).toHaveBeenCalledWith(1)
      expect(bigQueryQueue.add).toHaveBeenCalledWith(
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
