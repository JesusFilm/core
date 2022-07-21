import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { JourneyService } from '../journey/journey.service'
import { UserRolesService } from './userRoles.service'
import { UserRolesResolver } from './userRoles.resolvers'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [UserRolesService, UserRolesResolver, JourneyService],
  exports: [UserRolesService]
})
export class UserRolesModule {}
