import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from './block.service'
import { BlockResolver } from './block.resolver'
import { CardBlockResolver } from './card/card.resolver'
import { IconBlockResolver } from './icon/icon.resolver'
import { ImageBlockResolver } from './image/image.resolver'
import { SignUpBlockResolver } from './signUp/signUp.resolver'
import { StepBlockResolver } from './step/step.resolver'
import { TypographyBlockResolver } from './typography/typography.resolver'
import { VideoBlockResolver } from './video/video.resolver'
import { ButtonBlockResolver } from './button/button.resolver'
import {
  RadioOptionBlockResolver,
  RadioQuestionBlockResolver
} from './radioQuestion/radioQuestion.resolver'
import { TextResponseBlockResolver } from './textResponse/textResponse.resolver'
import { VideoTriggerResolver } from './videoTrigger/videoTrigger.resolver'

@Module({
  imports: [],
  providers: [
    BlockService,
    BlockResolver,
    ButtonBlockResolver,
    CardBlockResolver,
    IconBlockResolver,
    ImageBlockResolver,
    PrismaService,
    RadioOptionBlockResolver,
    RadioQuestionBlockResolver,
    SignUpBlockResolver,
    StepBlockResolver,
    TextResponseBlockResolver,
    TypographyBlockResolver,
    VideoBlockResolver,
    VideoTriggerResolver
  ],
  exports: [BlockService]
})
export class BlockModule {}
