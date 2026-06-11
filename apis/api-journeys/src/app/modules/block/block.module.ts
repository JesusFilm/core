import { Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { prismaServiceProvider } from '../../lib/prisma.service'
import { JourneyCustomizableService } from '../journey/journeyCustomizable.service'

import { BlockResolver } from './block.resolver'
import { BlockService } from './block.service'
import { CardBlockResolver } from './card/card.resolver'
import { StepBlockResolver } from './step/step.resolver'
import { VideoBlockResolver } from './video/video.resolver'
import { VideoTriggerResolver } from './videoTrigger/videoTrigger.resolver'

@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [
    BlockService,
    BlockResolver,
    CardBlockResolver,
    JourneyCustomizableService,
    prismaServiceProvider,
    StepBlockResolver,
    VideoBlockResolver,
    VideoTriggerResolver
  ],
  exports: [BlockService]
})
export class BlockModule {}
