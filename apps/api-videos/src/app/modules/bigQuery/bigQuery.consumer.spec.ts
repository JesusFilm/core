import { BigQuery } from '@google-cloud/bigquery'
import { Test, TestingModule } from '@nestjs/testing'
import { Job } from 'bullmq'
import { mockDeep } from 'jest-mock-extended'

import { addTableToPrisma } from '../../../libs/bigQueryTables/addTableToPrisma'
import { PrismaService } from '../../lib/prisma.service'

import { BigQueryConsumer } from './bigQuery.consumer'
import { BigQueryService } from './bigQuery.service'

jest.mock('../../../libs/bigQueryTables/addTableToPrisma')

jest.mock('@google-cloud/bigquery')

describe('BigQueryConsumer', () => {
  const OLD_ENV = { ...process.env } // clone env
  let consumer: BigQueryConsumer
  let bigQueryService: BigQueryService

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
  })

  afterAll(() => {
    jest.resetModules()
    process.env = OLD_ENV // restore old env
  })

  describe('process', () => {
    it('should call bigQueryRowIterator', async () => {
      bigQueryService.bigQueryRowIterator = jest.fn(
        async () =>
          await Promise.resolve({
            next: jest.fn(
              async () =>
                await Promise.resolve({ done: true, value: 'someValue' })
            )
          })
      )

      await consumer.process({ name: 'mockjob' } as unknown as Job)
      expect(bigQueryService.bigQueryRowIterator).toHaveBeenCalled()
    })

    it('should call load function', async () => {
      const getQueryResults = jest
        .fn()
        .mockResolvedValueOnce([
          [{ mockKey: 'mockValue' }],
          { pageToken: 'mockPageToken' }
        ])
        .mockResolvedValueOnce([
          [{ mockKey: 'mockValueTwo' }],
          { pageToken: undefined }
        ])

      process.env.BIG_QUERY_PRIVATE_KEY = 'someKey'
      jest
        .spyOn(BigQuery.prototype, 'createQueryJob')
        .mockImplementation(() => [
          {
            getQueryResults
          }
        ])

      await consumer.process({ name: 'mockjobTwo' } as unknown as Job)
      expect(addTableToPrisma).toHaveBeenCalled()
    })
  })
})
