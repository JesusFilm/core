import { Module } from '@nestjs/common'

import { DatabaseModule } from '@core/nest/database/DatabaseModule'

import { VideoVariantResolver } from './videoVariant.resolver'

@Module({
  imports: [DatabaseModule],
  providers: [VideoVariantResolver],
  exports: [VideoVariantResolver]
})
export class VideoVariantModule {}
