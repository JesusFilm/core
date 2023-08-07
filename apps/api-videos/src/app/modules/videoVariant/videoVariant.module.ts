import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { VideoVariantResolver } from './videoVariant.resolver'

@Module({
  imports: [],
  providers: [VideoVariantResolver, PrismaService],
  exports: []
})
export class VideoVariantModule {}
