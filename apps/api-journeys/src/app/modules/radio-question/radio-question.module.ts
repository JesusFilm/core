import { Module } from '@nestjs/common'

import { DatabaseModule } from '../database/database.module'
import { RadioQuestionResolvers } from './radio-question.resolvers'
import { ResponseService } from '../response/response.service'

@Module({
  imports: [DatabaseModule],
  providers: [RadioQuestionResolvers, ResponseService],
  exports: []
})
export class RadioQuestionModule {}
