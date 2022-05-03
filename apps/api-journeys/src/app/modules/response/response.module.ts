import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { ResponseService } from './response.service'
import { ResponseResolver } from './response.resolver'
import { RadioQuestionResponseResolver } from './radioQuestion/radioQuestion.resolver'
import { SignUpResponseResolver } from './signUp/signUp.resolver'
import { VideoResponseResolver } from './video/video.resolver'
import { StepResponseResolver } from './step/step.resolver'

@Module({
  imports: [DatabaseModule],
  providers: [
    ResponseService,
    ResponseResolver,
    RadioQuestionResponseResolver,
    SignUpResponseResolver,
    StepResponseResolver,
    VideoResponseResolver
  ],
  exports: [ResponseService]
})
export class ResponseModule {}
