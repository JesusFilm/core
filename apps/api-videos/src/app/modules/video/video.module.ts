import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { VideoResolver } from './video.resolver'
import { VideoService } from './video.service'

@Module({
  imports: [DatabaseModule],
  providers: [VideoResolver, VideoService],
  exports: [VideoService]
})
export class VideoModule {}
