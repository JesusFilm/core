import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { PrismaService } from '../../lib/prisma.service'
import { UserJourneyResolver } from '../userJourney/userJourney.resolver'
import { JourneyService } from '../journey/journey.service'
import { UserInviteResolver } from './userInvite.resolver'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [
    UserInviteResolver,
    UserJourneyResolver,
    PrismaService,
    JourneyService
  ],
  exports: []
})
export class UserInviteModule {}
