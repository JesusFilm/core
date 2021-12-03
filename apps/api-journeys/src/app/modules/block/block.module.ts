import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { BlockService } from './block.service';
import { BlockResolvers } from './block.resolvers';
import { VideoModule } from './video/video.module';
import { ImageBlockResolvers } from './image/image.resolvers';

@Module({
  imports: [DatabaseModule, VideoModule],
  providers: [BlockService, BlockResolvers, ImageBlockResolvers],
  exports: [BlockService],
})
export class BlockModule {
}
