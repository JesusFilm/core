import { Module } from '@nestjs/common'

import { DatabaseModule } from '@core/nest/database'
import { BlockService } from './block.service'
import { BlockResolvers } from './block.resolvers'
import { CardBlockResolvers } from './card/card.resolvers'
import { ImageBlockResolvers } from './image/image.resolvers'
import { SignUpBlockResolvers } from './signUp/signUp.resolvers'
import { StepBlockResolvers } from './step/step.resolvers'
import { TypographyBlockResolvers } from './typography/typography.resolvers'
import {
  VideoArclightResolvers,
  VideoBlockResolvers,
  VideoContentResolvers
} from './video/video.resolvers'
import { ButtonBlockResolvers } from './button/button.resolvers'
import {
  RadioOptionBlockResolvers,
  RadioQuestionBlockResolvers
} from './radioQuestion/radioQuestion.resolvers'

@Module({
  imports: [DatabaseModule],
  providers: [
    BlockService,
    BlockResolvers,
    ButtonBlockResolvers,
    CardBlockResolvers,
    ImageBlockResolvers,
    RadioOptionBlockResolvers,
    RadioQuestionBlockResolvers,
    SignUpBlockResolvers,
    StepBlockResolvers,
    TypographyBlockResolvers,
    VideoBlockResolvers,
    VideoContentResolvers,
    VideoArclightResolvers
  ],
  exports: [BlockService]
})
export class BlockModule {}
