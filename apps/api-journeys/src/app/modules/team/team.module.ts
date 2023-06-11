import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { PrismaService } from '../../lib/prisma.service'
import { TeamResolver } from './team.resolver'

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [TeamResolver, PrismaService],
  exports: []
})
export class TeamModule {}
