import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { VideosService } from './videos/videos.service'
import { VideoTitleService } from './videoTitle/videoTitle.service'

@Module({
  providers: [PrismaService, VideosService, VideoTitleService],
  exports: [VideosService, VideoTitleService]
})
export class ImporterModule {}
