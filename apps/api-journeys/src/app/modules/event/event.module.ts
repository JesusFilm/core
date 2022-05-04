import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { EventService } from './event.service'
import { EventResolver } from './event.resolver'
import { RadioQuestionSubmissionEventResolver } from './radioQuestion/radioQuestion.resolver'
import { SignUpSubmissionEventResolver } from './signUp/signUp.resolver'
import { VideoPlayEventResolver } from './video/video.resolver'
import { StepViewEventResolver } from './step/step.resolver'

@Module({
  imports: [DatabaseModule],
  providers: [
    EventService,
    EventResolver,
    RadioQuestionSubmissionEventResolver,
    SignUpSubmissionEventResolver,
    StepViewEventResolver,
    VideoPlayEventResolver
  ],
  exports: [EventService]
})
export class EventModule {}
