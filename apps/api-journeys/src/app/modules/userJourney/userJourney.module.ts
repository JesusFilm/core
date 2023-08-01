import { Global, Module } from '@nestjs/common'
import { CaslAuthModule } from '@core/nest/common/CaslAuthModule'
import { PrismaService } from '../../lib/prisma.service'
import { AppCaslFactory } from '../../lib/casl/caslFactory'
import { UserJourneyResolver } from './userJourney.resolver'

@Global()
@Module({
  imports: [CaslAuthModule.register(AppCaslFactory)],
  providers: [UserJourneyResolver, PrismaService],
  exports: []
})
export class UserJourneyModule {}
