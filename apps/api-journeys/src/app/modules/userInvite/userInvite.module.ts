import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { UserJourneyResolver } from '../userJourney/userJourney.resolver'
import { JourneyService } from '../journey/journey.service'
import { UserInviteService } from './userInvite.service'
import { UserInviteResolver } from './userInvite.resolver'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [
    UserInviteService,
    UserInviteResolver,
    UserJourneyResolver,
    JourneyService
  ],
  exports: [UserInviteService]
})
export class UserInviteModule {}
