import { Module } from '@nestjs/common'

import { PrismaService } from '../../../lib/prisma.service'

import { VideoResolver as CloudflareVideoResolver } from './video.resolver'
import { VideoService as CloudflareVideoService } from './video.service'

@Module({
  imports: [],
  providers: [CloudflareVideoResolver, CloudflareVideoService, PrismaService],
  exports: [CloudflareVideoService]
})
export class CloudflareVideoModule {}
