import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { TeamService } from './team.service'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [TeamService],
  exports: [TeamService]
})
export class TeamModule {}
