import { Module, CacheModule } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { VideoResolver, LanguageWithSlugResolver } from './video.resolver'
import { VideoService } from './video.service'

@Module({
  imports: [DatabaseModule, CacheModule.register()],
  providers: [VideoResolver, VideoService, LanguageWithSlugResolver],
  exports: [VideoService]
})
export class VideoModule {}
