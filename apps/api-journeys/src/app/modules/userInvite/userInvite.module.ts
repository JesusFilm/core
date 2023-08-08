import { Global, Module } from '@nestjs/common'

import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'

import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { PrismaService } from '../../lib/prisma.service'

import { UserInviteResolver } from './userInvite.resolver'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [UserInviteResolver, PrismaService],
  exports: []
})
export class UserInviteModule {}
