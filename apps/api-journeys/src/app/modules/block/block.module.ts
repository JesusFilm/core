import { Module } from '@nestjs/common'

import { DatabaseModule } from '@core/nest/database'
import { BlockService } from './block.service'
import { BlockResolvers } from './block.resolvers'
import { ImageBlockResolvers } from './image/image.resolvers'
import { StepBlockResolvers } from './step/step.resolvers'
import { CardBlockResolvers } from './card/card.resolvers'
import {
  VideoBlockResolvers,
  VideoContentResolvers
} from './video/video.resolvers'

@Module({
  imports: [DatabaseModule],
  providers: [
    BlockService,
    BlockResolvers,
    CardBlockResolvers,
    ImageBlockResolvers,
    StepBlockResolvers,
    VideoBlockResolvers,
    VideoContentResolvers
  ],
  exports: [BlockService]
})
export class BlockModule {}
