import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'

import { LanguageWithSlugResolver, VideoResolver } from './video.resolver'
import { VideoService } from './video.service'

@Module({
  imports: [CacheModule.register()],
  providers: [
    VideoResolver,
    VideoService,
    LanguageWithSlugResolver,
    PrismaService
  ],
  exports: []
})
export class VideoModule {}
