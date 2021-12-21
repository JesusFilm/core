import { Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database'
import { UserResolver } from './user.resolver'
import { UserService } from './user.service'
import { UserJourneyService } from '../userJourney/userJourney.service'

@Module({
  imports: [DatabaseModule],
  providers: [UserResolver, UserService, UserJourneyService],
  exports: [UserService]
})
export class UserModule {}
