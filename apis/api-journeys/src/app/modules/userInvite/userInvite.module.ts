import { BullModule } from '@nestjs/bullmq'
import { Global, Module } from '@nestjs/common'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { CaslAuthModule } from '../../lib/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'

import { UserInviteResolver } from './userInvite.resolver'
import { UserInviteService } from './userInvite.service'

@Global()
@Module({
  imports: [
    CaslAuthModule.register(AppCaslFactory),
    BullModule.registerQueue({ name: 'api-journeys-email' })
  ],
  providers: [UserInviteResolver, PrismaService, UserInviteService],
  exports: [UserInviteService]
})
export class UserInviteModule {}
