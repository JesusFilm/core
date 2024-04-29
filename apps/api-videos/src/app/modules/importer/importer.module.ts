import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { ImporterVideosService } from './importerVideos/importerVideos.service'
import { ImporterVideoTitleService } from './importerVideoTitle/importerVideoTitle.service'

@Module({
  providers: [PrismaService, ImporterVideosService, ImporterVideoTitleService],
  exports: [ImporterVideosService, ImporterVideoTitleService]
})
export class ImporterModule {}
