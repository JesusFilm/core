import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { EventService } from './event.service'
import { EventResolver } from './event.resolver'
import { RadioQuestionResponseResolver } from './radioQuestion/radioQuestion.resolver'
import { SignUpResponseResolver } from './signUp/signUp.resolver'
import { VideoResponseResolver } from './video/video.resolver'
import { StepResponseResolver } from './step/step.resolver'

@Module({
  imports: [DatabaseModule],
  providers: [
    EventService,
    EventResolver,
    RadioQuestionResponseResolver,
    SignUpResponseResolver,
    StepResponseResolver,
    VideoResponseResolver
  ],
  exports: [EventService]
})
export class ResponseModule {}
