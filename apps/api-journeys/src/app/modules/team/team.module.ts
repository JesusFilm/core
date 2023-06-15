import { Global, Module } from '@nestjs/common'
import { DatabaseModule } from '@core/nest/database/DatabaseModule'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { TeamResolver } from './team.resolver'

@Global()
@Module({
  imports: [DatabaseModule, CaslAuthModule.register(AppCaslFactory)],
  providers: [TeamResolver, PrismaService],
  exports: []
})
export class TeamModule {}
