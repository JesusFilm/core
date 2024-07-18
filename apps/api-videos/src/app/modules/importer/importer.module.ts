import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { ImporterVideoSubtitlesService } from './importerVideoSubtitle/importerVideoSubtitle.service'
import { ImporterVideoVariantsService } from './importerVideoVariants/importerVideoVariants.service'
import { ImporterVideosService } from './importerVideos/importerVideos.service'

@Module({
  providers: [
    PrismaService,
    ImporterVideosService,
    ImporterVideoVariantsService,
    ImporterVideoSubtitlesService
  ],
  exports: [
    ImporterVideosService,
    ImporterVideoVariantsService,
    ImporterVideoSubtitlesService
  ]
})
export class ImporterModule {}
