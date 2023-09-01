import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'
import { ImageService } from '../cloudflare/image/image.service'

import { SegmindResolver } from './segmind.resolver'
import { SegmindService } from './segmind.service'

@Module({
  imports: [],
  providers: [SegmindResolver, ImageService, PrismaService, SegmindService],
  exports: [SegmindService]
})
export class SegmindModule {}
