import { BigQuery, RowMetadata } from '@google-cloud/bigquery'
import { Test, TestingModule } from '@nestjs/testing'

import { BigQueryService } from './bigQuery.service'

jest.mock('@google-cloud/bigquery')

describe('bigQueryService', () => {
  const OLD_ENV = { ...process.env } // clone env
  let service: BigQueryService

  beforeEach(async () => {
    process.env = { ...OLD_ENV } // reset env before test
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [BigQueryService]
    }).compile()

    service = module.get<BigQueryService>(BigQueryService)
  })

  afterAll(() => {
    jest.resetModules()
    process.env = OLD_ENV // restore old env
  })

  describe('getRowsFromTable', () => {
    it('should return big query table row', async () => {
      const getQueryResults = jest
        .fn()
        .mockResolvedValueOnce([
          [{ mockKey: 'mockValue1' }],
          { pageToken: undefined },
          { totalRows: '1' }
        ])
      process.env.BIG_QUERY_PRIVATE_KEY = 'someKey'
      jest
        .spyOn(BigQuery.prototype, 'createQueryJob')
        .mockImplementation(() => [
          {
            getQueryResults
          }
        ])

      for await (const row of service.getRowsFromTable(
        'mockDataSetname.mockTableName',
        undefined,
        true
      )) {
        expect(row).toEqual({
          mockKey: 'mockValue1'
        })
      }
      expect(getQueryResults).toHaveBeenCalledWith({
        maxResults: 5000,
        pageToken: undefined
      })
    })

    it('should refetch from bigQuery', async () => {
      const getQueryResults = jest
        .fn()
        .mockResolvedValueOnce([
          [{ mockKey: 'mockValue0' }, { mockKey: 'mockValue1' }],
          { pageToken: 'mockPageToken' },
          { totalRows: '4' }
        ])
        .mockResolvedValueOnce([
          [{ mockKey: 'mockValue2' }, { mockKey: 'mockValue3' }],
          { pageToken: undefined },
          { totalRows: '4' }
        ])
      process.env.BIG_QUERY_PRIVATE_KEY = 'someKey'
      jest
        .spyOn(BigQuery.prototype, 'createQueryJob')
        .mockImplementation(() => [
          {
            getQueryResults
          }
        ])

      const rows: RowMetadata[] = []
      for await (const row of service.getRowsFromTable(
        'mockDataSetname.mockTableName',
        undefined,
        true
      )) {
        rows.push(row)
      }
      expect(rows).toEqual([
        { mockKey: 'mockValue0' },
        { mockKey: 'mockValue1' },
        { mockKey: 'mockValue2' },
        { mockKey: 'mockValue3' }
      ])

      expect(getQueryResults).toHaveBeenNthCalledWith(1, {
        maxResults: 5000,
        pageToken: undefined
      })
      expect(getQueryResults).toHaveBeenNthCalledWith(2, {
        maxResults: 5000,
        pageToken: 'mockPageToken'
      })
    })
  })

  describe('getCurrentTimeStamp', () => {
    it('should return current timestamp', async () => {
      const query = jest
        .fn()
        .mockResolvedValueOnce([[{ f0_: { value: 'mock' } }]])
      jest.spyOn(BigQuery.prototype, 'query').mockImplementation(query)

      const result = await service.getCurrentTimeStamp()
      expect(result).toBe('mock')
      expect(query).toHaveBeenCalledWith('SELECT CURRENT_TIMESTAMP()')
    })
  })
})
