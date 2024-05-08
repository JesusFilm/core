import { Test, TestingModule } from '@nestjs/testing'
import { Job } from 'bullmq'

import { PrismaService } from '../../lib/prisma.service'

import { CrowdinConsumer } from './crowdin.consumer'
import { CrowdinService } from './crowdin.service'

describe('CrowdinConsumer', () => {
  let consumer: CrowdinConsumer
  let crowdinService: CrowdinService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CrowdinConsumer, CrowdinService, PrismaService]
    }).compile()

    consumer = module.get<CrowdinConsumer>(CrowdinConsumer)
    crowdinService = module.get<CrowdinService>(CrowdinService)
  })

  describe('process', () => {
    it('should call getCrowdinTranslations', async () => {
      crowdinService.pullTranslations = jest.fn()

      await consumer.process({} as unknown as Job)

      expect(crowdinService.pullTranslations).toHaveBeenCalled()
    })
  })
})
