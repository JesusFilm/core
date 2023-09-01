import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { SegmindResolver } from './segmind.resolver'

@Module({
  imports: [],
  providers: [SegmindResolver, PrismaService],
  exports: []
})
export class SegmindModule {}
