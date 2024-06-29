import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { ImporterBibleBooksService } from './importerBibleBooks/importerBibleBooks.service'
import { ImporterVideoDescriptionService } from './importerVideoDescriptions/importerVideoDescriptions.service'
import { ImporterVideoImageAltService } from './importerVideoImageAlt/importerVideoImageAlt.service'
import { ImporterVideoSnippetsService } from './importerVideoSnippets/importerVideoSnippets.service'
import { ImporterVideoStudyQuestionsService } from './importerVideoStudyQuestions/importerVideoStudyQuestions.service'
import { ImporterVideoSubtitlesService } from './importerVideoSubtitle/importerVideoSubtitle.service'
import { ImporterVideoTitleService } from './importerVideoTitles/importerVideoTitle.service'
import { ImporterVideoVariantDownloadsService } from './importerVideoVariantDownloads/importerVideoVariantDownloads.service'
import { ImporterVideoVariantsService } from './importerVideoVariants/importerVideoVariants.service'
import { ImporterVideosService } from './importerVideos/importerVideos.service'
import { ImporterVideosChildrenService } from './importerVideosChildren/importerVideosChildren.service'

@Module({
  providers: [
    PrismaService,
    ImporterVideosService,
    ImporterVideosChildrenService,
    ImporterVideoTitleService,
    ImporterVideoDescriptionService,
    ImporterVideoStudyQuestionsService,
    ImporterVideoSnippetsService,
    ImporterVideoImageAltService,
    ImporterVideoVariantsService,
    ImporterVideoVariantDownloadsService,
    ImporterVideoSubtitlesService,
    ImporterBibleBooksService
  ],
  exports: [
    ImporterVideosService,
    ImporterVideosChildrenService,
    ImporterVideoTitleService,
    ImporterVideoDescriptionService,
    ImporterVideoStudyQuestionsService,
    ImporterVideoSnippetsService,
    ImporterVideoImageAltService,
    ImporterVideoVariantsService,
    ImporterVideoVariantDownloadsService,
    ImporterVideoSubtitlesService,
    ImporterBibleBooksService
  ]
})
export class ImporterModule {}
