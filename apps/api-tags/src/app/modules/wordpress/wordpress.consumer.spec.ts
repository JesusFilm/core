import { Test, TestingModule } from '@nestjs/testing'
import { Job } from 'bullmq'

import { PrismaService } from '../../lib/prisma.service'

import { WordPressConsumer } from './wordpress.consumer'
import { WordPressService } from './wordpress.service'

describe('WordPressConsumer', () => {
  let consumer: WordPressConsumer
  let wordpressService: WordPressService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WordPressConsumer, WordPressService, PrismaService]
    }).compile()

    consumer = module.get<WordPressConsumer>(WordPressConsumer)
    wordpressService = module.get<WordPressService>(WordPressService)
  })

  describe('process', () => {
    it('should call syncTagsToWordPress', async () => {
      wordpressService.syncTagsToWordPress = jest.fn()

      await consumer.process({} as unknown as Job)

      expect(wordpressService.syncTagsToWordPress).toHaveBeenCalled()
    })
  })
})
