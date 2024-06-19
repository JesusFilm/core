import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import get from 'lodash/get'

import { PrismaService } from '../../lib/prisma.service'
import { ImporterService } from '../importer/importer.service'
import { ImporterVideoDescriptionService } from '../importer/importerVideoDescriptions/importerVideoDescriptions.service'
import { ImporterVideoImageAltService } from '../importer/importerVideoImageAlt/importerVideoImageAlt.service'
import { ImporterVideoSnippetsService } from '../importer/importerVideoSnippets/importerVideoSnippets.service'
import { ImporterVideoStudyQuestionsService } from '../importer/importerVideoStudyQuestions/importerVideoStudyQuestions.service'
import { ImporterVideoTitleService } from '../importer/importerVideoTitles/importerVideoTitle.service'
import { ImporterVideoVariantDownloadsService } from '../importer/importerVideoVariantDownloads/importerVideoVariantDownloads.service'
import { ImporterVideoVariantSubtitlesService } from '../importer/importerVideoVariantSubtitle/importerVideovariantSubtitle.service'
import { ImporterVideoVariantsService } from '../importer/importerVideoVariants/importerVideoVariants.service'
import { ImporterVideosService } from '../importer/importerVideos/importerVideos.service'
import { ImporterVideosChildrenService } from '../importer/importerVideosChildren/importerVideosChildren.service'

import { importerBibleBooksService } from '../importer/importerBibleBooks/importerBibleBooks.service'
import { BigQueryService } from './bigQuery.service'

interface BigQueryRowError {
  bigQueryTableName: string
  id: string
  message: string
}
@Processor('api-videos-arclight')
export class BigQueryConsumer extends WorkerHost {
  tables: Record<string, ImporterService<unknown>> = {}

  constructor(
    private readonly prismaService: PrismaService,
    private readonly bigQueryService: BigQueryService,
    private readonly importerVideosService: ImporterVideosService,
    private readonly importerVideoTitleService: ImporterVideoTitleService,
    private readonly importerVideoDescriptionService: ImporterVideoDescriptionService,
    private readonly importerVideoStudyQuestionsService: ImporterVideoStudyQuestionsService,
    private readonly importerVideoSnippetsService: ImporterVideoSnippetsService,
    private readonly importerVideoVariantsService: ImporterVideoVariantsService,
    private readonly importerVideoImageAltService: ImporterVideoImageAltService,
    private readonly importerVideoVariantsDownloadService: ImporterVideoVariantDownloadsService,
    private readonly importerVideoVariantsSubtitleService: ImporterVideoVariantSubtitlesService,
    private readonly importerVideosChildrenService: ImporterVideosChildrenService,
    private readonly importerBibleBooksService: importerBibleBooksService
  ) {
    super()
    this.tables = {
      // 'jfp-data-warehouse.jfp_mmdb_prod.core_video_arclight_data':
      //   this.importerVideosService,
      // 'jfp-data-warehouse.jfp_mmdb_prod.core_videoTitle_arclight_data':
      //   this.importerVideoTitleService,
      // 'jfp-data-warehouse.jfp_mmdb_prod.core_videoDescription_arclight_data':
      //   this.importerVideoDescriptionService,
      // 'jfp-data-warehouse.jfp_mmdb_prod.core_videoStudyQuestions_arclight_data':
      //   this.importerVideoStudyQuestionsService,
      // 'jfp-data-warehouse.jfp_mmdb_prod.core_videoSnippet_arclight_data':
      //   this.importerVideoSnippetsService,
      // 'jfp-data-warehouse.jfp_mmdb_prod.core_videoImageAlt_arclight_data':
      //   this.importerVideoImageAltService,
      // 'jfp-data-warehouse.jfp_mmdb_prod.core_videoVariant_arclight_data':
      //   this.importerVideoVariantsService,
      // 'jfp-data-warehouse.jfp_mmdb_prod.core_videoVariantDownload_arclight_data':
      //   this.importerVideoVariantsDownloadService,
      'jfp-data-warehouse.jfp_mmdb_prod.new_core_bibleBooks_arclight_data':
        this.importerBibleBooksService
      // 'jfp-data-warehouse.jfp_mmdb_prod.core_videoVariantSubtitles_arclight_data':
      //   this.importerVideoVariantsSubtitleService
    }
  }

  async process(_job: Job): Promise<void> {
    await this.importerVideosService.getUsedSlugs()
    await this.importerVideoVariantsService.getExistingIds()

    for (const [bigQueryTableName, service] of Object.entries(this.tables)) {
      await this.processTable(bigQueryTableName, service)
    }

    // cleanup for future runs
    this.importerVideosService.usedSlugs = undefined
    this.importerVideosService.ids = []
    this.importerVideoVariantsService.ids = []

    await this.importerVideosChildrenService.process()
    console.log('finished processing children')
  }

  async processTable(
    bigQueryTableName: string,
    service: ImporterService<any>
  ): Promise<void> {
    const errors: BigQueryRowError[] = []
    const importTime = await this.prismaService.importTimes.findUnique({
      where: { modelName: bigQueryTableName }
    })
    // const updateTime = new Date()
    if (importTime != null) {
      for await (const row of this.bigQueryService.getRowsFromTable(
        bigQueryTableName,
        importTime.lastImport
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
      console.log('importing', bigQueryTableName)
      for await (const rows of this.bigQueryService.getRowsFromTable(
        bigQueryTableName,
        undefined,
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
    // await this.prismaService.importTimes.upsert({
    //   where: { modelName: bigQueryTableName },
    //   create: { modelName: bigQueryTableName, lastImport: updateTime },
    //   update: { lastImport: updateTime }
    // })

    console.log(`finished processing ${bigQueryTableName}`, errors)
  }
}
