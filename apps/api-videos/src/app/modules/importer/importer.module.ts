import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { ImporterBibleBookNamesService } from './importerBibleBookNames/importerBibleBookNames.service'
import { ImporterBibleBooksService } from './importerBibleBooks/importerBibleBooks.service'
import { ImporterBibleCitationsService } from './importerBibleCitations/importerBibleCitations.service'
import { ImporterVideoSubtitlesService } from './importerVideoSubtitle/importerVideoSubtitle.service'
import { ImporterVideoVariantsService } from './importerVideoVariants/importerVideoVariants.service'
import { ImporterVideosService } from './importerVideos/importerVideos.service'

@Module({
  providers: [
    PrismaService,
    ImporterBibleBooksService,
    ImporterBibleBookNamesService,
    ImporterBibleCitationsService,
    ImporterVideosService,
    ImporterVideoVariantsService,
    ImporterVideoSubtitlesService
  ],
  exports: [
    ImporterBibleBooksService,
    ImporterBibleBookNamesService,
    ImporterBibleCitationsService,
    ImporterVideosService,
    ImporterVideoVariantsService,
    ImporterVideoSubtitlesService
  ]
})
export class ImporterModule {}
