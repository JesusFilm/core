import { Module } from '@nestjs/common'

import { DatabaseModule } from '../../lib/database/database.module'
import { BlockService } from './block.service'
import { BlockResolvers } from './block.resolvers'
import { VideoModule } from './video/video.module'
import { ImageBlockResolvers } from './image/image.resolvers'
import { StepBlockResolvers } from './step/step.resolvers'
import { CardBlockResolvers } from './card/card.resolvers'

@Module({
  imports: [DatabaseModule, VideoModule],
  providers: [
    BlockService,
    BlockResolvers,
    CardBlockResolvers,
    ImageBlockResolvers,
    StepBlockResolvers
  ],
  exports: [BlockService],
})
export class BlockModule {
}
