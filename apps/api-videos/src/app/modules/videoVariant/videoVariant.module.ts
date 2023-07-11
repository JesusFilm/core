import { Module } from '@nestjs/common'
import { VideoVariantResolver } from './videoVariant.resolver'

@Module({
  imports: [],
  providers: [VideoVariantResolver],
  exports: []
})
export class VideoVariantModule {}
