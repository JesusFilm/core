import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { JourneyProfileService } from './journeyProfile.service'
import { JourneyProfileResolver } from './journeyProfile.resolver'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [JourneyProfileService, JourneyProfileResolver],
  exports: [JourneyProfileService]
})
export class JourneyProfileModule {}
