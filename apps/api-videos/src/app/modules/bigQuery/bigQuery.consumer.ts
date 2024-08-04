import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import get from 'lodash/get'

import { PrismaService } from '../../lib/prisma.service'
import { ImporterService } from '../importer/importer.service'
import { ImporterBibleBookNamesService } from '../importer/importerBibleBookNames/importerBibleBookNames.service'
import { ImporterBibleBooksService } from '../importer/importerBibleBooks/importerBibleBooks.service'
import { ImporterBibleCitationsService } from '../importer/importerBibleCitations/importerBibleCitations.service'
import { ImporterKeywordsService } from '../importer/importerKeywords/importerKeywords.service'
import { ImporterVideosService } from '../importer/importerVideos/importerVideos.service'
import { ImporterVideoSubtitlesService } from '../importer/importerVideoSubtitle/importerVideoSubtitle.service'
import { ImporterVideoVariantsService } from '../importer/importerVideoVariants/importerVideoVariants.service'

import { BigQueryService } from './bigQuery.service'

interface BigQueryRowError {
  bigQueryTableName: string
  id: string
  message: string
}
@Processor('api-videos-arclight')
export class BigQueryConsumer extends WorkerHost {
  tables: Array<{
    table: string
    service: ImporterService<unknown>
    hasUpdatedAt: boolean
  }> = []

  constructor(
    private readonly prismaService: PrismaService,
    private readonly bigQueryService: BigQueryService,
    private readonly importerVideosService: ImporterVideosService,
    private readonly importerVideoVariantsService: ImporterVideoVariantsService,
    private readonly importerVideoSubtitleService: ImporterVideoSubtitlesService,
    private readonly importerBibleBooksService: ImporterBibleBooksService,
    private readonly importerBibleBookNamesService: ImporterBibleBookNamesService,
    private readonly importerBibleCitationsService: ImporterBibleCitationsService,
    private readonly importerKeywordsService: ImporterKeywordsService
  ) {
    super()
    this.tables = [
      {
        table:
          'jfp-data-warehouse.jfp_mmdb_prod.core_videoVariantSubtitles_arclight_data',
        service: this.importerVideoSubtitleService,
        hasUpdatedAt: true
      },
      {
        table: 'jfp-data-warehouse.jfp_mmdb_prod.core_bibleBooks_arclight_data',
        service: this.importerBibleBooksService,
        hasUpdatedAt: false
      },
      {
        table:
          'jfp-data-warehouse.jfp_mmdb_prod.core_bibleBookDescriptors_arclight_data',
        service: this.importerBibleBookNamesService,
        hasUpdatedAt: false
      },
      {
        table:
          'jfp-data-warehouse.jfp_mmdb_prod.core_videoBibleCitation_arclight_data',
        service: this.importerBibleCitationsService,
        hasUpdatedAt: true
      },
      {
        table: 'jfp-data-warehouse.jfp_mmdb_prod.core_keywords_arclight_data',
        service: this.importerKeywordsService,
        hasUpdatedAt: true
      }
    ]
  }

  async process(_job: Job): Promise<void> {
    await this.importerVideosService.getUsedSlugs()
    await this.importerVideoVariantsService.getExistingIds()

    await this.importerBibleBooksService.getExistingIds()

    // eslint-disable-next-line @typescript-eslint/no-for-in-array
    for (const index in this.tables) {
      try {
        const {
          table: bigQueryTableName,
          service,
          hasUpdatedAt
        } = this.tables[index]
        await this.processTable(bigQueryTableName, service, hasUpdatedAt)
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message)
        }
      }
    }

    // cleanup for future runs
    this.importerVideosService.usedSlugs = undefined
    this.importerVideosService.ids = []
    this.importerVideoVariantsService.ids = []
    this.importerBibleBooksService.ids = []
  }

  async processTable(
    bigQueryTableName: string,
    service: ImporterService<unknown>,
    hasUpdatedAt: boolean
  ): Promise<void> {
    const errors: BigQueryRowError[] = []
    const importTime = await this.prismaService.importTimes.findUnique({
      where: { modelName: bigQueryTableName }
    })
    const updateTime = await this.bigQueryService.getCurrentTimeStamp()
    if (importTime != null || !hasUpdatedAt) {
      for await (const row of this.bigQueryService.getRowsFromTable(
        bigQueryTableName,
        importTime?.lastImport,
        hasUpdatedAt
      )) {
        try {
          await service.import(row)
        } catch (error) {
          errors.push({
            bigQueryTableName,
            id: get(row, 'id') ?? get(row, 'videoId'),
            message: error.message
          })
        }
      }
    } else {
      let page = 0
      console.log('mass importing', bigQueryTableName)
      for await (const rows of this.bigQueryService.getRowsFromTable(
        bigQueryTableName,
        undefined,
        hasUpdatedAt,
        false
      )) {
        try {
          page++
          console.log('importing', rows.length, 'page', page, bigQueryTableName)
          await service.importMany(rows as unknown[])
        } catch (error) {
          console.log('error', error)
        }
      }
    }
    await this.prismaService.importTimes.upsert({
      where: { modelName: bigQueryTableName },
      create: {
        modelName: bigQueryTableName,
        lastImport: updateTime
      },
      update: { lastImport: updateTime }
    })

    console.log(`finished processing ${bigQueryTableName}`, errors)
  }
}
