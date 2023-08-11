import { Global, Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { UserTeamInviteResolver } from './userTeamInvite.resolver'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [UserTeamInviteResolver, PrismaService],
  exports: [UserTeamInviteResolver]
})
export class UserTeamInviteModule {}
