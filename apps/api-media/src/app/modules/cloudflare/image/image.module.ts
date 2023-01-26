import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { ImageResolver } from './image.resolver'
import { ImageService } from './image.service'

@Module({
  imports: [DatabaseModule],
  providers: [ImageResolver, ImageService],
  exports: [ImageService]
})
export class LanguageModule {}
