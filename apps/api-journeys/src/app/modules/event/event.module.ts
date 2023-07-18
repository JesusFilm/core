import { Module } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'
import { BlockService } from '../block/block.service'
import { JourneyService } from '../journey/journey.service'
import { VisitorService } from '../visitor/visitor.service'
import { EventService } from './event.service'
import { EventResolver } from './event.resolver'
import {
  ButtonClickEventResolver,
  ChatOpenEventResolver
} from './button/button.resolver'
import { JourneyViewEventResolver } from './journey/journey.resolver'
import { RadioQuestionSubmissionEventResolver } from './radioQuestion/radioQuestion.resolver'
import { SignUpSubmissionEventResolver } from './signUp/signUp.resolver'
import { TextResponseSubmissionEventResolver } from './textResponse/textResponse.resolver'
import {
  VideoStartEventResolver,
  VideoPlayEventResolver,
  VideoPauseEventResolver,
  VideoCompleteEventResolver,
  VideoCollapseEventResolver,
  VideoExpandEventResolver,
  VideoProgressEventResolver
} from './video/video.resolver'
import {
  StepNextEventResolver,
  StepViewEventResolver
} from './step/step.resolver'

@Module({
  imports: [],
  providers: [
    BlockService,
    JourneyService,
    VisitorService,
    EventService,
    EventResolver,
    ButtonClickEventResolver,
    ChatOpenEventResolver,
    JourneyViewEventResolver,
    PrismaService,
    RadioQuestionSubmissionEventResolver,
    SignUpSubmissionEventResolver,
    StepViewEventResolver,
    StepNextEventResolver,
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
