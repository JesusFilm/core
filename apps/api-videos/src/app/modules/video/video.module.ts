import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { TranslationResolver, VideoResolver } from './video.resolver'
import { VideoService } from './video.service'

@Module({
  imports: [DatabaseModule],
  providers: [VideoResolver, VideoService, TranslationResolver],
  exports: [VideoService]
})
export class VideoModule {}
