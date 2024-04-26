import { Test, TestingModule } from '@nestjs/testing'
import { Job } from 'bullmq'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../lib/prisma.service'

import { BigQueryConsumer } from './bigQuery.consumer'
import { BigQueryService } from './bigQuery.service'

jest.mock('@google-cloud/bigquery')

describe('BigQueryConsumer', () => {
  const OLD_ENV = { ...process.env } // clone env
  let consumer: BigQueryConsumer,
    bigQueryService: BigQueryService,
    prismaService: DeepMockProxy<PrismaService>

  beforeEach(async () => {
    process.env = { ...OLD_ENV } // reset env before test
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BigQueryConsumer,
        BigQueryService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        }
      ]
    }).compile()

    consumer = module.get<BigQueryConsumer>(BigQueryConsumer)
    bigQueryService = module.get<BigQueryService>(BigQueryService)
    prismaService = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
  })

  afterAll(() => {
    jest.resetModules()
    process.env = OLD_ENV // restore old env
  })

  describe('process', () => {
    it('should call rows', async () => {
      bigQueryService.getRowsFromTable = jest.fn(async function* generator() {
        const data = [{ id: 'mockValue0' }, { id: 'mockValue1' }]
        for (let index = 0; index < data.length; index++) {
          yield data[index]
        }
      })

      await consumer.process({ name: 'mockjob' } as unknown as Job)
      expect(bigQueryService.getRowsFromTable).toHaveBeenCalled()
      expect(prismaService.video.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'mockValue0' },
        data: { id: 'mockValue0' }
      })
      expect(prismaService.video.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'mockValue1' },
        data: { id: 'mockValue1' }
      })
    })
  })
})
