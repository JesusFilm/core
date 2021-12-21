import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { ResponseService } from './response.service'
import { ResponseResolver } from './response.resolvers'
import { RadioQuestionResponseResolver } from './radioQuestion/radioQuestion.resolvers'
import { SignUpResponseResolver } from './signUp/signUp.resolvers'
import { VideoResponseResolver } from './video/video.resolvers'

@Module({
  imports: [DatabaseModule],
  providers: [
    ResponseService,
    ResponseResolver,
    RadioQuestionResponseResolver,
    SignUpResponseResolver,
    VideoResponseResolver
  ],
  exports: [ResponseService]
})
export class ResponseModule {}
