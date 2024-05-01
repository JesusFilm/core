import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { ImporterVideoDescriptionService } from './importerVideoDescriptions/importerVideoDescriptions.service'
import { ImporterVideosService } from './importerVideos/importerVideos.service'
import { ImporterVideoSnippetsService } from './importerVideoSnippets/importerVideoSnippets.service'
import { ImporterVideoStudyQuestionsService } from './importerVideoStudyQuestions/importerVideoStudyQuestions.service'
import { ImporterVideoTitleService } from './importerVideoTitles/importerVideoTitle.service'
import { ImporterVideoVariantDownloadsService } from './importerVideoVariantDownloads/importerVideoVariantDownloads.service'
import { ImporterVideoVariantsService } from './importerVideoVariants/importerVideoVariants.service'

@Module({
  providers: [
    PrismaService,
    ImporterVideosService,
    ImporterVideoTitleService,
    ImporterVideoDescriptionService,
    ImporterVideoStudyQuestionsService,
    ImporterVideoSnippetsService,
    ImporterVideoVariantsService,
    ImporterVideoVariantDownloadsService
  ],
  exports: [
    ImporterVideosService,
    ImporterVideoTitleService,
    ImporterVideoDescriptionService,
    ImporterVideoStudyQuestionsService,
    ImporterVideoSnippetsService,
    ImporterVideoVariantsService,
    ImporterVideoVariantDownloadsService
  ]
})
export class ImporterModule {}
