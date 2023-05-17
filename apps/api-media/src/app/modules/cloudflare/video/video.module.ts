import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { VideoResolver as CloudflareVideoResolver } from './video.resolver'
import { VideoService as CloudflareVideoService } from './video.service'

@Module({
  imports: [DatabaseModule],
  providers: [CloudflareVideoResolver, CloudflareVideoService],
  exports: [CloudflareVideoService]
})
export class CloudflareVideoModule {}
