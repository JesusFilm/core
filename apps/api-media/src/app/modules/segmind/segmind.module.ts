import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { SegmindResolver } from './segmind.resolver'
import { SegmindService } from './segmind.service'

@Module({
  imports: [],
  providers: [SegmindResolver, PrismaService, SegmindService],
  exports: [SegmindService]
})
export class SegmindModule {}
