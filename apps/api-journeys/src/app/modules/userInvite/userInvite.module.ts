import { Global, Module } from '@nestjs/common'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { UserInviteResolver } from './userInvite.resolver'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [UserInviteResolver, PrismaService],
  exports: []
})
export class UserInviteModule {}
