import { Module } from '@nestjs/common'

import { DatabaseModule } from '../database/database.module'
import { RadioQuestionService } from './radio-question.service'
import { RadioQuestionResolvers } from './radio-question.resolvers'
import { BlockService } from '../block/block.service'

@Module({
  imports: [DatabaseModule],
  providers: [RadioQuestionService, RadioQuestionResolvers, BlockService],
  exports: [RadioQuestionService]
})
export class RadioQuestionModule {}
