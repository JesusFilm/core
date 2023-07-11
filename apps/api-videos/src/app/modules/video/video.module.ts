import { Module, CacheModule, Global } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'
import { VideoResolver, LanguageWithSlugResolver } from './video.resolver'
import { VideoService } from './video.service'

@Global()
@Module({
  imports: [CacheModule.register()],
  providers: [
    PrismaService,
    VideoResolver,
    VideoService,
    LanguageWithSlugResolver
  ],
  exports: [VideoService]
})
export class VideoModule {}
