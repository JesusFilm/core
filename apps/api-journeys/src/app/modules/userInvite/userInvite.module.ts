import { Global, Module } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'
import { UserJourneyResolver } from '../userJourney/userJourney.resolver'
import { UserInviteResolver } from './userInvite.resolver'

@Global()
@Module({
  imports: [],
  providers: [UserInviteResolver, UserJourneyResolver, PrismaService],
  exports: []
})
export class UserInviteModule {}
