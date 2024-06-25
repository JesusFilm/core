import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { VisitorService } from '../visitor/visitor.service'

import { CacheModule } from '@nestjs/cache-manager'
import { IntegrationGrothSpacesService } from '../integration/growthSpaces/growthSpaces.service'
import { IntegrationService } from '../integration/integration.service'
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
    BullModule.registerQueue({ name: 'api-journeys-events-email' })
  ],
  providers: [
    BlockService,
    ButtonClickEventResolver,
    ChatOpenEventResolver,
    EventService,
    EventResolver,
    IntegrationGrothSpacesService,
    IntegrationService,
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
