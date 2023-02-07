import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { ImageResolver as CloudflareImageResolver } from './image.resolver'
import { ImageService as CloudflareImageService } from './image.service'

@Module({
  imports: [DatabaseModule],
  providers: [CloudflareImageResolver, CloudflareImageService],
  exports: [CloudflareImageService]
})
export class CloudflareImageModule {}
