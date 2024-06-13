import { Test, TestingModule } from '@nestjs/testing'
import { Job } from 'bullmq'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { VideosService } from '../importer/videos/videos.service'

import { BigQueryConsumer } from './bigQuery.consumer'
import { BigQueryService } from './bigQuery.service'

jest.mock('@google-cloud/bigquery')

describe('BigQueryConsumer', () => {
  const OLD_ENV = { ...process.env } // clone env
  let consumer: BigQueryConsumer,
    bigQueryService: BigQueryService,
    videosService: DeepMockProxy<VideosService>

  beforeEach(async () => {
    process.env = { ...OLD_ENV } // reset env before test
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BigQueryConsumer,
        BigQueryService,
        {
          provide: VideosService,
          useValue: mockDeep<VideosService>()
        }
      ]
    }).compile()

    consumer = module.get<BigQueryConsumer>(BigQueryConsumer)
    bigQueryService = module.get<BigQueryService>(BigQueryService)
    videosService = module.get<VideosService>(
      VideosService
    ) as DeepMockProxy<VideosService>
  })

  afterAll(() => {
    jest.resetModules()
    process.env = OLD_ENV // restore old env
  })

  describe('process', () => {
    it('should process rows', async () => {
      const data = [
        { id: 'mockValue0', label: 'shortFilm', primaryLanguageId: 529 },
        { id: 'mockValue1', label: 'shortFilm', primaryLanguageId: 529 }
      ]
      bigQueryService.getRowsFromTable = jest.fn(async function* generator() {
        for (let index = 0; index < data.length; index++) {
          yield data[index]
        }
      })
      videosService.import.mockResolvedValue()
      await consumer.process({ name: 'mockjob' } as unknown as Job)
      expect(bigQueryService.getRowsFromTable).toHaveBeenCalled()
      expect(videosService.import).toHaveBeenCalledWith(data[0])
      expect(videosService.import).toHaveBeenCalledWith(data[1])
    })
  })
})
