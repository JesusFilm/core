import { BigQuery } from '@google-cloud/bigquery'
import { Test, TestingModule } from '@nestjs/testing'
import { Job } from 'bullmq'
import { mockDeep } from 'jest-mock-extended'

import { coreVideoArclightData } from '../../../libs/bigQueryTables/coreVideoArclightData/coreVideoArclightData'
import { coreVideoTitleArclightData } from '../../../libs/bigQueryTables/coreVideoTitleArclightData/coreVideoTitleArclightData'
import { coreVideoVariantDownloadData } from '../../../libs/bigQueryTables/coreVideoVariantDownloadData/coreVideoVariantDownloadData'
import { PrismaService } from '../../lib/prisma.service'

import { BigQueryConsumer } from './bigQuery.consumer'
import { BigQueryService } from './bigQuery.service'

jest.mock('@google-cloud/bigquery')
jest.mock(
  '../../../libs/bigQueryTables/coreVideoTitleArclightData/coreVideoTitleArclightData'
)
jest.mock(
  '../../../libs/bigQueryTables/coreVideoArclightData/coreVideoArclightData'
)
jest.mock(
  '../../../libs/bigQueryTables/coreVideoVariantDownloadData/coreVideoVariantDownloadData'
)

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

    it('should call load functions', async () => {
      const getQueryResults = jest
        .fn()
        .mockResolvedValueOnce([
          [{ mockKey: 'mockValue' }, { mockKey: 'mockValueTwo' }],
          { pageToken: 'mockPageToken' },
          { totalRows: '2' }
        ])
        .mockResolvedValueOnce([
          [{ mockKey: 'mockValue' }, { mockKey: 'mockValueTwo' }],
          { pageToken: 'mockPageToken' },
          { totalRows: '2' }
        ])
        .mockResolvedValueOnce([
          [{ mockKey: 'mockValue' }, { mockKey: 'mockValueTwo' }],
          { pageToken: 'mockPageToken' },
          { totalRows: '2' }
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
      expect(coreVideoTitleArclightData).toHaveBeenCalledTimes(2)
      expect(coreVideoArclightData).toHaveBeenCalledTimes(2)
      expect(coreVideoVariantDownloadData).toHaveBeenCalledTimes(2)
    })
  })
})
