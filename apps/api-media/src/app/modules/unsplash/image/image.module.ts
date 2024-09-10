import { Module } from '@nestjs/common'

import { UnsplashImageResolver } from './image.resolver'
import { UnsplashImageService } from './image.service'

@Module({
  imports: [],
  providers: [UnsplashImageResolver, UnsplashImageService],
  exports: [UnsplashImageService]
})
export class UnsplashImageModule {}
