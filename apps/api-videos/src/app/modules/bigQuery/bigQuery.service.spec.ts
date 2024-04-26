import { BigQuery } from '@google-cloud/bigquery'
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

  describe('bigQueryRowIterator', () => {
    it('should return big query table row', async () => {
      const getQueryResults = jest
        .fn()
        .mockResolvedValue([
          [{ mockKey: 'mockValue' }],
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

      const itr = await service.bigQueryRowIterator(
        'mockDataSetname.mockTableName'
      )
      let res = await itr.next()
      expect(res.done).toBe(false)
      expect(res.value).toStrictEqual({
        mockKey: 'mockValue'
      })
      res = await itr.next()
      expect(res.done).toBe(true)
      expect(res.value).toBeUndefined()
      expect(getQueryResults).toHaveBeenCalledWith({
        maxResults: 500,
        pageToken: undefined
      })
    })

    it('should refetch from bigQuery', async () => {
      const getQueryResults = jest
        .fn()
        .mockResolvedValueOnce([
          [{ mockKey: 'mockValue' }],
          { pageToken: 'mockPageToken' },
          { totalRows: '2' }
        ])
        .mockResolvedValueOnce([
          [{ mockKey: 'mockValueTwo' }],
          { pageToken: undefined },
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

      const itr = await service.bigQueryRowIterator(
        'mockDataSetname.mockTableName'
      )
      let res = await itr.next()
      expect(res.done).toBe(false)
      expect(res.value).toStrictEqual({
        mockKey: 'mockValue'
      })
      // ensure that job was called without the token
      expect(getQueryResults).toHaveBeenCalledWith({
        maxResults: 500,
        pageToken: undefined
      })
      // ensure that job was called without the token
      expect(getQueryResults).not.toHaveBeenCalledWith({
        maxResults: 500,
        pageToken: 'mockPageToken'
      })
      res = await itr.next()
      expect(res.done).toBe(false)
      expect(res.value).toStrictEqual({
        mockKey: 'mockValueTwo'
      })
      // job called with token to refetch queries
      expect(getQueryResults).toHaveBeenCalledWith({
        maxResults: 500,
        pageToken: 'mockPageToken'
      })
    })
  })
})
