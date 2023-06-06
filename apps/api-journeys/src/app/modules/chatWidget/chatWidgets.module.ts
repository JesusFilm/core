import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { JourneyService } from '../journey/journey.service'

// update with the right resolvers and service
@Global()
@Module({
  imports: [DatabaseModule],
  providers: [JourneyService],
  exports: []
})
export class ChatWidgetModule {}
