import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'

import { CrowdinQueue } from './crowdin.queue'

describe('CrowdinQueue', () => {
  let queue: CrowdinQueue
  let providerQueue

  beforeEach(async () => {
    providerQueue = {
      add: jest.fn(),
      getJob: jest.fn(() => ({
        remove: jest.fn()
      })),
      getRepeatableJobs: jest.fn(),
      removeRepeatableByKey: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrowdinQueue,
        {
          provide: getQueueToken('api-videos-crowdin'),
          useValue: providerQueue
        }
      ]
    })
      .overrideProvider(getQueueToken('api-videos-crowdin'))
      .useValue(providerQueue)
      .compile()

    queue = module.get<CrowdinQueue>(CrowdinQueue)
  })

  describe('onModuleInit', () => {
    it('should not schedule a job if no hash', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = ''
      await queue.onModuleInit()

      expect(providerQueue.getRepeatableJobs).not.toHaveBeenCalled()
    })

    it('should remove existing repeatable job', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'
      process.env.NODE_ENV = 'production'
      providerQueue.getRepeatableJobs = jest
        .fn()
        .mockResolvedValueOnce([{ name: 'api-videos-crowdin', key: 'key' }])
      await queue.onModuleInit()

      expect(providerQueue.removeRepeatableByKey).toHaveBeenCalledWith('key')
    })

    it('should schedule a new job', async () => {
      process.env.CROWDIN_DISTRIBUTION_HASH = 'hash'
      process.env.NODE_ENV = 'production'
      providerQueue.getRepeatableJobs = jest.fn().mockResolvedValueOnce([])
      providerQueue.add = jest.fn()
      await queue.onModuleInit()

      expect(providerQueue.add).toHaveBeenCalledWith(
        'api-videos-crowdin',
        {},
        {
          repeat: {
            pattern: '0 0 2 * * *'
          }
        }
      )
    })
  })
})
