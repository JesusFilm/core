import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
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
  VideoPuaseEventResolver,
  VideoCompleteEventResolver,
  VideoCollapseEventResolver,
  VideoExpandEventResolver,
  VideoProgressEventResolver
} from './video/video.resolver'
import {
  StepViewEventResolver,
  StepNextEventResolver
} from './step/step.resolver'
import {
  TemplateLibraryViewEventResolver,
  TemplateUseEventResolver,
  TemplatePreviewEventResolver
} from './template/template.resolver'

@Module({
  imports: [DatabaseModule],
  providers: [
    EventService,
    EventResolver,
    ButtonClickEventResolver,
    JourneyViewEventResolver,
    RadioQuestionSubmissionEventResolver,
    SignUpSubmissionEventResolver,
    StepViewEventResolver,
    StepNextEventResolver,
    TextResponseSubmissionEventResolver,
    VideoStartEventResolver,
    VideoPlayEventResolver,
    VideoPuaseEventResolver,
    VideoCompleteEventResolver,
    VideoCollapseEventResolver,
    VideoExpandEventResolver,
    VideoProgressEventResolver,
    TemplateLibraryViewEventResolver,
    TemplateUseEventResolver,
    TemplatePreviewEventResolver
  ],
  exports: [EventService]
})
export class EventModule {}
