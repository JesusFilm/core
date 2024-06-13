import { Module } from '@nestjs/common'

import { PrismaService } from '../../../lib/prisma.service'

import { ImageResolver as CloudflareImageResolver } from './image.resolver'
import { ImageService as CloudflareImageService } from './image.service'

@Module({
  imports: [],
  providers: [CloudflareImageResolver, CloudflareImageService, PrismaService],
  exports: [CloudflareImageService]
})
export class CloudflareImageModule {}
