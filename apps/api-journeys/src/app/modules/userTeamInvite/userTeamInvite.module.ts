import { Global, Module } from '@nestjs/common'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { TeamResolver as UserTeamInviteResolver } from './userTeamInvite.resolver'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [UserTeamInviteResolver, PrismaService],
  exports: [UserTeamInviteResolver]
})
export class UserTeamModule {}
