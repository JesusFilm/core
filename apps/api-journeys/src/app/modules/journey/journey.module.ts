import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { BlockService } from '../block/block.service'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { JourneyService } from './journey.service'
import { JourneyResolvers } from './journey.resolvers'

@Module({
  imports: [DatabaseModule],
  providers: [JourneyService, JourneyResolvers, BlockService, DateTimeScalar],
  exports: [JourneyService]
})
export class JourneyModule {}
