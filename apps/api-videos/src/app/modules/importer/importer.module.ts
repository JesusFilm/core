import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { ImporterVideosService } from './importerVideos/importerVideos.service'
import { ImporterVideoTitleService } from './importerVideoTitles/importerVideoTitle.service'
import { ImporterVideoVariantsService } from './importerVideoVariants/importerVideoVariants.service'

@Module({
  providers: [
    PrismaService,
    ImporterVideosService,
    ImporterVideoTitleService,
    ImporterVideoVariantsService
  ],
  exports: [
    ImporterVideosService,
    ImporterVideoTitleService,
    ImporterVideoVariantsService
  ]
})
export class ImporterModule {}
