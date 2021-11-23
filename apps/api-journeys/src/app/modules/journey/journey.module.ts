import { Module } from '@nestjs/common'

import { DatabaseModule } from '../database/database.module'
import { JourneyService } from './journey.service'
import { JourneyResolvers } from './journey.resolvers'
import { BlockService } from '../block/block.service'

@Module({
  imports: [DatabaseModule],
  providers: [JourneyService, JourneyResolvers, BlockService],
  exports: [JourneyService]
})
export class JourneyModule {}
