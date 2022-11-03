import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { BlockService } from '../block/block.service'
import { JourneyService } from '../journey/journey.service'
import { VisitorService } from '../visitor/visitor.service'
import { EventService } from './event.service'
import { EventResolver } from './event.resolver'
import { ButtonClickEventResolver } from './button/button.resolver'
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
import { StepViewEventResolver } from './step/step.resolver'

@Module({
  imports: [DatabaseModule],
  providers: [
    BlockService,
    JourneyService,
    VisitorService,
    EventService,
    EventResolver,
    ButtonClickEventResolver,
    JourneyViewEventResolver,
    RadioQuestionSubmissionEventResolver,
    SignUpSubmissionEventResolver,
    StepViewEventResolver,
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
