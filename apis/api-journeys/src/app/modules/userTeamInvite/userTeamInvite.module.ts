import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
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
