import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { UserTeamService } from './userTeam.service'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [UserTeamService],
  exports: [UserTeamService]
})
export class UserTeamModule {}
