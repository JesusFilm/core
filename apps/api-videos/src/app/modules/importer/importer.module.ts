import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { ImporterVideoDescriptionService } from './importerVideoDescriptions/importerVideoDescriptions.service'
import { ImporterVideosService } from './importerVideos/importerVideos.service'
import { ImporterVideoStudyQuestionsService } from './importerVideoStudyQuestions/importerVideoStudyQuestions.service'
import { ImporterVideoTitleService } from './importerVideoTitles/importerVideoTitle.service'
import { ImporterVideoVariantsService } from './importerVideoVariants/importerVideoVariants.service'

@Module({
  providers: [
    PrismaService,
    ImporterVideosService,
    ImporterVideoTitleService,
    ImporterVideoDescriptionService,
    ImporterVideoStudyQuestionsService,
    ImporterVideoVariantsService
  ],
  exports: [
    ImporterVideosService,
    ImporterVideoTitleService,
    ImporterVideoDescriptionService,
    ImporterVideoStudyQuestionsService,
    ImporterVideoVariantsService
  ]
})
export class ImporterModule {}
