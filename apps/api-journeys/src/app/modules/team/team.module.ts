import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { AuthModule } from '@core/nest/common/AuthModule'
import { PrismaService } from '../../lib/prisma.service'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { TeamResolver } from './team.resolver'

@Global()
@Module({
  imports: [DatabaseModule, AuthModule.register(AppCaslFactory)],
  providers: [TeamResolver, PrismaService],
  exports: []
})
export class TeamModule {}
