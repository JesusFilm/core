import { Test, TestingModule } from '@nestjs/testing'
import { Job } from 'bullmq'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { PrismaService } from '../../lib/prisma.service'
import { ImporterBibleBooksService } from '../importer/importerBibleBooks/importerBibleBooks.service'
import { ImporterBibleCitationsService } from '../importer/importerBibleCitations/importerBibleCitations.service'
import { ImporterVideoSubtitlesService } from '../importer/importerVideoSubtitle/importerVideoSubtitle.service'
import { ImporterVideoVariantsService } from '../importer/importerVideoVariants/importerVideoVariants.service'
import { ImporterVideosService } from '../importer/importerVideos/importerVideos.service'

import { ImporterBibleBookNamesService } from '../importer/importerBibleBookNames/importerBibleBookNames.service'
import { BigQueryConsumer } from './bigQuery.consumer'
import { BigQueryService } from './bigQuery.service'

jest.mock('@google-cloud/bigquery')

describe('BigQueryConsumer', () => {
  const OLD_ENV = { ...process.env } // clone env
  let consumer: BigQueryConsumer,
    bigQueryService: BigQueryService,
    videosService: DeepMockProxy<ImporterVideosService>,
    prisma: DeepMockProxy<PrismaService>

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
          provide: ImporterVideoSubtitlesService,
          useValue: mockDeep<ImporterVideoSubtitlesService>()
        },
        {
          provide: ImporterVideoVariantsService,
          useValue: mockDeep<ImporterVideoVariantsService>()
        },
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>()
        },
        {
          provide: ImporterBibleBooksService,
          useValue: mockDeep<ImporterBibleBooksService>()
        },
        {
          provide: ImporterBibleCitationsService,
          useValue: mockDeep<ImporterBibleCitationsService>()
        },
        {
          provide: ImporterBibleBookNamesService,
          useValue: mockDeep<ImporterBibleBookNamesService>()
        },
        {
          provide: ImporterKeywordsService,
          useValue: mockDeep<ImporterKeywordsService>()
        }
      ]
    }).compile()

    consumer = module.get<BigQueryConsumer>(BigQueryConsumer)
    bigQueryService = module.get<BigQueryService>(BigQueryService)
    videosService = module.get<ImporterVideosService>(
      ImporterVideosService
    ) as DeepMockProxy<ImporterVideosService>
    prisma = module.get<PrismaService>(
      PrismaService
    ) as DeepMockProxy<PrismaService>
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
      prisma.importTimes.findUnique.mockResolvedValue({
        modelName: '',
        lastImport: new Date()
      })
      prisma.importTimes.upsert.mockResolvedValue({
        modelName: '',
        lastImport: new Date()
      })
      bigQueryService.getRowsFromTable = jest.fn(async function* generator() {
        for (let index = 0; index < data.length; index++) {
          yield data[index]
        }
      })
      bigQueryService.getCurrentTimeStamp = jest
        .fn()
        .mockResolvedValue('mockCurrentTime')
      videosService.import.mockResolvedValue()
      await consumer.process({ name: 'mockjob' } as unknown as Job)
      expect(bigQueryService.getRowsFromTable).toHaveBeenCalled()
      expect(prisma.importTimes.upsert).toHaveBeenCalledWith({
        create: {
          lastImport: 'mockCurrentTime',
          modelName:
            'jfp-data-warehouse.jfp_mmdb_prod.core_videoVariantSubtitles_arclight_data'
        },
        update: {
          lastImport: 'mockCurrentTime'
        },
        where: {
          modelName:
            'jfp-data-warehouse.jfp_mmdb_prod.core_videoVariantSubtitles_arclight_data'
        }
      })
    })
  })
})
