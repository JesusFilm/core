import { getQueueToken } from '@nestjs/bullmq'
import { Test, TestingModule } from '@nestjs/testing'

import { WordPressQueue } from './wordpress.queue'

describe('WordPressQueue', () => {
  let queue: WordPressQueue
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
        WordPressQueue,
        {
          provide: getQueueToken('api-tags-wordpress'),
          useValue: providerQueue
        }
      ]
    })
      .overrideProvider(getQueueToken('api-tags-wordpress'))
      .useValue(providerQueue)
      .compile()

    queue = module.get<WordPressQueue>(WordPressQueue)
  })

  describe('onModuleInit', () => {
    it('should not schedule a job if no application password', async () => {
      process.env.WORDPRESS_APPLICATION_PASSWORD = ''
      await queue.onModuleInit()

      expect(providerQueue.getRepeatableJobs).not.toHaveBeenCalled()
    })

    it('should remove existing repeatable job', async () => {
      process.env.WORDPRESS_APPLICATION_PASSWORD = 'password'
      process.env.WORDPRESS_USER = 'user'
      process.env.NODE_ENV = 'production'
      providerQueue.getRepeatableJobs = jest
        .fn()
        .mockResolvedValueOnce([{ name: 'api-tags-wordpress', key: 'key' }])
      await queue.onModuleInit()

      expect(providerQueue.removeRepeatableByKey).toHaveBeenCalledWith('key')
    })

    it('should schedule a new job', async () => {
      process.env.WORDPRESS_APPLICATION_PASSWORD = 'password'
      process.env.WORDPRESS_USER = 'user'
      process.env.NODE_ENV = 'production'
      await queue.onModuleInit()

      expect(providerQueue.add).toHaveBeenCalledWith('api-tags-wordpress', {})
    })
  })
})
