import { BullModule } from '@nestjs/bullmq'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { IntegrationGrowthSpacesService } from '../integration/growthSpaces/growthSpaces.service'
import { VisitorService } from '../visitor/visitor.service'

import {
  ButtonClickEventResolver,
  ChatOpenEventResolver
} from './button/button.resolver'
import { EventResolver } from './event.resolver'
import { EventService } from './event.service'
import { JourneyViewEventResolver } from './journey/journey.resolver'
import { RadioQuestionSubmissionEventResolver } from './radioQuestion/radioQuestion.resolver'
import { SignUpSubmissionEventResolver } from './signUp/signUp.resolver'
import {
  StepNextEventResolver,
  StepPreviousEventResolver,
  StepViewEventResolver
} from './step/step.resolver'
import { TextResponseSubmissionEventResolver } from './textResponse/textResponse.resolver'
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
    ButtonClickEventResolver,
    ChatOpenEventResolver,
    EventService,
    EventResolver,
    IntegrationGrowthSpacesService,
    JourneyViewEventResolver,
    PrismaService,
    RadioQuestionSubmissionEventResolver,
    SignUpSubmissionEventResolver,
    StepViewEventResolver,
    StepNextEventResolver,
    StepPreviousEventResolver,
    TextResponseSubmissionEventResolver,
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
