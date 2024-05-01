import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { VideosService } from './videos/videos.service'

@Module({
  providers: [PrismaService, VideosService],
  exports: [VideosService]
})
export class ImporterModule {}
