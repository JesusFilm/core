import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { ImageResolver } from './image.resolver'

@Module({
  imports: [DatabaseModule],
  providers: [ImageResolver],
  exports: []
})
export class LanguageModule {}
