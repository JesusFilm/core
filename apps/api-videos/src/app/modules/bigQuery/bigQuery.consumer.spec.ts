import { Test, TestingModule } from '@nestjs/testing'
import { Job } from 'bullmq'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { ImporterVideoDescriptionService } from '../importer/importerVideoDescriptions/importerVideoDescriptions.service'
import { ImporterVideosService } from '../importer/importerVideos/importerVideos.service'
import { ImporterVideoStudyQuestionsService } from '../importer/importerVideoStudyQuestions/importerVideoStudyQuestions.service'
import { ImporterVideoTitleService } from '../importer/importerVideoTitles/importerVideoTitle.service'
import { ImporterVideoVariantsService } from '../importer/importerVideoVariants/importerVideoVariants.service'

import { BigQueryConsumer } from './bigQuery.consumer'
import { BigQueryService } from './bigQuery.service'

jest.mock('@google-cloud/bigquery')

describe('BigQueryConsumer', () => {
  const OLD_ENV = { ...process.env } // clone env
  let consumer: BigQueryConsumer,
    bigQueryService: BigQueryService,
    videosService: DeepMockProxy<ImporterVideosService>

  beforeEach(async () => {
    process.env = { ...OLD_ENV } // reset env before test
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BigQueryConsumer,
        BigQueryService,
        {
          provide: ImporterVideosService,
          useValue: mockDeep<ImporterVideosService>()
        },
        {
          provide: ImporterVideoTitleService,
          useValue: mockDeep<ImporterVideoTitleService>()
        },
        {
          provide: ImporterVideoDescriptionService,
          useValue: mockDeep<ImporterVideoDescriptionService>()
        },
        {
          provide: ImporterVideoStudyQuestionsService,
          useValue: mockDeep<ImporterVideoStudyQuestionsService>()
        },
        {
          provide: ImporterVideoVariantsService,
          useValue: mockDeep<ImporterVideoVariantsService>()
        }
      ]
    }).compile()

    consumer = module.get<BigQueryConsumer>(BigQueryConsumer)
    bigQueryService = module.get<BigQueryService>(BigQueryService)
    videosService = module.get<ImporterVideosService>(
      ImporterVideosService
    ) as DeepMockProxy<ImporterVideosService>
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
