import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { BlockService } from '../block/block.service'
import { DateTimeScalar } from '../../lib/dateTime/dateTime.provider'
import { ChatWidgetsResolver } from '../chatWidget/chatWidgets.resolver'
import { JourneyService } from './journey.service'
import { JourneyResolver } from './journey.resolver'

@Module({
  imports: [DatabaseModule],
  providers: [
    JourneyService,
    JourneyResolver,
    BlockService,
    ChatWidgetsResolver,
    DateTimeScalar
  ],
  exports: [JourneyService]
})
export class JourneyModule {}
