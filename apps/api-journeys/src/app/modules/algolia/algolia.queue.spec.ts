import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'

import { AlgoliaQueue } from './algolia.queue'

describe('AlgoliaQueue', () => {
  let queue: AlgoliaQueue
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
        AlgoliaQueue,
        {
          provide: getQueueToken('api-journeys-algolia'),
          useValue: providerQueue
        }
      ]
    })
      .overrideProvider(getQueueToken('api-journeys-algolia'))
      .useValue(providerQueue)
      .compile()

    queue = module.get<AlgoliaQueue>(AlgoliaQueue)
  })

  describe('onModuleInit', () => {
    it('should not schedule a job if no API key', async () => {
      process.env.ALGOLIA_API_KEY = ''
      await queue.onModuleInit()

      expect(providerQueue.getRepeatableJobs).not.toHaveBeenCalled()
    })

    it('should remove existing repeatable job', async () => {
      process.env.ALGOLIA_API_KEY = 'key'
      process.env.ALGOLIA_APPLICATION_ID = 'id'
      process.env.ALGOLIA_INDEX = 'index'
      process.env.DOPPLER_ENVIRONMENT = 'prd'
      providerQueue.getRepeatableJobs = jest
        .fn()
        .mockResolvedValueOnce([{ name: 'api-journeys-algolia', key: 'key' }])
      await queue.onModuleInit()

      expect(providerQueue.removeRepeatableByKey).toHaveBeenCalledWith('key')
    })

    it('should schedule a new job', async () => {
      process.env.ALGOLIA_API_KEY = 'key'
      process.env.ALGOLIA_APPLICATION_ID = 'id'
      process.env.ALGOLIA_INDEX = 'index'
      process.env.DOPPLER_ENVIRONMENT = 'prd'
      providerQueue.getRepeatableJobs = jest.fn().mockResolvedValueOnce([])
      providerQueue.add = jest.fn()
      await queue.onModuleInit()

      expect(providerQueue.add).toHaveBeenCalledWith(
        'api-journeys-algolia',
        {},
        {
          repeat: {
            pattern: '0 0 0 * * *'
          }
        }
      )
    })
  })
})
