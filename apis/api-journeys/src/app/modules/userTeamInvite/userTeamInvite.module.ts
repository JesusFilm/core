import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { UserTeamInviteResolver } from './userTeamInvite.resolver'
import { UserTeamInviteService } from './userTeamInvite.service'

@Global()
@Module({
  imports: [
    CaslAuthModule.register(AppCaslFactory),
    BullModule.registerQueue({ name: 'api-journeys-email' })
  ],
  providers: [UserTeamInviteResolver, PrismaService, UserTeamInviteService],
  exports: [UserTeamInviteResolver, UserTeamInviteService]
})
export class UserTeamInviteModule {}
