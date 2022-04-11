import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { VideoTagResolver } from './tag.resolver'
import { VideoTagService } from './tag.service'

@Module({
  imports: [DatabaseModule],
  providers: [VideoTagResolver, VideoTagService],
  exports: [VideoTagService]
})
export class VideoTagModule {}
