import { BullModule } from '@nestjs/bullmq'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { IntegrationGrowthSpacesService } from '../integration/growthSpaces/growthSpaces.service'
import { VisitorService } from '../visitor/visitor.service'

import { ChatOpenEventResolver } from './button/button.resolver'
import { EventResolver } from './event.resolver'
import { EventService } from './event.service'
import { JourneyViewEventResolver } from './journey/journey.resolver'
import {
  StepNextEventResolver,
  StepPreviousEventResolver,
  StepViewEventResolver
} from './step/step.resolver'
import {
  VideoCollapseEventResolver,
  VideoCompleteEventResolver,
  VideoExpandEventResolver,
  VideoPauseEventResolver,
  VideoPlayEventResolver,
  VideoProgressEventResolver,
  VideoStartEventResolver
} from './video/video.resolver'

@Module({
  imports: [
    CacheModule.register(),
    BullModule.registerQueue({ name: 'api-journeys-events-email' }),
    CaslAuthModule.register(AppCaslFactory)
  ],
  providers: [
    BlockService,
    ChatOpenEventResolver,
    EventService,
    EventResolver,
    IntegrationGrowthSpacesService,
    JourneyViewEventResolver,
    PrismaService,
    StepViewEventResolver,
    StepNextEventResolver,
    StepPreviousEventResolver,
    VideoStartEventResolver,
    VideoPlayEventResolver,
    VideoPauseEventResolver,
    VideoCompleteEventResolver,
    VideoCollapseEventResolver,
    VideoExpandEventResolver,
    VideoProgressEventResolver,
    VisitorService
  ],
  exports: [EventService]
})
export class EventModule {}
