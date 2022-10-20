import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { VisitorTeamService } from './visitorTeam.service'
import { VisitorTeamResolver } from './visitorTeam.resolver'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [VisitorTeamService, VisitorTeamResolver],
  exports: [VisitorTeamService]
})
export class VisitorTeamModule {}
