import { main } from './console'
import { importLanguagesQueue } from './queue'

jest.mock('./queue', () => ({
  importLanguagesQueue: {
    getRepeatableJobs: jest
      .fn()
      .mockResolvedValue([{ key: 1, name: 'import-languages' }]),
    add: jest.fn(),
    removeRepeatableByKey: jest.fn()
  }
}))

describe('bigquery/console', () => {
  describe('main', () => {
    it('should add new jobs', async () => {
      await main()
      expect(importLanguagesQueue.getRepeatableJobs).toHaveBeenCalled()
      expect(importLanguagesQueue.removeRepeatableByKey).toHaveBeenCalledWith(1)
      expect(importLanguagesQueue.add).toHaveBeenCalledWith(
        'import-languages',
        {},
        {
          removeOnComplete: {
            age: 3600 // keep up to 1 hour
          },
          removeOnFail: {
            age: 24 * 3600 // keep up to 24 hours
          }
        }
      )
    })
  })
})
