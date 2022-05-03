import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { EventService } from './event.service'
import { EventResolver } from './event.resolver'
import { RadioQuestionEventResolver } from './radioQuestion/radioQuestion.resolver'
import { SignUpEventResolver } from './signUp/signUp.resolver'
import { VideoEventResolver } from './video/video.resolver'
import { StepEventResolver } from './step/step.resolver'

@Module({
  imports: [DatabaseModule],
  providers: [
    EventService,
    EventResolver,
    RadioQuestionEventResolver,
    SignUpEventResolver,
    StepEventResolver,
    VideoEventResolver
  ],
  exports: [EventService]
})
export class EventModule {}
