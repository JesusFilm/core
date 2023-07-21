import { Global, Module } from '@nestjs/common'
import { PrismaService } from '../../lib/prisma.service'
import { UserJourneyService } from './userJourney.service'
import { UserJourneyResolver } from './userJourney.resolver'

@Global()
@Module({
  imports: [],
  providers: [UserJourneyService, UserJourneyResolver, PrismaService],
  exports: [UserJourneyService]
})
export class UserJourneyModule {}
