import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'

import { EmailEventsService } from '../../lib/emailEventsService'
import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
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
    BullModule.registerQueue({ name: 'api-journeys-analytics-activity' })
  ],
  providers: [
    BlockService,
    VisitorService,
    EventService,
    EventResolver,
    EmailEventsService,
    ButtonClickEventResolver,
    ChatOpenEventResolver,
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
    VideoProgressEventResolver
  ],
  exports: [EventService]
})
export class EventModule {}
