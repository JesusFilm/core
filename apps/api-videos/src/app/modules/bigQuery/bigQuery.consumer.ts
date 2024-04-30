import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import get from 'lodash/get'

import { ImporterService } from '../importer/importer.service'
import { ImporterVideoDescriptionService } from '../importer/importerVideoDescriptions/importerVideoDescriptions.service'
import { ImporterVideosService } from '../importer/importerVideos/importerVideos.service'
import { ImporterVideoSnippetsService } from '../importer/importerVideoSnippets/importerVideoSnippets.service'
import { ImporterVideoStudyQuestionsService } from '../importer/importerVideoStudyQuestions/importerVideoStudyQuestions.service'
import { ImporterVideoTitleService } from '../importer/importerVideoTitles/importerVideoTitle.service'
import { ImporterVideoVariantsService } from '../importer/importerVideoVariants/importerVideoVariants.service'

import { BigQueryService } from './bigQuery.service'

interface BigQueryRowError {
  bigQueryTableName: string
  id: string
  message: string
}
@Processor('api-videos-arclight')
export class BigQueryConsumer extends WorkerHost {
  tables: Record<string, ImporterService> = {}

  constructor(
    private readonly bigQueryService: BigQueryService,
    private readonly importerVideosService: ImporterVideosService,
    private readonly importerVideoTitleService: ImporterVideoTitleService,
    private readonly importerVideoDescriptionService: ImporterVideoDescriptionService,
    private readonly importerVideoStudyQuestionsService: ImporterVideoStudyQuestionsService,
    private readonly importerVideoSnippetsService: ImporterVideoSnippetsService,
    private readonly importerVideoVariantsService: ImporterVideoVariantsService
  ) {
    super()
    this.tables = {
      'jfp-data-warehouse.jfp_mmdb_prod.core_video_arclight_data':
        this.importerVideosService,
      'jfp-data-warehouse.jfp_mmdb_prod.core_videoTitle_arclight_data':
        this.importerVideoTitleService,
      'jfp-data-warehouse.jfp_mmdb_prod.core_videoDescription_arclight_data':
        this.importerVideoDescriptionService,
      'jfp-data-warehouse.jfp_mmdb_prod.core_videoStudyQuestions_arclight_data':
        this.importerVideoStudyQuestionsService,
      'jfp-data-warehouse.jfp_mmdb_prod.core_videoSnippet_arclight_data':
        this.importerVideoSnippetsService,
      'jfp-data-warehouse.jfp_mmdb_prod.core_videoVariant_arclight_data':
        this.importerVideoVariantsService
    }
  }

  async process(_job: Job): Promise<void> {
    for (const [bigQueryTableName, service] of Object.entries(this.tables)) {
      const errors: BigQueryRowError[] = []
      for await (const row of this.bigQueryService.getRowsFromTable(
        bigQueryTableName
      )) {
        try {
          await service.import(row)
        } catch (error) {
          errors.push({
            bigQueryTableName,
            id: get(row, 'id') ?? 'unknownId',
            message: error.message
          })
        }
      }
      console.log(`finished processing ${bigQueryTableName}`, errors)
    }
  }
}
