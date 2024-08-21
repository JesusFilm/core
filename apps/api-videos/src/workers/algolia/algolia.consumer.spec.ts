import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '../app/lib/prisma.service'

import { AlgoliaConsumer } from './algolia.consumer'
import { AlgoliaService } from './algolia.service'

describe('AlgoliaConsumer', () => {
  let consumer: AlgoliaConsumer
  let algoliaService: AlgoliaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlgoliaConsumer, AlgoliaService, PrismaService]
    }).compile()

    consumer = module.get<AlgoliaConsumer>(AlgoliaConsumer)
    algoliaService = module.get<AlgoliaService>(AlgoliaService)
  })

  describe('process', () => {
    it('should call syncVideosToAlgolia', async () => {
      algoliaService.syncVideosToAlgolia = jest.fn()

      await consumer.process()

      expect(algoliaService.syncVideosToAlgolia).toHaveBeenCalled()
    })
  })
})
